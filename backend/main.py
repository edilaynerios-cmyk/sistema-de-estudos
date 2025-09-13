import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine, Session, select
from typing import Optional, List
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from models import User, Cycle, CycleSubject, StudySession, Review
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token, get_current_user, verify_token

load_dotenv()
app = FastAPI(title="Sistema de Estudos para Concurso", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sistemadeestudos.netlify.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

@app.on_event("startup")
def on_startup(): SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session: yield session

class UserCreate(BaseModel): email: str; password: str
class UserLogin(BaseModel): email: str; password: str
class TokenRefreshRequest(BaseModel): refresh_token: str
class StudySessionCreate(BaseModel): subject_name: str; type: str; minutes_total: int; questions_total: Optional[int] = None; questions_right: Optional[int] = None; notes: Optional[str] = None
class StudySessionUpdate(StudySessionCreate): date: date
class CycleCreateUpdate(BaseModel): name: str; start_date: date; subjects: List[str]
class CycleWithSubjects(BaseModel): id: int; name: str; start_date: date; subjects: List[str] = []
class SubjectStats(BaseModel): total_minutes: int; total_questions: int; total_correct: int; accuracy: float
class SubjectDetails(BaseModel): sessions: List[StudySession]; reviews: List[Review]; stats: SubjectStats

api_router = APIRouter(prefix="/api", dependencies=[Depends(get_current_user)])

def get_cycle_with_subjects(cycle_id: int, session: Session) -> Optional[CycleWithSubjects]:
    cycle = session.get(Cycle, cycle_id)
    if not cycle: return None
    subjects = session.exec(select(CycleSubject).where(CycleSubject.cycle_id == cycle_id).order_by(CycleSubject.position)).all()
    cycle_data = cycle.model_dump(); cycle_data['subjects'] = [s.name for s in subjects]
    return CycleWithSubjects(**cycle_data)

@api_router.get("/cycles/", response_model=List[CycleWithSubjects])
def get_cycles(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    cycles_from_db = session.exec(select(Cycle).where(Cycle.user_id == user_id)).all()
    return [get_cycle_with_subjects(c.id, session) for c in cycles_from_db if c is not None]

@api_router.post("/cycles/", response_model=CycleWithSubjects)
def create_cycle(cycle_data: CycleCreateUpdate, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    cycle = Cycle(user_id=user_id, name=cycle_data.name, start_date=cycle_data.start_date)
    session.add(cycle); session.commit(); session.refresh(cycle)
    for i, subject_name in enumerate(cycle_data.subjects):
        session.add(CycleSubject(cycle_id=cycle.id, name=subject_name, position=i))
    session.commit()
    return get_cycle_with_subjects(cycle.id, session)

@api_router.put("/cycles/{cycle_id}", response_model=CycleWithSubjects)
def update_cycle(cycle_id: int, cycle_data: CycleCreateUpdate, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    cycle = session.get(Cycle, cycle_id)
    if not cycle or cycle.user_id != user_id: raise HTTPException(status_code=404, detail="Ciclo não encontrado")
    cycle.name, cycle.start_date = cycle_data.name, cycle_data.start_date
    old_subjects = session.exec(select(CycleSubject).where(CycleSubject.cycle_id == cycle_id)).all()
    for subject in old_subjects: session.delete(subject)
    session.commit()
    for i, subject_name in enumerate(cycle_data.subjects):
        session.add(CycleSubject(cycle_id=cycle.id, name=subject_name, position=i))
    session.add(cycle); session.commit()
    return get_cycle_with_subjects(cycle.id, session)

@api_router.delete("/cycles/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cycle(cycle_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    cycle = session.get(Cycle, cycle_id)
    if not cycle or cycle.user_id != user_id: raise HTTPException(status_code=404, detail="Ciclo não encontrado")
    subjects = session.exec(select(CycleSubject).where(CycleSubject.cycle_id == cycle_id)).all()
    for subject in subjects: session.delete(subject)
    session.delete(cycle); session.commit()

@api_router.post("/studies/", response_model=StudySession)
def create_study_session(study_data: StudySessionCreate, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    study_session = StudySession(user_id=user_id, date=date.today(), **study_data.model_dump())
    session.add(study_session); session.commit(); session.refresh(study_session)
    review_intervals = [1, 7, 21, 45, 90, 180]
    for interval in review_intervals:
        review = Review(user_id=user_id, subject_name=study_session.subject_name, origin_date=study_session.date, origin_note=study_session.notes, due_date=study_session.date + timedelta(days=interval), origin_session_id=study_session.id)
        session.add(review)
    session.commit()
    return study_session
    
@api_router.get("/studies/", response_model=List[StudySession])
def get_study_sessions(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(StudySession).where(StudySession.user_id == user_id).order_by(StudySession.date.desc())).all()

@api_router.put("/studies/{session_id}", response_model=StudySession)
def update_study_session(session_id: int, session_data: StudySessionUpdate, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    db_session = session.get(StudySession, session_id)
    if not db_session or db_session.user_id != user_id: raise HTTPException(status_code=404, detail="Sessão de estudo não encontrada")
    date_changed = session_data.date != db_session.date
    for key, value in session_data.model_dump(exclude_unset=True).items(): setattr(db_session, key, value)
    if date_changed:
        old_reviews = session.exec(select(Review).where(Review.origin_session_id == session_id, Review.status == "pending")).all()
        for review in old_reviews: session.delete(review)
        review_intervals = [1, 7, 21, 45, 90, 180]
        for interval in review_intervals:
            new_review = Review(user_id=user_id, subject_name=db_session.subject_name, origin_date=db_session.date, origin_note=db_session.notes, due_date=db_session.date + timedelta(days=interval), origin_session_id=db_session.id)
            session.add(new_review)
    session.add(db_session); session.commit(); session.refresh(db_session)
    return db_session

@api_router.delete("/studies/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_session(session_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    db_session = session.get(StudySession, session_id)
    if not db_session or db_session.user_id != user_id: raise HTTPException(status_code=404, detail="Sessão de estudo não encontrada")
    reviews_to_delete = session.exec(select(Review).where(Review.origin_session_id == session_id)).all()
    for review in reviews_to_delete: session.delete(review)
    session.delete(db_session); session.commit()

@api_router.get("/reviews/")
def get_reviews(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Review).where(Review.user_id == user_id).order_by(Review.due_date.asc())).all()

@api_router.post("/reviews/{review_id}/complete", response_model=Review)
def complete_review(review_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review or review.user_id != user_id: raise HTTPException(status_code=404, detail="Revisão não encontrada")
    review.status, review.done_at = "done", datetime.utcnow()
    session.add(review); session.commit(); session.refresh(review)
    return review

@api_router.post("/reviews/{review_id}/undo", response_model=Review)
def undo_review(review_id: int, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review or review.user_id != user_id: raise HTTPException(status_code=404, detail="Revisão não encontrada")
    review.status, review.done_at = "pending", None
    session.add(review); session.commit(); session.refresh(review)
    return review

@api_router.get("/subject/{subject_name}", response_model=SubjectDetails)
def get_subject_details(subject_name: str, user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    sessions = session.exec(select(StudySession).where(StudySession.user_id == user_id, StudySession.subject_name == subject_name).order_by(StudySession.date.desc())).all()
    reviews = session.exec(select(Review).where(Review.user_id == user_id, Review.subject_name == subject_name).order_by(Review.due_date.asc())).all()
    total_minutes = sum(s.minutes_total for s in sessions)
    sessions_with_questions = [s for s in sessions if s.questions_total and s.questions_total > 0 and s.questions_right is not None]
    total_questions = sum(s.questions_total for s in sessions_with_questions)
    total_correct = sum(s.questions_right for s in sessions_with_questions)
    accuracy = (total_correct / total_questions) * 100 if total_questions > 0 else 0
    stats = SubjectStats(total_minutes=total_minutes, total_questions=total_questions, total_correct=total_correct, accuracy=round(accuracy, 2))
    return SubjectDetails(sessions=sessions, reviews=reviews, stats=stats)

@api_router.get("/dashboard")
def get_dashboard(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    cycle = session.exec(select(Cycle).where(Cycle.user_id == user_id).order_by(Cycle.id.desc())).first()
    today_subject = "Crie um ciclo de estudos"
    if cycle:
        subjects = session.exec(select(CycleSubject).where(CycleSubject.cycle_id == cycle.id).order_by(CycleSubject.position)).all()
        if subjects:
            days_since_start = (date.today() - cycle.start_date).days
            if days_since_start >= 0:
                today_index = days_since_start % len(subjects)
                today_subject = subjects[today_index].name
            else: today_subject = "Ciclo começa no futuro"
        else: today_subject = "Adicione matérias ao seu ciclo"
    today_reviews = session.exec(select(Review).where(Review.user_id == user_id, Review.due_date <= date.today(), Review.status == "pending")).all()
    recent_sessions = session.exec(select(StudySession).where(StudySession.user_id == user_id).order_by(StudySession.date.desc()).limit(5)).all()
    return {"today_subject": today_subject, "today_reviews": today_reviews, "recent_sessions": recent_sessions}

@api_router.get("/analytics/summary")
def get_analytics_summary(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_sessions = session.exec(select(StudySession).where(StudySession.user_id == user_id, StudySession.date >= thirty_days_ago)).all()
    total_minutes = sum(s.minutes_total for s in recent_sessions)
    sessions_with_questions = [s for s in recent_sessions if s.questions_total and s.questions_total > 0 and s.questions_right is not None]
    total_questions = sum(s.questions_total for s in sessions_with_questions)
    total_correct = sum(s.questions_right for s in sessions_with_questions)
    accuracy_rate = (total_correct / total_questions) * 100 if total_questions > 0 else 0
    return {"total_minutes_30_days": total_minutes, "accuracy_rate": round(accuracy_rate, 2), "study_streak": 0, "sessions_count": len(recent_sessions)}

auth_router = APIRouter(prefix="/auth")

@auth_router.post("/signup")
def signup(user_data: UserCreate, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == user_data.email)).first(): raise HTTPException(status_code=400, detail="Email já está registrado")
    user = User(email=user_data.email, password_hash=get_password_hash(user_data.password))
    session.add(user); session.commit(); session.refresh(user)
    return {"message": "Usuário criado com sucesso", "user_id": user.id}

@auth_router.post("/login")
def login(user_data: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.password_hash): raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos")
    token_data = {"sub": str(user.id)}
    return {"access_token": create_access_token(data=token_data), "refresh_token": create_refresh_token(data=token_data), "token_type": "bearer", "user_id": user.id}
    
@auth_router.post("/refresh")
def refresh_token_endpoint(request: TokenRefreshRequest):
    user_id = verify_token(request.refresh_token, HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não foi possível validar o token de atualização"))
    return {"access_token": create_access_token(data={"sub": str(user_id)}), "token_type": "bearer"}

@api_router.get("/subjects/", response_model=List[str])
def get_all_subjects(user_id: int = Depends(get_current_user), session: Session = Depends(get_session)):
    """Busca todos os nomes de matérias únicas para um usuário."""
    subjects = session.exec(
        select(StudySession.subject_name)
        .where(StudySession.user_id == user_id)
        .distinct()
    ).all()
    return subjects

app.include_router(auth_router)
app.include_router(api_router)
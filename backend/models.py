from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
from datetime import datetime, date

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    cycles: List["Cycle"] = Relationship(back_populates="user")
    study_sessions: List["StudySession"] = Relationship(back_populates="user")
    reviews: List["Review"] = Relationship(back_populates="user")

class Cycle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    start_date: date
    name: str

    user: User = Relationship(back_populates="cycles")
    cycle_subjects: List["CycleSubject"] = Relationship(back_populates="cycle")

class CycleSubject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cycle_id: int = Field(foreign_key="cycle.id")
    name: str
    position: int

    cycle: Cycle = Relationship(back_populates="cycle_subjects")

class StudySession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    date: date
    subject_name: str
    type: str
    minutes_total: int
    questions_total: Optional[int] = None
    questions_right: Optional[int] = None
    sleep_hours: Optional[float] = None
    exercise: Optional[bool] = None
    caffeine: Optional[bool] = None
    mood: Optional[str] = None
    notes: Optional[str] = None

    user: User = Relationship(back_populates="study_sessions")

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    subject_name: str
    origin_date: date
    origin_note: Optional[str] = None
    due_date: date
    done_at: Optional[datetime] = None
    status: str = Field(default="pending")

    origin_session_id: Optional[int] = Field(default=None, foreign_key="studysession.id")

    user: User = Relationship(back_populates="reviews")
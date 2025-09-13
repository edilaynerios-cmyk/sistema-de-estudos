import { useEffect, useRef } from 'react';

// O nosso "superpoder" para criar timers que funcionam bem com o React
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Lembra da última versão da função callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configura o intervalo
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
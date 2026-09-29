# Ta-Te-Ti

Juego de Ta-Te-Ti hecho con HTML, CSS y JavaScript, siguiendo el reglamento de IAFAS.

## Reglas

- Juegan 2 jugadores, cada uno con tres fichas iguales: X u O.
- Por turnos, cada jugador coloca una ficha en un punto vacío del tablero.
- Cuando los dos colocaron sus tres fichas, se juega moviéndolas: cada ficha solo puede ir a un punto vecino vacío, unido por una línea.
- Gana quien consigue tres fichas iguales en línea vertical, horizontal o diagonal.

## Cómo jugar

Abrir `index.html` en el navegador. No necesita instalación.

1. En la fase de colocación, tocá un punto vacío para poner tu ficha.
2. En la fase de movimiento, tocá una de tus fichas para elegirla; los puntos a los que se puede mover se marcan en el tablero. Tocá uno para mover.
3. Si un jugador queda sin movimientos posibles, pierde el turno.

## Archivos

- `index.html`: estructura de la página y del tablero.
- `style.css`: estilos.
- `script.js`: lógica del juego (turnos, colocación, movimientos, detección del ganador y marcador).

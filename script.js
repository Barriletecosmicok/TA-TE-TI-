/* ============================================================
   Ta-Te-Ti — lógica del juego
   Reglas: 2 jugadores, 3 fichas cada uno. Primero se colocan
   por turnos; cuando las 6 están en el tablero, se mueven a un
   punto vecino vacío (unido por una línea). Gana quien forma
   tres en línea horizontal, vertical o diagonal.
   ============================================================ */

// ---------- Constantes ----------

const FICHAS_POR_JUGADOR = 3;

// Posiciones del tablero:
//  0 - 1 - 2
//  | \ | / |
//  3 - 4 - 5
//  | / | \ |
//  6 - 7 - 8
const LINEAS_GANADORAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
  [0, 4, 8], [2, 4, 6]             // diagonales
];

// Puntos unidos por una línea (a dónde se puede mover una ficha)
const ADYACENTES = {
  0: [1, 3, 4],
  1: [0, 2, 4],
  2: [1, 5, 4],
  3: [0, 6, 4],
  4: [0, 1, 2, 3, 5, 6, 7, 8], // el centro está unido a todos
  5: [2, 8, 4],
  6: [3, 7, 4],
  7: [6, 8, 4],
  8: [7, 5, 4]
};

// ---------- Estado del juego ----------

const juego = {
  tablero: Array(9).fill(null), // null, "X" u "O"
  turno: "X",
  colocadas: { X: 0, O: 0 },
  seleccionada: null,           // índice de la ficha elegida para mover
  ganador: null,
  lineaGanadora: null,
  ultimaJugada: null,           // para animar la ficha nueva
  puntos: { X: 0, O: 0 },
  empieza: "X"                  // quién arranca la partida (se alterna)
};

// ---------- Referencias al DOM ----------

const elTablero = document.getElementById("tablero");
const elEstado = document.getElementById("estado");
const elAviso = document.getElementById("aviso");
const elLineaGanadora = document.getElementById("linea-ganadora");
const btnNueva = document.getElementById("btn-nueva");
const btnMarcador = document.getElementById("btn-marcador");

const puntos = []; // los 9 botones del tablero

// ---------- Utilidades ----------

function fase() {
  const todasColocadas =
    juego.colocadas.X === FICHAS_POR_JUGADOR &&
    juego.colocadas.O === FICHAS_POR_JUGADOR;
  return todasColocadas ? "mover" : "colocar";
}

function rival(jugador) {
  return jugador === "X" ? "O" : "X";
}

// Puntos vacíos a los que puede ir la ficha que está en "indice"
function destinosDe(indice) {
  return ADYACENTES[indice].filter((i) => juego.tablero[i] === null);
}

function puedeMover(jugador) {
  return juego.tablero.some(
    (ficha, i) => ficha === jugador && destinosDe(i).length > 0
  );
}

function buscarGanador() {
  for (const linea of LINEAS_GANADORAS) {
    const [a, b, c] = linea;
    const ficha = juego.tablero[a];
    if (ficha && ficha === juego.tablero[b] && ficha === juego.tablero[c]) {
      return { jugador: ficha, linea };
    }
  }
  return null;
}

function avisar(texto) {
  elAviso.textContent = texto;
}

// ---------- Creación del tablero ----------

function crearPuntos() {
  for (let i = 0; i < 9; i++) {
    const boton = document.createElement("button");
    boton.className = "punto";
    boton.type = "button";
    boton.addEventListener("click", () => manejarClic(i));
    elTablero.appendChild(boton);
    puntos.push(boton);
  }
}

// ---------- Jugadas ----------

function manejarClic(indice) {
  if (juego.ganador) return;
  avisar("");

  if (fase() === "colocar") {
    colocarFicha(indice);
  } else {
    manejarMovimiento(indice);
  }

  render();
}

function colocarFicha(indice) {
  if (juego.tablero[indice] !== null) {
    avisar("Ese punto ya está ocupado.");
    return;
  }

  juego.tablero[indice] = juego.turno;
  juego.colocadas[juego.turno]++;
  juego.ultimaJugada = indice;
  terminarTurno();
}

function manejarMovimiento(indice) {
  const contenido = juego.tablero[indice];

  // 1) Clic sobre una ficha propia: seleccionarla (o soltarla)
  if (contenido === juego.turno) {
    if (juego.seleccionada === indice) {
      juego.seleccionada = null;
    } else if (destinosDe(indice).length === 0) {
      avisar("Esa ficha no tiene ningún punto libre al lado.");
    } else {
      juego.seleccionada = indice;
    }
    return;
  }

  // 2) Clic sobre una ficha del rival
  if (contenido !== null) {
    avisar("Esa ficha es de tu rival. Elegí una de las tuyas.");
    return;
  }

  // 3) Clic sobre un punto vacío
  if (juego.seleccionada === null) {
    avisar("Primero elegí una de tus fichas.");
    return;
  }

  if (!ADYACENTES[juego.seleccionada].includes(indice)) {
    avisar("Solo podés moverte a un punto vecino, unido por una línea.");
    return;
  }

  juego.tablero[indice] = juego.turno;
  juego.tablero[juego.seleccionada] = null;
  juego.seleccionada = null;
  juego.ultimaJugada = indice;
  terminarTurno();
}

function terminarTurno() {
  const resultado = buscarGanador();

  if (resultado) {
    juego.ganador = resultado.jugador;
    juego.lineaGanadora = resultado.linea;
    juego.puntos[resultado.jugador]++;
    return;
  }

  juego.turno = rival(juego.turno);

  // Si el jugador de turno quedó bloqueado, pierde el turno
  if (fase() === "mover" && !puedeMover(juego.turno)) {
    avisar(`El jugador ${juego.turno} no tiene movimientos y pierde el turno.`);
    juego.turno = rival(juego.turno);
  }
}

// ---------- Partidas ----------

function nuevaPartida() {
  juego.tablero = Array(9).fill(null);
  juego.colocadas = { X: 0, O: 0 };
  juego.seleccionada = null;
  juego.ganador = null;
  juego.lineaGanadora = null;
  juego.ultimaJugada = null;
  juego.turno = juego.empieza;
  avisar("");
  render();
}

btnNueva.addEventListener("click", () => {
  // La próxima partida la empieza el otro jugador
  juego.empieza = rival(juego.empieza);
  nuevaPartida();
});

btnMarcador.addEventListener("click", () => {
  juego.puntos = { X: 0, O: 0 };
  juego.empieza = "X";
  nuevaPartida();
});

// ---------- Dibujo en pantalla ----------

function render() {
  const faseActual = fase();
  const destinos =
    juego.seleccionada !== null ? destinosDe(juego.seleccionada) : [];

  puntos.forEach((boton, i) => {
    const ficha = juego.tablero[i];
    const fila = Math.floor(i / 3) + 1;
    const columna = (i % 3) + 1;

    // Contenido: ficha o punto vacío
    boton.innerHTML = "";
    if (ficha) {
      const span = document.createElement("span");
      span.className = `ficha ficha-${ficha.toLowerCase()}`;
      if (i === juego.ultimaJugada) span.classList.add("nueva");
      span.textContent = ficha;
      boton.appendChild(span);
    }

    // Clases de estado
    boton.classList.toggle("seleccionada", i === juego.seleccionada);
    boton.classList.toggle("destino", destinos.includes(i));
    boton.classList.toggle(
      "movible",
      !juego.ganador && faseActual === "mover" && ficha === juego.turno
    );
    boton.classList.toggle(
      "ganadora",
      Boolean(juego.lineaGanadora && juego.lineaGanadora.includes(i))
    );

    boton.disabled = Boolean(juego.ganador);
    boton.setAttribute(
      "aria-label",
      `Fila ${fila}, columna ${columna}: ${ficha ? "ficha " + ficha : "vacío"}`
    );
  });

  // La animación de "ficha nueva" solo se muestra una vez
  juego.ultimaJugada = null;

  dibujarLineaGanadora();
  actualizarPanel(faseActual);
}

function dibujarLineaGanadora() {
  if (!juego.lineaGanadora) {
    elLineaGanadora.classList.remove("visible");
    return;
  }

  // Coordenadas en el viewBox de 300x300: los puntos están en 50, 150 y 250
  const coord = (i) => ({ x: 50 + (i % 3) * 100, y: 50 + Math.floor(i / 3) * 100 });
  const inicio = coord(juego.lineaGanadora[0]);
  const fin = coord(juego.lineaGanadora[2]);

  elLineaGanadora.setAttribute("x1", inicio.x);
  elLineaGanadora.setAttribute("y1", inicio.y);
  elLineaGanadora.setAttribute("x2", fin.x);
  elLineaGanadora.setAttribute("y2", fin.y);
  elLineaGanadora.classList.add("visible");
}

function actualizarPanel(faseActual) {
  ["X", "O"].forEach((jugador) => {
    document.getElementById(`puntos-${jugador}`).textContent = juego.puntos[jugador];

    // Fichas que le quedan por colocar
    const reserva = document.getElementById(`reserva-${jugador}`);
    const restantes = FICHAS_POR_JUGADOR - juego.colocadas[jugador];
    reserva.innerHTML = "<span></span>".repeat(restantes);

    document
      .getElementById(`panel-${jugador}`)
      .classList.toggle("activo", !juego.ganador && juego.turno === jugador);
  });

  if (juego.ganador) {
    elEstado.textContent = `¡Ganó el jugador ${juego.ganador}! Tocá "Nueva partida" para jugar otra.`;
  } else if (faseActual === "colocar") {
    elEstado.textContent = `Turno de ${juego.turno}: colocá una ficha en un punto vacío.`;
  } else if (juego.seleccionada === null) {
    elEstado.textContent = `Turno de ${juego.turno}: elegí una de tus fichas para moverla.`;
  } else {
    elEstado.textContent = `Turno de ${juego.turno}: tocá un punto marcado para mover la ficha.`;
  }
}

// ---------- Inicio ----------

crearPuntos();
nuevaPartida();

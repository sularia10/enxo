class GameView {
  constructor() {
    this.jugadorDiv = document.getElementById("jugador");
    this.iaDiv = document.getElementById("ia");
    this.mensajeP = document.getElementById("mensaje");
    this.btnJugar = document.getElementById("btnJugar");
    this.disparoForm = document.getElementById("disparoForm");

    // Depuración: Verificar que los elementos existen
    if (!this.jugadorDiv || !this.iaDiv) {
      console.error("Error: No se encontraron los contenedores #jugador o #ia");
    }
  }

  pintarTablero(tablero, id, mostrarBarcos) {
    console.log(`Pintando tablero: ${id}`); // Depuración
    const contenedor = id === "jugador" ? this.jugadorDiv : this.iaDiv;
    if (!contenedor) {
      console.error(`Contenedor ${id} no encontrado`);
      return;
    }
    contenedor.innerHTML = "";
    for (let y = 0; y < tablero.length; y++) {
      for (let x = 0; x < tablero[y].length; x++) {
        const casilla = document.createElement("div");
        casilla.classList.add("casilla");
        casilla.dataset.x = x;
        casilla.dataset.y = y;
        const celda = tablero[y][x];
        if (celda.disparado) {
          if (celda.tieneBarco) {
            casilla.classList.add(celda.hundido ? "hundido" : "tocado");
          } else {
            casilla.classList.add("agua");
          }
        } else if (mostrarBarcos && celda.tieneBarco) {
          casilla.classList.add("barco");
        }
        contenedor.appendChild(casilla);
      }
    }
    console.log(`Tablero ${id} renderizado con ${contenedor.children.length} casillas`);
  }

  mostrarMensaje(msg) {
    this.mensajeP.innerText = msg;
    console.log(`Mensaje mostrado: ${msg}`);
  }

  actualizarEstadoJuego(puedeJugar) {
    this.btnJugar.disabled = !puedeJugar;
    if (puedeJugar) {
      this.disparoForm.style.display = "block";
    }
  }

  resetDisparoForm() {
    this.disparoForm.reset();
  }
}

export default GameView;
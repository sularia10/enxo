class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.barcoSeleccionado = null;
    this.nombreSeleccionado = "";
    this.orientacion = "H";

    console.log("Inicializando GameController"); // Depuración
    this.inicializarEventos();
    console.log("Pintando tableros iniciales");
    this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
    this.view.pintarTablero(this.model.tableroIA, "ia", false);
  }

  inicializarEventos() {
    // Selección de barcos
    document
      .getElementById("controles-barcos")
      .addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" && e.target.dataset.barco) {
          this.barcoSeleccionado = parseInt(e.target.dataset.tamano);
          this.nombreSeleccionado = e.target.dataset.barco;
          this.view.mostrarMensaje(`Barco seleccionado: ${this.nombreSeleccionado}`);
        } else if (e.target.id === "btn-orientacion") {
          this.orientacion = this.orientacion === "H" ? "V" : "H";
          this.view.mostrarMensaje(
            `Orientación: ${this.orientacion === "H" ? "Horizontal" : "Vertical"}`
          );
        }
      });

    // Colocación de barcos
    this.view.jugadorDiv.addEventListener("click", (e) => {
      if (!this.barcoSeleccionado || !e.target.classList.contains("casilla"))
        return;
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      const exito = this.model.colocarBarco(
        x,
        y,
        this.barcoSeleccionado,
        this.nombreSeleccionado,
        this.orientacion
      );
      if (exito) {
        this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
        this.barcoSeleccionado = null;
        this.nombreSeleccionado = "";
        if (this.model.puedeJugar()) {
          this.view.actualizarEstadoJuego(true);
        }
      } else {
        this.view.mostrarMensaje("Posición inválida");
      }
    });

    // Iniciar juego
    this.view.btnJugar.addEventListener("click", () => {
      this.view.actualizarEstadoJuego(true);
      this.view.pintarTablero(this.model.tableroIA, "ia", false);
    });

    // Disparos
    this.view.disparoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const x = parseInt(document.getElementById("x").value);
      const y = parseInt(document.getElementById("y").value);
      this.disparar(x, y);
      this.view.resetDisparoForm();
    });
  }

  disparar(x, y) {
    const resultado = this.model.disparar(x, y, true);
    if (resultado.resultado === "repetido") {
      this.view.mostrarMensaje("¡Ya disparaste ahí!");
      return;
    }
    if (resultado.resultado === "tocado") {
      this.view.mostrarMensaje(resultado.hundido ? "¡Hundido!" : "¡Tocado!");
    } else {
      this.view.mostrarMensaje("Agua.");
      setTimeout(() => this.turnoIA(), 1000);
    }
    this.view.pintarTablero(this.model.tableroIA, "ia", false);
    if (this.model.checkFinJuego(true)) {
      this.view.mostrarMensaje("¡Ganaste!");
    }
  }

  turnoIA() {
    const resultado = this.model.turnoIA();
    if (resultado.resultado === "tocado") {
      this.view.mostrarMensaje(
        resultado.hundido
          ? "¡La IA hundió uno de tus barcos!"
          : "¡La IA te ha tocado!"
      );
      this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
      setTimeout(() => this.turnoIA(), 1000);
    } else {
      this.view.mostrarMensaje("La IA falló.");
      this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
    }
    if (this.model.checkFinJuego(false)) {
      this.view.mostrarMensaje("¡La IA ganó!");
    }
  }
}

export default GameController;
class GameController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.barcoSeleccionado = null;
    this.nombreSeleccionado = "";
    this.orientacion = "H";
    this.apiUrl = "http://localhost:3000/partidas";

    console.log("Inicializando GameController");
    this.inicializarEventos();
    this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
    this.view.pintarTablero(this.model.tableroIA, "ia", false);
  }

  async listarPartidas() {
    try {
      const response = await fetch(this.apiUrl);
      if (response.ok) {
        const partidas = await response.json();
        const lista = partidas.map(p => `<p>ID: ${p.id} - Jugador: ${p.jugador || 'Sin nombre'}</p>`).join("");
        document.getElementById("listaPartidas").innerHTML = lista;
      } else {
        throw new Error("Error al listar partidas");
      }
    } catch (error) {
      console.error("Error en listarPartidas:", error);
      this.view.mostrarMensaje("Error al listar partidas");
    }
  }

  inicializarEventos() {
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

    this.view.jugadorDiv.addEventListener("click", (e) => {
      if (!this.barcoSeleccionado || !e.target.classList.contains("casilla")) return;
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

    this.view.btnJugar.addEventListener("click", () => {
      this.view.actualizarEstadoJuego(true);
      this.view.pintarTablero(this.model.tableroIA, "ia", false);
    });

    this.view.disparoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const x = parseInt(document.getElementById("x").value);
      const y = parseInt(document.getElementById("y").value);
      this.disparar(x, y);
      this.view.resetDisparoForm();
    });

    // Ajustar IDs de los botones para coincidir con index.html
    this.view.btnGuardarPartida = document.getElementById("btnGuardar");
    this.view.btnCargarPartida = document.getElementById("btnCargar");

    this.view.btnGuardarPartida.addEventListener("click", () => {
      this.guardarPartida();
    });

    this.view.btnCargarPartida.addEventListener("click", () => {
      const id = prompt("Introduce el ID de la partida:");
      if (id) {
        this.cargarPartida(id);
      }
    });

    document.getElementById("btnListarPartidas").addEventListener("click", () => {
      this.listarPartidas();
    });
  }

async guardarPartida() {
  try {
    const partida = this.model.toJSON();
    const jugador = prompt("Introduce tu nombre (opcional):") || "Jugador Anónimo";
    console.log("Guardando partida:", partida);
    console.log("Datos a enviar:", {
      jugador: jugador,
      tableroJugador: partida.tableroJugador,
      tableroIA: partida.tableroIA,
    });
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jugador: jugador,
        tableroJugador: partida.tableroJugador,
        tableroIA: partida.tableroIA,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      this.view.mostrarMensaje(`Partida guardada con ID: ${data.id}`);
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error en guardarPartida:", error);
    this.view.mostrarMensaje("Error al guardar la partida");
  }
}
  

  async cargarPartida(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Partida cargada:", data);
        let tableroJugador, tableroIA;
        try {
          tableroJugador = JSON.parse(data.tableroJugador);
          tableroIA = JSON.parse(data.tableroIA);
        } catch (parseError) {
          throw new Error("Formato de tablero inválido: " + parseError.message);
        }
        this.model = GameModel.fromJSON({
          jugador: data.jugador,
          tableroJugador: tableroJugador,
          tableroIA: tableroIA,
        });
        this.view.pintarTablero(this.model.tableroJugador, "jugador", true);
        this.view.pintarTablero(this.model.tableroIA, "ia", false);
        this.view.actualizarEstadoJuego(this.model.puedeJugar());
        this.view.mostrarMensaje(`Partida ${id} cargada`);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error en cargarPartida:", error);
      this.view.mostrarMensaje("Error al cargar la partida");
    }
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
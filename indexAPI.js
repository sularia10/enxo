/***
 * CONEXIÓN A API
 */

async function guardarPartida(nombreJugador, tableroJugador, tableroIA) {
    const partida = {
        jugador: nombreJugador || "Jugador Anónimo",
        tableroJugador: JSON.stringify(tableroJugador), // Serializar para la API
        tableroIA: JSON.stringify(tableroIA)           // Serializar para la API
    };

    try {
        const response = await fetch("http://localhost:3000/API/partidas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(partida)
        });

        if (!response.ok) throw new Error("Error al guardar la partida");

        const data = await response.json();
        console.log("Partida guardada con éxito:", data);
        alert(`Partida guardada con ID: ${data.id}`); // Mensaje al usuario
        return data.id; // ID de la partida
    } catch (err) {
        console.error("Error:", err);
        alert("Error al guardar la partida");
    }
}

async function cargarPartida(idPartida) {
    try {
        const response = await fetch(`http://localhost:3000/API/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No se encontró la partida");

        const data = await response.json();
        console.log("Partida cargada:", data);

        // Deserializar los tableros
        const tableroJugador = JSON.parse(data.tableroJugador);
        const tableroIA = JSON.parse(data.tableroIA);

        return { jugador: data.jugador, tableroJugador, tableroIA };
    } catch (err) {
        console.error("Error:", err);
        alert("Error al cargar la partida");
    }
}

// Función para recuperar y aplicar los tableros
function recuperaTablerosApi(partida) {
    if (!partida) return;

    // Asumiendo que tienes acceso a GameModel y GameView (puedes pasarlos como parámetros)
    const model = window.gameController.model; // Ajusta según tu estructura
    const view = window.gameController.view;   // Ajusta según tu estructura

    // Reconstruir el modelo con los tableros cargados
    model.jugador = partida.jugador;
    model.tableroJugador = partida.tableroJugador;
    model.tableroIA = partida.tableroIA;

    // Actualizar la vista
    view.pintarTablero(model.tableroJugador, "jugador", true);
    view.pintarTablero(model.tableroIA, "ia", false);
    view.actualizarEstadoJuego(model.puedeJugar());
    alert(`Partida ${idPartida} cargada`);
}

// Evento para guardar (necesita acceso a los tableros del modelo)
document.getElementById("btnGuardar").addEventListener("click", () => {
    const nombreJugador = prompt("Introduce tu nombre:");
    // Asumiendo que tienes acceso al modelo global (ajusta según tu implementación)
    const model = window.gameController.model; // Ajusta según tu estructura
    if (model) {
        guardarPartida(nombreJugador, model.tableroJugador, model.tableroIA);
    } else {
        alert("Error: No se encontró el modelo del juego.");
    }
});

// Evento para cargar
document.getElementById("btnCargar").addEventListener("click", async () => {
    const id = prompt("Introduce el ID de la partida:");
    if (id) {
        const partida = await cargarPartida(id);
        recuperaTablerosApi(partida);
    }
});
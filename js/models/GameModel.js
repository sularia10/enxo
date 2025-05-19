class GameModel {
  constructor() {
    this.size = 10;
    this.tableroJugador = [];
    this.tableroIA = [];
    this.barcosJugador = [];
    this.barcosIA = [];
    this.barcosPendientes = {
      Portaaviones: 5,
      Acorazado: 4,
      Crucero: 3,
      Submarino: 3,
      Destructor: 2,
    };
    this.barcosColocados = 0;
    this.crearTablero(this.tableroJugador);
    this.crearTablero(this.tableroIA);
    this.colocarBarcosIA();
    console.log("Tableros creados:", this.tableroJugador, this.tableroIA); // Depuración
  }

  crearTablero(tablero) {
    for (let y = 0; y < this.size; y++) {
      const fila = [];
      for (let x = 0; x < this.size; x++) {
        fila.push({ tieneBarco: false, disparado: false, hundido: false });
      }
      tablero.push(fila);
    }
  }

  colocarBarcosIA() {
    const tamaños = [5, 4, 3, 3, 2];
    for (let size of tamaños) {
      let colocado = false;
      while (!colocado) {
        let x = Math.floor(Math.random() * (10 - size));
        let y = Math.floor(Math.random() * 10);
        let horizontal = Math.random() > 0.5;
        let espacioLibre = true;
        for (let i = 0; i < size; i++) {
          let cx = horizontal ? x + i : x;
          let cy = horizontal ? y : y + i;
          if (cx >= 10 || cy >= 10 || this.tableroIA[cy][cx].tieneBarco) {
            espacioLibre = false;
            break;
          }
        }
        if (espacioLibre) {
          let coords = [];
          for (let i = 0; i < size; i++) {
            let cx = horizontal ? x + i : x;
            let cy = horizontal ? y : y + i;
            this.tableroIA[cy][cx].tieneBarco = true;
            coords.push([cx, cy]);
          }
          this.barcosIA.push({ coords, hundido: false });
          colocado = true;
        }
      }
    }
  }

  esPosicionValida(tablero, x, y, tamano, orientacion) {
    for (let i = 0; i < tamano; i++) {
      let cx = orientacion === "H" ? x + i : x;
      let cy = orientacion === "H" ? y : y + i;
      if (cx >= 10 || cy >= 10 || tablero[cy][cx].tieneBarco) {
        return false;
      }
    }
    return true;
  }

  colocarBarco(x, y, tamano, nombre, orientacion) {
    if (!this.esPosicionValida(this.tableroJugador, x, y, tamano, orientacion)) {
      return false;
    }
    let coords = [];
    for (let i = 0; i < tamano; i++) {
      let cx = orientacion === "H" ? x + i : x;
      let cy = orientacion === "H" ? y : y + i;
      this.tableroJugador[cy][cx].tieneBarco = true;
      coords.push([cx, cy]);
    }
    this.barcosJugador.push({ nombre, coords, hundido: false });
    delete this.barcosPendientes[nombre];
    this.barcosColocados++;
    return true;
  }

  disparar(x, y, esJugador) {
    const tablero = esJugador ? this.tableroIA : this.tableroJugador;
    const barcos = esJugador ? this.barcosIA : this.barcosJugador;
    if (tablero[y][x].disparado) {
      return { resultado: "repetido" };
    }
    tablero[y][x].disparado = true;
    if (tablero[y][x].tieneBarco) {
      const hundido = this.checkHundido(tablero, barcos, x, y);
      return { resultado: "tocado", hundido };
    }
    return { resultado: "agua" };
  }

  checkHundido(tablero, barcos, x, y) {
    for (let barco of barcos) {
      if (barco.hundido) continue;
      let hundido = barco.coords.every(([bx, by]) => tablero[by][bx].disparado);
      if (hundido) {
        barco.hundido = true;
        barco.coords.forEach(([bx, by]) => {
          tablero[by][bx].hundido = true;
        });
        return true;
      }
    }
    return false;
  }

  checkFinJuego(esJugador) {
    const barcos = esJugador ? this.barcosIA : this.barcosJugador;
    return barcos.every((b) => b.hundido);
  }

  turnoIA() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.size);
      y = Math.floor(Math.random() * this.size);
    } while (this.tableroJugador[y][x].disparado);
    return this.disparar(x, y, false);
  }

  puedeJugar() {
    return this.barcosColocados === 5;
  }
}

export default GameModel;
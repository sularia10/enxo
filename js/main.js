import GameModel from "./models/GameModel.js";
import GameView from "./views/GameView.js";
import GameController from "./controllers/GameController.js";

console.log("Inicializando aplicación"); // Depuración
const model = new GameModel();
const view = new GameView();
const controller = new GameController(model, view);
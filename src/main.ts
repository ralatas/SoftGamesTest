import "./style.css";
import { Game } from "./app/Game";

const root = document.getElementById("app")!;
const game = new Game();
game.init(root);

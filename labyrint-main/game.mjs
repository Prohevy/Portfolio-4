import Labyrinth from "./labyrint.mjs"

const REFRESH_RATE = 250;

let intervalID = null;
let isBlocked = false;
let state = null;

function init() {
    //All levels available to the game. 
    state = new Labyrinth();
    intervalID = setInterval(update, REFRESH_RATE);
}

function update() {

    if (isBlocked) { return; }
    isBlocked = true;
    //#region core game loop
    state.update();
    state.draw();
    //#endregion
    isBlocked = false;
}

init();
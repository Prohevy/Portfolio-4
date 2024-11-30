import ANSI from "./utils/ANSI.mjs";
import KeyBoardManager from "./utils/KeyBoardManager.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import * as CONST from "./constants.mjs";

const startingLevel = CONST.START_LEVEL_ID;
const levels = loadLevelListings();

function loadLevelListings(source = CONST.LEVEL_LISTING_FILE) {
    let data = readRecordFile(source);
    console.log(data)
    let levels = {};
    for (const item of data) {
        let keyValue = item.split(":");
        if (keyValue.length >= 2) {
            let key = keyValue[0];
            let value = keyValue[1];
            levels[key] = value;
        }
    }
    return levels;
}

let levelData = readMapFile(levels[startingLevel]);
let level = levelData;

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.RED,
    "$": ANSI.COLOR.YELLOW,
    "B": ANSI.COLOR.GREEN,
    "D": ANSI.COLOR.BLUE,  
};

let isDirty = true;

let playerPos = {
    row: null,
    col: null,
};

const EMPTY = " ";
const HERO = "H";
const LOOT = "$";

let direction = -1;

let items = [];

const THINGS = [LOOT, EMPTY, "D"]; 

let eventText = "";

const HP_MAX = 10;

const playerStats = {
    hp: 8,
    chash: 0
}


const levelSequence = ["start", "aSharpPlace", "newRoom"]; 


let currentLevelIndex = 0; 
let previousLevelIndex = -1; 


function loadNextLevel() {
    previousLevelIndex = currentLevelIndex; 
    currentLevelIndex++;

   
    if (currentLevelIndex < levelSequence.length) {
        const nextLevelName = levelSequence[currentLevelIndex];
        console.log(`Transitioning to next level: ${nextLevelName}`);
        loadLevel(nextLevelName);  
    } else {
        console.log("No more levels available.");
    }
}


function loadPreviousLevel() {
    if (previousLevelIndex >= 0) {  
        const prevLevelName = levelSequence[previousLevelIndex];
        console.log(`Returning to previous level: ${prevLevelName}`);
        loadLevel(prevLevelName);  
    } else {
        console.log("No previous level available.");
    }
}


function loadLevel(levelName) {
    console.log(`Loading level: ${levelName}`); 
    
   
    levelData = readMapFile(levels[levelName]);
    level = levelData;

   
    playerPos = { row: null, col: null };

   
    findPlayerStart();
    isDirty = true; 
}


function movePlayer(newRow, newCol) {
    const targetCell = level[newRow][newCol];

    console.log(`Target Cell: ${targetCell}`);
    
    if (targetCell === "D") {  
        console.log(`Player stepped on the door!`);

        
        if (previousLevelIndex >= 0 && currentLevelIndex > previousLevelIndex) {
            console.log("Going back through the door!");
            loadPreviousLevel(); 
        } else {
            console.log(`Transitioning to next level: ${levelSequence[currentLevelIndex + 1]}`);
            loadNextLevel(); 
        }
    } else if (targetCell === EMPTY || targetCell === LOOT) {
        if (targetCell == LOOT) {
            let loot = Math.round(Math.random() * 7) + 3;
            playerStats.cash += loot;
            eventText = `Player gained ${loot}$`;
        }

        
        level[playerPos.row][playerPos.col] = EMPTY;
        level[newRow][newCol] = HERO;

        playerPos.row = newRow;
        playerPos.col = newCol;

        isDirty = true;
    }
}


function findPlayerStart() {
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            if (level[row][col] === HERO) {
                playerPos.row = row;
                playerPos.col = col;
                return;
            }
        }
    }
}

class Labyrinth {
    update() {
        if (playerPos.row == null) {
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    if (level[row][col] == "H") {
                        playerPos.row = row;
                        playerPos.col = col;
                        break;
                    }
                }
                if (playerPos.row != undefined) {
                    break;
                }
            }
        }

        let drow = 0;
        let dcol = 0;

        if (KeyBoardManager.isUpPressed()) {
            drow = -1;
        } else if (KeyBoardManager.isDownPressed()) {
            drow = 1;
        }

        if (KeyBoardManager.isLeftPressed()) {
            dcol = -1;
        } else if (KeyBoardManager.isRightPressed()) {
            dcol = 1;
        }

        let tRow = playerPos.row + (1 * drow);
        let tCol = playerPos.col + (1 * dcol);

        if (THINGS.includes(level[tRow][tCol])) {
            console.log('moving');
            movePlayer(tRow, tCol); 
        } else {
            direction *= -1;
        }
    }

    draw() {
        if (isDirty == false) {
            return;
        }
        isDirty = false;

        console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

        let rendring = "";

        rendring += renderHud();

        for (let row = 0; row < level.length; row++) {
            let rowRendering = "";
            for (let col = 0; col < level[row].length; col++) {
                let symbol = level[row][col];
                if (pallet[symbol] != undefined) {
                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                } else {
                    rowRendering += symbol;
                }
            }
            rowRendering += "\n";
            rendring += rowRendering;
        }

        console.log(rendring);
        if (eventText != "") {
            console.log(eventText);
            eventText = "";
        }
    }
}

function renderHud() {
    let hpBar = `Life:[${ANSI.COLOR.RED + pad(playerStats.hp, "♥︎") + ANSI.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + pad(HP_MAX - playerStats.hp, "♥︎") + ANSI.COLOR_RESET}]`
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash}\n`;
}

function pad(len, text) {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += text;
    }
    return output;
}

export default Labyrinth;

let squares = [];
let players = ["X", "O"]; // first/leftmost is current turn
let board = []
let gameOver = false;

document.addEventListener("DOMContentLoaded", (event) => {
    firstTimeSetup();
    newGame();
});

function firstTimeSetup() {
    squares = Array.from(document.querySelectorAll(".board > div"));
    let i = 0; // id to apply to the DOM element to align it with the board array
    for (const sq of squares) {
        sq.addEventListener("click", function(event) {
            selectSquare(event.target);
        });
        sq.dataset.i = i++;
    }
    // connect reset button to new game
    document.querySelector(".reset-btn").addEventListener("click", (event) => {
        newGame();
    });
}

function newGame() {
    board = Array(9).fill("");
    gameOver = false;

    updateGameView();
}

// update the DOM with the board values
function updateGameView(winningCellIndices=[]) {
    for (const i in squares) {
        squares[i].innerText = board[i];
        squares[i].classList.remove("winning-cell");
    }
    // update background of winning cells to highlight the path
    winningCellIndices.forEach((val) => {
        squares[val].classList.add("winning-cell");
    });

    document.querySelector("#game-state").innerText = `${gameOver ? "Done" : "Playing"}`;
    document.querySelector("#current-player").innerText = `${players[0]}`;
}

function selectSquare(square) {
    // squares have the 0-based index set on them
    let index = square.dataset.i;

    // if not available, or game is over, ignore this selection
    if (board[index] !== "" || gameOver)  {
        return;
    }

    if (index < 0 || index >= 9) {
        return; // invalid selection
    }

    // its available, take it
    board[index] = players[0];

    turnOver();
}

// called when a players turn is over
function turnOver() {
    // check if the game is over
    let [gameState, winner, ...winningCellIndices] = isGameWon();
    if (gameState === true) {
        gameOver = true;
        console.dir(winningCellIndices);
    } else {
        players.reverse(); // switch players
    }

    updateGameView(winningCellIndices);
}

function rowColToIndex(row, col) {
    // r0c0, r0c1, r0c2
    // r1c0, r1c1, r1c2
    // r2c0, r2c1, r2c2
    // index is r*3 + c
    return (row * 3) + col;
}

function indexToRowCol (index) {
    // rows
    // 0, 1, 2  // 3 = 0
    // 3, 4, 5  // 3  = 1
    // 6, 7, 8 // 3   = 2
    let row = Math.floor(index / 3); 

    // col is done with mod
    // eg 6 % 3 = 0, as is 3 % 3
    // 7 % 3 = 1, as is 4, 1
    let col = index % 3;

    return [row, col];
}

// checks if the three squares are the same, and not empty
// a,b,c are 0 based row/col indices
function areSquaresSame(aIndex, bIndex, cIndex) {
    if (board[aIndex] === "") {
        return false;
    }
    return board[aIndex] === board[bIndex] && board[bIndex] === board[cIndex];
}

// returns true/false for game is over, the winning player (X or O or "" for a tie),
// and the cells which made the win. No cells are returned for a tie.
function isGameWon() {
    // in a row or col, all values must be the same to be a win

    // check rows
    for (let row = 0; row < 3; row++) {
        //rXc0 to rXc2
        let aIndex = rowColToIndex(row, 0);
        let bIndex = rowColToIndex(row, 1);
        let cIndex = rowColToIndex(row, 2);
        if (areSquaresSame(aIndex, bIndex, cIndex)) {
            return [true, board[aIndex], aIndex, bIndex, cIndex]; // return winner, and the winner
        }
    }

    // check cols
    for (let col = 0; col < 3; col++) {
        //r0cX to r2cX
        let aIndex = rowColToIndex(0, col);
        let bIndex = rowColToIndex(1, col);
        let cIndex = rowColToIndex(2, col);
        if (areSquaresSame(aIndex, bIndex, cIndex)) {
            return [true, board[aIndex], aIndex, bIndex, cIndex]; // return winner, and the winner
        }
    }

    // check diagonals
    let centerIndex = rowColToIndex(1, 1);
    let topLeftIndex = rowColToIndex(0, 0);
    let topRightIndex = rowColToIndex(0, 2);
    let btmLeftIndex = rowColToIndex(2, 0);
    let btmRightIndex = rowColToIndex(2, 2);

    if (areSquaresSame(topLeftIndex, centerIndex, btmRightIndex)) {
         // return winner, and the winner, and the cells
        return [true, board[centerIndex], topLeftIndex, centerIndex, btmRightIndex];
    }

    if ( areSquaresSame(topRightIndex, centerIndex, btmLeftIndex)) {
        // return winner, and the winner, and the cells
        return [true, board[centerIndex], topRightIndex, centerIndex, btmLeftIndex]; 
    }

    // check tie, no spots left
    let emptySpots = 0;
    for (const value of board) {
        if (value === "") {
            emptySpots++;
        }
    }
    if (emptySpots == 0) {
        return [true, ""]; // no winner
    }

    return [false, ""];
}


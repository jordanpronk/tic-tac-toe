
/*
  Finds the board's squares in the DOM when the DOM is loaded, and starts a new game.

  The state is kept is the board array, and on each turn the DOM is updated to reflect
  the current state such as the value of each board cell/square, and the game state.

  The squares in the DOM have an index set in a data attribute
  which aligns with the board and is used when the square is clicked
  to map it to the element in the board array.

*/

let squares = [];         // Array of DOM Elements, which correspond to a cell on the board array
let players = [];         // first/leftmost is current turn
let board = [];           // Array of strings of values "", "X", or "O"; the current game state
let gameOver = false;

/**
 * Runs first time setup that needs to run before a the initial new game can begin.
 */
function firstTimeSetup() {
  squares = Array.from(document.querySelectorAll(".board > div"));
  let i = 0; // id to apply to the DOM element to align it with the board array
  for (const sq of squares) {
    sq.addEventListener("click", function (event) {
      selectSquare(event.target);
    });
    sq.dataset.i = i++;
  }

  if (i !== 9) {
    console.error("Invalid number of squares");
    return; // don't allow the game to start with an invalid board
  }

  // connect reset button to start new game
  document.querySelector(".reset-btn").addEventListener("click", () => {
    newGame();
  });

  newGame();
}

/**
 * creates a new game, clearing previous game state and the board.
 */
function newGame() {
  board = Array(9).fill("");
  gameOver = false;
  players = ["X", "O"];

  updateGameView();
}

/**
 * update the DOM with the board values
 * @param {Array<number>} winningCellIndices optional, only valid when game is over
 * @param {String} winner optional, only valid when game is over
 */
function updateGameView(winningCellIndices = [], winner = "") {
  for (const i in squares) {
    squares[i].innerText = board[i];
    squares[i].classList.remove("winning-cell");
  }

  // update background of winning cells to highlight the path
  winningCellIndices.forEach((val) => {
    squares[val].classList.add("winning-cell");
  });

  // update the game state textto 'Playing' when the game is ongoing
  // and to the winner (or tie) when the game is over.
  let doneText = winner ? `${winner} wins`: "Tie";
  document.querySelector("#game-state").innerText = `${
    gameOver ? doneText : "Playing"
  }`;
  document.querySelector("#current-player").innerText = `${players[0]}`;
}

/**
 * Call when the user selects a square.
 * The cell the square corresponds to is retrieved from the
 * i data attribute on the square element.
 * 
 * @param {HTMLDivElement} square the selected square
 */
function selectSquare(square) {
  // squares have the 0-based index set on them
  let index = square.dataset.i;

  if (index < 0 || index >= 9) {
    console.error(`invalid index ${index} for square`);
    return;
  }

  // if not available, or game is over, ignore this selection
  if (board[index] !== "" || gameOver) {
    return;
  }

  if (index < 0 || index >= 9) {
    return; // invalid selection
  }

  // its available, take it
  board[index] = players[0];

  turnOver();
}

/**
 * Called when a players turn is over.
 * Switches the current player between X and 0.
 * Checks if the game has been won, and ensures the game view is updated.
 */
function turnOver() {
  // check if the game is over
  let [gameState, winner, ...winningCellIndices] = isGameWon();
  if (gameState === true) {
    gameOver = true;
  } else {
    players.reverse(); // switch players
  }

  updateGameView(winningCellIndices, winner);
}

/**
 * 
 * @param {number} row the 0-based row index
 * @param {number} col  the 0-based column index
 * @returns {number} the 0-based index to use with the board array
 */
function rowColToIndex(row, col) {
  // r0c0, r0c1, r0c2
  // r1c0, r1c1, r1c2
  // r2c0, r2c1, r2c2
  // index is r*3 + c
  return row * 3 + col;
}

// eslint-disable-next-line no-unused-vars
function indexToRowCol(index) {
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

/**
 * checks if the three squares are the same, and not empty
 * a,b,c are 0 based row/col indices
 * @param {number} aIndex the first cell index
 * @param {number} bIndex the second cell index
 * @param {number} cIndex the third cell index
 * @returns {boolean} true if squares are the same
 */
function areSquaresSame(aIndex, bIndex, cIndex) {
  if (board[aIndex] === "") {
    return false;
  }
  return board[aIndex] === board[bIndex] && board[bIndex] === board[cIndex];
}

/** 
 *  Checks if the game is over via win or tie.
 *  
 * @returns {[boolean, String, number, number, number]} returns true/false for game is over,
 *  the winning player ("X" or "O" or "" for a tie),
 *  and the cell indices (if any) which made the win. No cells are returned for a tie or when
 *  the game is not yet over.
 */
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

  if (areSquaresSame(topRightIndex, centerIndex, btmLeftIndex)) {
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
    return [true, ""]; // no winner, it is a tie
  }

  return [false, ""]; // the game is still ongoing
}

/*
 Start the first new game when the DOM loads
 */
document.addEventListener("DOMContentLoaded", () => {
  firstTimeSetup();
});
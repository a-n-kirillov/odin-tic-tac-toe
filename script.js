const multiplyString = function(string, times) {
    let multipliedString = ''

    for (let i = 0; i < times; i++) {
        multipliedString += string;
    }

    return multipliedString;
} 

const divmod = (x, y) => [Math.floor(x / y), x % y];

const playerSymbols = (function(xSymbol, oSymbol) {
    return {x: xSymbol, o: oSymbol};
})('X', 'O');

const boardCoordinate = function(x, y) {
    if (x < 0 || x > 2 || y < 0 || y > 2) {
        throw new Error("Wrong coordinates");
    }
    return {x, y};
}

const player = function(name, mark) {
    let _name = name;
    let _mark = mark;

    const getName = () => _name;
    const getMark = () => _mark;

    return {getName, getMark};
}

const gameBoard = (function () {
    let board = [['', '', ''],
                 ['', '', ''],
                 ['', '', '']];
    
    const makeMove = function(boardCoordinate, mark) {
        let boardCell = board[boardCoordinate['y']][boardCoordinate['x']];
        if (boardCell === '') {
            board[boardCoordinate['y']][boardCoordinate['x']] = mark;
        }
    }

    function resetBoard() {
        for (i of [0, 1, 2]) {
            for (j of [0, 1, 2]) {
                board[i][j] = '';
            }
        }
    }

    return {board, resetBoard, makeMove};
})();

const display = (function(board) {
    const announcementHeader = document.querySelector('#game-announcement');
    const htmlCells = Array.from(document.querySelectorAll('#game-display .field'));

    function displayBoard() {
        const htmlCells = document.querySelectorAll('#game-display .field');
        let flattenedBoard = board.flat(1);

        for (i of [...Array(9).keys()]) {
            htmlCells[i].textContent = flattenedBoard[i];
        }
    }

    function toBoardCoordinates(htmlField) {
        const [y, x] = divmod(htmlCells.indexOf(htmlField), 3);
        
        return boardCoordinate(x, y);
    }

    function updateAnnouncement() {
        announcementHeader.textContent = gameState.getAnnouncementString();
    }

    return {displayBoard, toBoardCoordinates, updateAnnouncement, htmlCells};
})(gameBoard.board);

const gameState = (function(boardObject, playerSymbols) {
    const STATES = {inProgress: 0, win: 1, draw: 2};
    let board = boardObject.board;
    let currentState = STATES['inProgress']; 

    function getWinningCombinations() {
        return [multiplyString(playerSymbols['x'], 3), multiplyString(playerSymbols['o'], 3)];
    }

    function checkWin() {
        let foundCombinations = [];
        let winningCombinations = getWinningCombinations();

        for (y of [0, 1, 2]) {
            let rowCombination = ''
            for (x of [0, 1, 2]) {
                rowCombination += board[y][x];
            }
            foundCombinations.push(rowCombination);
        }
        
        for (x of [0, 1, 2]) {
            let columnCombination = '';
            for (y of [0, 1, 2]) {
                columnCombination += board[y][x];
            }
            foundCombinations.push(columnCombination);
        }

        let crossCombination = '';

        for (i of [0, 1, 2]) {    
            crossCombination += board[0 + i][0 + i];
        }

        foundCombinations.push(crossCombination);
        crossCombination = '';

        for (i of [0, 1, 2]) {
            crossCombination += board[0 + i][2 - i];
        }

        foundCombinations.push(crossCombination);

        return {gameWon: foundCombinations.some(combination => winningCombinations.includes(combination)), winningCombination: foundCombinations.filter(combination => winningCombinations.includes(combination))};
    }

    function checkDraw() {
        let flattenedBoard = board.flat(1);
        return !flattenedBoard.some(cell => cell === '');
    }

    function initPlayers() {
        let playerXName = prompt("Please enter the name for the 'X' player:", "X");
        let playerOName = prompt("Please enter the name for the 'O' player:", "O");

        const playerX = player(playerXName, 'X');
        const playerO = player(playerOName, 'O');

        return {x: playerX, o: playerO};
    }

    function updateGameState() {
        if (checkWin()['gameWon']) {
            currentState = STATES['win'];
            return;
        }

        if (checkDraw()) {
            currentState = STATES['draw'];
            return;
        }

        currentPlayer = currentPlayer === players['x'] ? players['o'] : players['x'];
    }

    function getWinner() {
        // will not change after the game will have been settled
        return currentPlayer;
    }

    function getAnnouncementString() {
        let announcementString;

        switch(currentState) {
            case STATES['win']:
                let winner = getWinner();
                announcementString = `${winner.getName()} has won the game!`.toUpperCase();
                resultAnnounced = true;
                break;
            case STATES['draw']:
                announcementString = "It's a draw!".toUpperCase();
                resultAnnounced = true;
                break;
            case STATES['inProgress']:
                announcementString = `${currentPlayer.getName().toUpperCase()}'S TURN`;
                break;
        }

        return announcementString;
    }

    let players = initPlayers();
    let currentPlayer = players['x'];
    let resultAnnounced = false;

    function handleMove(e) {
        const clickedFieldCoordinates = display.toBoardCoordinates(e.target);
        if (currentState !== STATES['inProgress']) {
            return;
        }

        boardObject.makeMove(clickedFieldCoordinates, currentPlayer.getMark());
        display.displayBoard();

        updateGameState();
        display.updateAnnouncement();
    }

    function resetGame(e) {
        currentPlayer = players['x'];
        currentState = STATES['inProgress'];
        boardObject.resetBoard();
        
        display.displayBoard();
        display.updateAnnouncement();
    }

    function setupResetButton() {
        const resetButton = document.querySelector('#reset');
        resetButton.addEventListener('click', resetGame);
    }

    return {handleMove, getAnnouncementString, setupResetButton};
})(gameBoard, playerSymbols);

display.htmlCells.forEach(cell => cell.addEventListener('click', gameState.handleMove));
display.updateAnnouncement();
gameState.setupResetButton();
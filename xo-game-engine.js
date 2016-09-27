/*
*   Engine for processing m,n,k-games
*
*   In particular:
*     - tic-tac-toe is the 3,3,3-game 
*     - free-style gomoku is the 19,19,5-game
*
*   More details about m,n,k - games:
*   https://en.wikipedia.org/wiki/M,n,k-game
*/

function XoGameEngine(sizeX, sizeY, winCondition) {
  var turns = {};
  var currentPlayer = 0;

  this.start = function start() {
    turns = {};
    var currentPlayer = 0;
  }

  this.makeTurn = function makeTurn(x, y) {
    var vectors = [
      [-1, -1, 1, 1],
      [0, -1, 0, 1],
      [1, -1, -1, 1],
      [-1, 0, 1, 0]
    ];
    var newValues = [];
    var winArray = [];
    var isVictory = false;

    if (x < 0 || y < 0 || x > sizeX || y > sizeY || (('' + x + ';' + y) in turns)) {
      return {
        status: "error"
      };
    }

    for (var i = 0; i <= 3; i++) {
      newValues[i] = 1 + getValue(x + vectors[i][0], y + vectors[i][1], i) +
        getValue(x + vectors[i][2], y + vectors[i][3], i);
      if (newValues[i] > 1) {
        setValueByVector(x, y, newValues[i], i, vectors[i].slice(0, 2));
        setValueByVector(x, y, newValues[i], i, vectors[i].slice(2));
      }
      if (newValues[i] >= winCondition) {
        winArray.push([x, y]);
        isVictory = true;
      }
    }

    turns[('' + x + ';' + y)] = {
      player: currentPlayer,
      values: newValues,
    }

    if (isVictory) return {
      status: "victory",
      winArray: winArray,
      winnerId: currentPlayer
    }

    if (Object.keys(turns).length === sizeX * sizeY) {
      return {
        status: "draw"
      };
    }

    currentPlayer = (currentPlayer === 0) ? 1 : 0;
    return {
      status: "ok"
    }

    function getValue(x, y, directionId) {
      if (!(('' + x + ';' + y) in turns)) return 0;
      var res = turns['' + x + ';' + y];
      if (res.player === currentPlayer) {
        return res.values[directionId];
      }
      else return 0;
    }

    function setValueByVector(x, y, value, directionId, vector) {
      var myX = x + vector[0];
      var myY = y + vector[1];
      if (myX < 0 || myY < 0 || myX > sizeX || myY > sizeY || !(('' + myX + ';' + myY) in turns)) return false;
      var thisCell = turns['' + myX + ';' + myY];
      if (thisCell.player === currentPlayer) {
        thisCell.values[directionId] = value;
        if (value >= winCondition) winArray.push([myX, myY]);
        setValueByVector(myX, myY, value, directionId, vector);
      }
    }
  }
}

module.exports = XoGameEngine;
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

function XoGameEngine() {

  var vectors = [
    [-1, -1, 1, 1],
    [0, -1, 0, 1],
    [1, -1, -1, 1],
    [-1, 0, 1, 0]
  ];

  var turns = {};
  var currentPlayerIsFirst = true;
  var winArray = [];
  var isVictory = false;

  var sizeX;
  var sizeY;
  var winCondition;

  this.start = function start(settings, loadedTurns) {
    sizeX = settings.sizeX;
    sizeY = settings.sizeY;
    winCondition = settings.winCondition;
    currentPlayerIsFirst = settings.isNextTurnByX;
    if (loadedTurns) turns = loadedTurns;
    else turns = {};
    winArray = [];
    isVictory = false;
  };

  this.makeTurn = function makeTurn(x, y) {
    var res = {
      x: x,
      y: y
    };
    if (x < 0 || y < 0 || x >= sizeX || y >= sizeY || (('' + x + ';' + y) in turns)) {
      res.status = 'error';
      return res;
    }

    // true means - let's also SET new calculated values to every proper cell
    res.values = calculateValues(x, y, currentPlayerIsFirst, true);

    if (Math.max.apply(null, res.values) >= winCondition) {
      winArray.push([x, y]);
      isVictory = true;
    }

    if (isVictory) {
      res.status = 'victory';
      res.winArray = winArray;
      res.winnerIsFirst = currentPlayerIsFirst;
      return res;
    }

    if (Object.keys(turns).length === sizeX * sizeY) {
      res.status = 'draw';
      return res;
    }

    currentPlayerIsFirst = !currentPlayerIsFirst;
    res.status = 'ok';
    return res;
  };

  this.makeComputedTurn = function() {
    var bestTurn = {
      x: Math.round(Math.random() * (sizeX - 1)),
      y: Math.round(Math.random() * (sizeY - 1)),
      score: 3
    };
    var candidates = {};
    var newTurn;
    var yourValues;
    for (var turn in turns) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j += 2) {
          newTurn = {};
          newTurn.x = vectors[i][j] + parseInt(turn.split(';')[0], 10);
          newTurn.y = vectors[i][j + 1] + parseInt(turn.split(';')[1], 10);
          if (newTurn.x < 0 || newTurn.y < 0 || newTurn.x >= sizeX ||
            newTurn.y >= sizeY || (('' + newTurn.x + ';' + newTurn.y) in turns) ||
            (('' + newTurn.x + ';' + newTurn.y) in candidates)) continue;

          // false means 'only calculate without setting' 
          newTurn.values = calculateValues(newTurn.x, newTurn.y, currentPlayerIsFirst, false);
          if (Math.max.apply(null, newTurn.values) >= winCondition) return this.makeTurn(newTurn.x, newTurn.y);
          yourValues = calculateValues(newTurn.x, newTurn.y, !currentPlayerIsFirst, false);
          if (Math.max.apply(null, yourValues) >= winCondition) {
            newTurn.score = 10000;
          }
          else {
            newTurn.score = newTurn.values.reduce(function(sum, current) {
              return sum + current;
            }, 0) + yourValues.reduce(function(sum, current) {
              return sum + current;
            }, 0);
          }
          candidates[('' + newTurn.x + ';' + newTurn.y)] = newTurn.score;
          if (newTurn.score > bestTurn.score) bestTurn = newTurn;
        }
      }
    }
    return this.makeTurn(bestTurn.x, bestTurn.y);
  };

  // Private methods:

  function getValue(x, y, directionId, isByFirstPlayer) {
    if (isByFirstPlayer === undefined) isByFirstPlayer = currentPlayerIsFirst;
    if (!(('' + x + ';' + y) in turns)) return 0;
    var res = turns['' + x + ';' + y];
    if (res.isByFirstPlayer === isByFirstPlayer) {
      return Number(res.values[directionId]);
    }
    else return 0;
  }

  function calculateValues(x, y, isByFirstPlayer, isAlsoSet) {
    var newValues = [];
    for (var i = 0; i <= 3; i++) {
      newValues[i] = 1 + getValue(x + vectors[i][0], y + vectors[i][1], i, isByFirstPlayer) +
        getValue(x + vectors[i][2], y + vectors[i][3], i, isByFirstPlayer);
      if (isAlsoSet) {
        if (newValues[i] > 1) {
          setValueByVector(x, y, newValues[i], i, vectors[i].slice(0, 2));
          setValueByVector(x, y, newValues[i], i, vectors[i].slice(2));
        }
      }
    }
    if (isAlsoSet) {
      turns[x + ';' + y] = {
        isByFirstPlayer: currentPlayerIsFirst,
        values: newValues,
      };
    }
    return newValues;
  }

  function setValueByVector(x, y, value, directionId, vector) {
    var myX = x + vector[0];
    var myY = y + vector[1];
    if (myX < 0 || myY < 0 || myX >= sizeX || myY >= sizeY || !(('' + myX + ';' + myY) in turns)) return false;
    if (turns['' + myX + ';' + myY].isByFirstPlayer === currentPlayerIsFirst) {
      turns['' + myX + ';' + myY].values[directionId] = value;
      if (value >= winCondition) winArray.push([myX, myY]);
      setValueByVector(myX, myY, value, directionId, vector);
      return true;
    }
    return false;
  }
}

module.exports = XoGameEngine;
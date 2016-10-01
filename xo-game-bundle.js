/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	! function() {

	  'use strict';

	  var Shake = __webpack_require__(1);
	  var XoGameEngine = __webpack_require__(2);

	  var isHumanX = false;
	  var isHumanO = true;
	  var isGameActive = false;
	  var isProcessing = false;
	  var isNextTurnByX = true;
	  var whoGoesFirst = 'x';

	  var backField;
	  var fieldElement;
	  var boardElement;
	  var optionsBtn;
	  var optionsFrame;

	  // creating field 3x3 for collecting 3 items
	  var myGameEngine = new XoGameEngine(3, 3, 3);

	  window.onload = function() {
	    fieldElement = document.querySelector('.field');
	    boardElement = document.querySelector('.board');
	    optionsFrame = document.querySelector('.options-frame');
	    fieldElement.addEventListener('click', clickHandler, false);
	    optionsFrame.querySelector('.options-form').addEventListener('click', submitOptionsHandler, false);
	    optionsBtn = document.querySelector('.options-button');
	    optionsBtn.addEventListener('click', showOptions, false);
	    fieldElement.addEventListener('click', clickHandler, false);

	    initGame();

	    var myShakeEvent = new Shake({
	      threshold: 3,
	      timeout: 1000
	    });
	    myShakeEvent.start();
	    window.addEventListener('shake', shakeEventDidOccur, false);
	  };

	  function submitOptionsHandler(e) {
	    e.preventDefault();
	    if (e.target.id === 'newGameBtn' || e.target.id === 'continueBtn') {
	      isHumanX = (document.forms[0].elements.isHumanX.value === 'true');
	      isHumanO = (document.forms[0].elements.isHumanO.value === 'true');
	      whoGoesFirst = document.forms[0].elements.whoGoesFirst.value;
	      showOptions();
	      setTimeout(function() {
	        document.removeEventListener('click', restartClickHandler, false);
	        if (e.target.id === 'newGameBtn') restartGame(false); 
	        else if (!isHumanX) turnHandler();
	      }, 500);

	    }
	    return false;
	  }

	  function showOptions() {
	    fieldElement.classList.remove('field__start-animation');
	    if (boardElement.classList.contains('options__is-shown')) {
	      boardElement.classList.add('options__animation-hide');
	      setTimeout(function() {
	        boardElement.classList.remove('options__is-shown');
	        boardElement.classList.remove('options__animation-hide');
	      }, 1200);
	    }
	    else {
	      boardElement.classList.add('options__animation-show');
	      setTimeout(function() {
	        boardElement.classList.add('options__is-shown');
	        boardElement.classList.remove('options__animation-show');
	      }, 1200);
	    }
	  }

	  function shakeEventDidOccur() {
	    var elems = document.querySelectorAll('.cell');
	    var delay;
	    if (!boardElement.classList.contains('options__is-shown')) {
	      for (var i = 0; i < elems.length; i++) {
	        if (!elems[i].classList.contains('mega-swing')) {
	          delay = Math.random() * 800;
	          (function(elem, delay) {
	            setTimeout(function() {
	              elem.classList.add('mega-swing');
	            }, delay);
	            setTimeout(function() {
	              elem.classList.remove('mega-swing');
	            }, delay + 2100);
	          })(elems[i], delay);
	        }
	      }
	    }
	    else if (!optionsFrame.classList.contains('mega-swing')) {
	      optionsFrame.classList.add('mega-swing');
	      setTimeout(function() {
	        optionsFrame.classList.remove('mega-swing');
	      }, 2100);
	    }
	  }

	  function initGame() {
	    var fragment = document.createDocumentFragment();
	    var newElement;
	    for (var i = 0; i < 9; i++) {
	      newElement = document.createElement('div');
	      newElement.className = 'cell empty';
	      newElement.id = 'cell' + (i % 3) + '_' + Math.floor(i / 3);
	      fragment.appendChild(newElement);
	    }
	    newElement = document.createElement('div');
	    newElement.className = 'field__background';
	    newElement.innerHTML = 'x';
	    fragment.appendChild(newElement);
	    fieldElement.appendChild(fragment);
	    backField = document.querySelector('.field__background');
	    myGameEngine.start();
	    if (whoGoesFirst === 'random') isNextTurnByX = !!Math.round(Math.random());
	    else isNextTurnByX = (whoGoesFirst === 'x');
	    newElement.innerHTML = (isNextTurnByX) ? 'x' : 'o';
	    isGameActive = true;
	    isProcessing = false;
	    if (!isHumanX) turnHandler();
	  }

	  function clickHandler(e) {
	    e.preventDefault();
	    var elem = document.elementFromPoint(e.clientX, e.clientY);
	    if (!isProcessing && isGameActive && elem.classList.contains('empty')) {
	      isProcessing = true;
	      if (isNextTurnByX && isHumanX || !isNextTurnByX && isHumanO) turnHandler(elem);
	      else turnHandler();
	    }
	  }

	  function turnHandler(elem) {
	    var turnRes;
	    isProcessing = true;
	    if (elem === undefined) {
	      turnRes = myGameEngine.makeComputedTurn();
	      elem = document.querySelector('#cell' + turnRes.x + '_' + turnRes.y);
	    }
	    else turnRes = myGameEngine.makeTurn(Number(elem.id.slice(4, elem.id.indexOf('_'))),
	      Number(elem.id.slice(elem.id.indexOf('_') + 1)));
	    elem.classList.remove('empty');
	    if (isNextTurnByX) {
	      elem.classList.add('x-cell');
	      elem.innerHTML = 'x';
	    }
	    else {
	      elem.classList.add('o-cell');
	      elem.innerHTML = 'o';
	    }
	    elem.classList.add('start-swing');
	    setTimeout(function() {
	      elem.classList.remove('start-swing');
	    }, 2000);

	    if (turnRes.status === 'victory') {
	      for (var i = 0; i < turnRes.winArray.length; i++) {
	        document.querySelector('#cell' + turnRes.winArray[i].join('_')).classList.add('win-combo');
	      }
	    }
	    else if (turnRes.status === 'draw') {
	      backField.classList.add('field__background-fadeout');
	    }

	    if (turnRes.status === 'draw' || turnRes.status === 'victory') {
	      var elems = document.querySelectorAll('.cell:not(.win-combo)');
	      for (var i = 0; i < elems.length; i++) {
	        elems[i].classList.add('cell-fadeout');
	      }
	      isGameActive = false;
	      setTimeout(function() {
	          document.addEventListener('click', restartClickHandler, false);
	        },
	        1500);
	    }
	    else {
	      isNextTurnByX = !isNextTurnByX;
	      fadeBackground();
	    }

	    if (isGameActive && !(isNextTurnByX && isHumanX || !isNextTurnByX && isHumanO))
	      setTimeout(turnHandler, Math.random() * 1000 + 1500);
	    else isProcessing = false;
	  }

	  function restartGame(isWithAnimation) {
	    if (isWithAnimation) {
	      fieldElement.classList.add('field__start-animation');
	    }
	    while (fieldElement.firstChild) {
	      fieldElement.removeChild(fieldElement.firstChild);
	    }
	    initGame();
	  }

	  function restartClickHandler(e) {
	    if (document.elementFromPoint(e.clientX, e.clientY).className === 'options-button' ||
	      boardElement.classList.contains('options__is-shown')) return;
	    document.removeEventListener('click', restartClickHandler, false);
	    restartGame(true);
	  }

	  function fadeBackground() {
	    backField.classList.add('field__background-fadeout');
	    setTimeout(function() {
	      backField.innerHTML = (isNextTurnByX) ? 'x' : 'o';
	      backField.classList.remove('field__background-fadeout');
	    }, 500);
	  }

	}();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * Author: Alex Gibson
	 * https://github.com/alexgibson/shake.js
	 * License: MIT license
	 */

	(function(global, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	            return factory(global, global.document);
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module.exports) {
	        module.exports = factory(global, global.document);
	    } else {
	        global.Shake = factory(global, global.document);
	    }
	} (typeof window !== 'undefined' ? window : this, function (window, document) {

	    'use strict';

	    function Shake(options) {
	        //feature detect
	        this.hasDeviceMotion = 'ondevicemotion' in window;

	        this.options = {
	            threshold: 15, //default velocity threshold for shake to register
	            timeout: 1000 //default interval between events
	        };

	        if (typeof options === 'object') {
	            for (var i in options) {
	                if (options.hasOwnProperty(i)) {
	                    this.options[i] = options[i];
	                }
	            }
	        }

	        //use date to prevent multiple shakes firing
	        this.lastTime = new Date();

	        //accelerometer values
	        this.lastX = null;
	        this.lastY = null;
	        this.lastZ = null;

	        //create custom event
	        if (typeof document.CustomEvent === 'function') {
	            this.event = new document.CustomEvent('shake', {
	                bubbles: true,
	                cancelable: true
	            });
	        } else if (typeof document.createEvent === 'function') {
	            this.event = document.createEvent('Event');
	            this.event.initEvent('shake', true, true);
	        } else {
	            return false;
	        }
	    }

	    //reset timer values
	    Shake.prototype.reset = function () {
	        this.lastTime = new Date();
	        this.lastX = null;
	        this.lastY = null;
	        this.lastZ = null;
	    };

	    //start listening for devicemotion
	    Shake.prototype.start = function () {
	        this.reset();
	        if (this.hasDeviceMotion) {
	            window.addEventListener('devicemotion', this, false);
	        }
	    };

	    //stop listening for devicemotion
	    Shake.prototype.stop = function () {
	        if (this.hasDeviceMotion) {
	            window.removeEventListener('devicemotion', this, false);
	        }
	        this.reset();
	    };

	    //calculates if shake did occur
	    Shake.prototype.devicemotion = function (e) {
	        var current = e.accelerationIncludingGravity;
	        var currentTime;
	        var timeDifference;
	        var deltaX = 0;
	        var deltaY = 0;
	        var deltaZ = 0;

	        if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
	            this.lastX = current.x;
	            this.lastY = current.y;
	            this.lastZ = current.z;
	            return;
	        }

	        deltaX = Math.abs(this.lastX - current.x);
	        deltaY = Math.abs(this.lastY - current.y);
	        deltaZ = Math.abs(this.lastZ - current.z);

	        if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))) {
	            //calculate time in milliseconds since last shake registered
	            currentTime = new Date();
	            timeDifference = currentTime.getTime() - this.lastTime.getTime();

	            if (timeDifference > this.options.timeout) {
	                window.dispatchEvent(this.event);
	                this.lastTime = new Date();
	            }
	        }

	        this.lastX = current.x;
	        this.lastY = current.y;
	        this.lastZ = current.z;

	    };

	    //event handler
	    Shake.prototype.handleEvent = function (e) {
	        if (typeof (this[e.type]) === 'function') {
	            return this[e.type](e);
	        }
	    };

	    return Shake;
	}));


/***/ },
/* 2 */
/***/ function(module, exports) {

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

	  this.start = function start() {
	    turns = {};
	    currentPlayerIsFirst = true;
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
	    var newValues = calculateValues(x, y, currentPlayerIsFirst, true);

	    if (Math.max.apply(null, newValues) >= winCondition) {
	      winArray.push([x, y]);
	      isVictory = true;
	    }

	    if (isVictory) {
	      res.status = 'victory';
	      res.winArray = winArray;
	      res.winnerIsFirst = currentPlayerIsFirst;
	      return res;
	    };

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
	      x: Math.round(Math.random() * (sizeX-1)),
	      y: Math.round(Math.random() * (sizeY-1)),
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
	          if (newTurn.x < 0 || newTurn.y < 0 || newTurn.x >= sizeX 
	            || newTurn.y >= sizeY || (('' + newTurn.x + ';' + newTurn.y) in turns)
	            || (('' + newTurn.x + ';' + newTurn.y) in candidates)) continue;
	          
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
	      return res.values[directionId];
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
	      turns[('' + x + ';' + y)] = {
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

/***/ }
/******/ ]);
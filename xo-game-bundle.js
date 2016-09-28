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

	  var nextTurnIsX;
	  var backField;
	  var field;
	  var isGameActive;

	  var Shake = __webpack_require__(1);  
	  var XoGameEngine = __webpack_require__(2);

	  // creating field 3x3 for collecting 3 items
	  var myGameEngine = new XoGameEngine(3, 3, 3);

	  window.onload = function() {
	    alert('test');
	    field = document.querySelector('.field');
	    field.addEventListener('click', clickHandler, false);
	    initGame();

	    var myShakeEvent = new Shake({
	      threshold: 3,
	      timeout: 1000
	    });
	    myShakeEvent.start();
	    window.addEventListener('shake', shakeEventDidOccur, false);
	  };

	  function shakeEventDidOccur() {
	    var elems = document.querySelectorAll('.cell');
	    var delay;
	    for (var i = 0; i < elems.length; i++) {
	      if (!elems[i].classList.contains('mega-swing')) {
	        delay = Math.random() * 800;
	        (function(elem, delay) {
	          setTimeout(function() {
	            elem.classList.add('mega-swing');
	          }, delay);
	          setTimeout(function() {
	            elem.classList.remove('mega-swing');
	          }, delay + 2000);
	        })(elems[i], delay);
	      }
	    }
	  }

	  function initGame() {
	    var fragment = document.createDocumentFragment();
	    var newElement;
	    for (var i = 0; i < 9; i++) {
	      newElement = document.createElement('div');
	      newElement.className = 'cell empty';
	      newElement.id = 'cell' + (i % 3 + 1) + Math.floor(i / 3 + 1);
	      fragment.appendChild(newElement);
	    }
	    newElement = document.createElement('div');
	    newElement.className = 'field__background';
	    newElement.innerHTML = 'x';
	    fragment.appendChild(newElement);
	    field.appendChild(fragment);
	    nextTurnIsX = true;
	    backField = document.querySelector('.field__background');
	    myGameEngine.start();
	    isGameActive = true;
	  }

	  function clickHandler(e) {
	    e.preventDefault();
	    var elem = document.elementFromPoint(e.clientX, e.clientY);
	    var turnRes;
	    if (isGameActive && elem.classList.contains('empty')) {
	      elem.classList.remove('empty');
	      if (nextTurnIsX) {
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
	      turnRes = myGameEngine.makeTurn(Number(elem.id.charAt(4)), Number(elem.id.charAt(5)));
	      if (turnRes.status === 'victory') {
	        for (var i = 0; i < turnRes.winArray.length; i++) {
	          document.querySelector('#cell' + turnRes.winArray[i].join('')).classList.add('win-combo');
	        }
	      }
	      if (turnRes.status === 'draw' || turnRes.status === 'victory') {
	        var elems = document.querySelectorAll('.cell:not(.win-combo)');
	        for (var i = 0; i < elems.length; i++) {
	          elems[i].classList.add('cell-fadeout');
	        }
	        setClickToRestart();
	      }
	      else {
	        nextTurnIsX = !nextTurnIsX;
	        fadeBackground(backField);
	      }
	    }
	  }

	  function setClickToRestart() {
	    isGameActive = false;
	    setTimeout(function() {
	        document.addEventListener('click', restartClickHandler, false);
	      },
	      1500);
	  }

	  function restartClickHandler() {
	    document.removeEventListener('click', restartClickHandler, false);
	    fadeBackground(field, 100);
	    field.classList.remove('field-fadeout');
	    while (field.firstChild) {
	      field.removeChild(field.firstChild);
	    }
	    initGame();
	  }

	  function fadeBackground(element, ms) {
	    var time = ms || 500;
	    element.classList.add('fadeout');
	    setTimeout(function() {
	      if (element === backField) element.innerHTML = (nextTurnIsX) ? 'x' : 'o';
	      element.classList.remove('fadeout');
	    }, time);
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

/***/ }
/******/ ]);
! function() {

  'use strict';

  var isHumanX = true;
  var isHumanO = true;

  var nextTurnIsX;
  var backField;
  var fieldElement;
  var boardElement;
  var isGameActive;
  var isProcessing;
  var isOptionsShown = false;
  var optionsBtn;

  var Shake = require('shake.js');
  var XoGameEngine = require('./xo-game-engine');

  // creating field 3x3 for collecting 3 items
  var myGameEngine = new XoGameEngine(3, 3, 3);

  window.onload = function() {
    fieldElement = document.querySelector('.field');
    boardElement = document.querySelector('.board');
    fieldElement.addEventListener('click', clickHandler, false);
    document.querySelector('#myonoffswitch').addEventListener('click', function() {
      isHumanX = !isHumanX;
    }, false);
    document.querySelector('#myonoffswitch2').addEventListener('click', function() {
      isHumanO = !isHumanO;
    }, false);
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

  function showOptions() {
    fieldElement.classList.remove('field-start-animation');
    if (boardElement.classList.contains('options-is-shown')) {
      boardElement.classList.add('options-no-show');
      setTimeout(function() {
        boardElement.classList.remove('options-is-shown');
        boardElement.classList.remove('options-no-show');
      }, 1200);
    }
    else {
      boardElement.classList.add('options-show');
      setTimeout(function() {
        boardElement.classList.add('options-is-shown');
        boardElement.classList.remove('options-show');
      }, 1200);
    }
    isOptionsShown = !isOptionsShown;
  }

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
      newElement.id = 'cell' + (i % 3) + '_' + Math.floor(i / 3);
      fragment.appendChild(newElement);
    }
    newElement = document.createElement('div');
    newElement.className = 'field__background';
    newElement.innerHTML = 'x';
    fragment.appendChild(newElement);
    fieldElement.appendChild(fragment);
    nextTurnIsX = true;
    backField = document.querySelector('.field__background');
    myGameEngine.start();
    isGameActive = true;
    isProcessing = false;
    if (!isHumanX) turnHandler();
  }

  function clickHandler(e) {
    e.preventDefault();
    var elem = document.elementFromPoint(e.clientX, e.clientY);
    if (!elem.classList.contains('cell')) return;
    if (isProcessing) return;
    else isProcessing = true;
    if (isGameActive && elem.classList.contains('empty')) {
      if (nextTurnIsX && isHumanX || !nextTurnIsX && isHumanO) turnHandler(elem);
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

    if (turnRes.status === 'victory') {
      for (var i = 0; i < turnRes.winArray.length; i++) {
        document.querySelector('#cell' + turnRes.winArray[i].join('_')).classList.add('win-combo');
      }
    }
    else if (turnRes.status === 'draw') {
      backField.classList.add('fadeout');
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
      nextTurnIsX = !nextTurnIsX;
      fadeBackground(backField);
    }

    if (isGameActive && !(nextTurnIsX && isHumanX || !nextTurnIsX && isHumanO))
      setTimeout(turnHandler, Math.random() * 1000 + 1500);
    else isProcessing = false;
  }

  function restartClickHandler(e) {
    if (document.elementFromPoint(e.clientX, e.clientY).className === 'options-button' ||
      boardElement.classList.contains('options-is-shown')) return;
    document.removeEventListener('click', restartClickHandler, false);
    fadeBackground(fieldElement, 100);
    fieldElement.classList.add('field-start-animation');
    fieldElement.classList.remove('field-fadeout');
    while (fieldElement.firstChild) {
      fieldElement.removeChild(fieldElement.firstChild);
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
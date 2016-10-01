! function() {

  'use strict';

  var Shake = require('shake.js');
  var XoGameEngine = require('./xo-game-engine');

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
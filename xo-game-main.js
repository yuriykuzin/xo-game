! function() {

  'use strict';

  var Shake = require('shake.js');
  var XoGameEngine = require('./xo-game-engine');

  var isJustLoaded = true;
  var isProcessing = false;

  var gameSettings = {
    isHumanX: false,
    isHumanO: true,
    isGameActive: false,
    isNextTurnByX: true,
    whoGoesFirst: 'x',
    sizeX: 3,
    sizeY: 3,
    winCondition: 3
  };

  var backField;
  var fieldElement;
  var boardElement;
  var optionsBtn;
  var optionsFrame;

  // creating field 3x3 for collecting 3 items
  var myGameEngine = new XoGameEngine(3, 3, 3);

  window.onload = function() {
    fieldElement = document.querySelector('.field');
    setTimeout(function() {
      fieldElement.classList.remove('field__start-animation');
    }, 1200);
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

  function showModalMessage(msg) {
    var modal = document.getElementById('myModal');
    var fnClose = function(e) {
      modal.classList.add('modal__animation-hide');
      modal.classList.remove('modal__animation-show');
      window.removeEventListener('click', fnClose);
      
      // for browsers which doesn't support css animations:
      setTimeout(function () {
        modal.style.zIndex = -1;
      }, 1500);
    };
    fieldElement.classList.remove('field__start-animation');
    modal.querySelector('.modal__content__message').innerHTML = msg;
    modal.classList.add('modal__animation-show');
    modal.classList.remove('modal__animation-hide');
    window.addEventListener('click', fnClose);
  }

  function submitOptionsHandler(e) {
    e.preventDefault();
    if (e.target.id === 'newGameBtn' || e.target.id === 'continueBtn') {
      gameSettings.isHumanX = document.forms[0].elements.isHumanX.value === 'true';
      gameSettings.isHumanO = document.forms[0].elements.isHumanO.value === 'true';
      gameSettings.whoGoesFirst = document.forms[0].elements.whoGoesFirst.value;
      saveSettingsToLocal();
      showOptions();
        document.removeEventListener('click', restartClickHandler, false);
        if (e.target.id === 'newGameBtn') restartGame(false);
        else turnHandler();

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
      document.forms[0].elements.isHumanX.value = gameSettings.isHumanX;
      document.forms[0].elements.isHumanO.value = gameSettings.isHumanO;
      document.forms[0].elements.whoGoesFirst.value = gameSettings.whoGoesFirst;
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

  /* global localStorage */

  function loadFromLocal() {
    var loadTurns;
    var loadTurn;
    var turns = {};
    var elem;
    var letter;
    for (var key in gameSettings) {
      if (localStorage[key] !== undefined) {
        gameSettings[key] = (key === 'whoGoesFirst') ? localStorage[key] : JSON.parse(localStorage[key]);
      }
      else {
        localStorage.clear();
        return false;
      }
    }
    if (localStorage.turns) {
      loadTurns = localStorage.turns.split('/');
      if (loadTurns.length < 1) return false;
      for (var i = loadTurns.length; i--;) {
        loadTurn = loadTurns[i].split('_');
        if (loadTurn.length !== 3) return false;
        turns[loadTurn[0]] = {};
        turns[loadTurn[0]].isByFirstPlayer = (loadTurn[1] === '1');
        turns[loadTurn[0]].values = loadTurn[2].split(',');
        turns[loadTurn[0]].values.forEach(function(item, i, arr) {
          arr[i] = Number(item);
        });
        elem = document.querySelector('#cell' +
          loadTurn[0].slice(0, loadTurn[0].indexOf(';')) + '_' + loadTurn[0].slice(loadTurn[0].indexOf(';') + 1));
        letter = (loadTurn[1] === '0') ? 'o' : 'x';
        elem.classList.add(letter + '-cell');
        elem.innerHTML = letter;
      }
    }
    return turns;
  }

  function saveSettingsToLocal() {
    for (var key in gameSettings) {
      localStorage[key] = gameSettings[key];
    }
  }

  function initGame() {
    var fragment = document.createDocumentFragment();
    var newElement;
    var loadedTurns;
    for (var i = 0; i < 9; i++) {
      newElement = document.createElement('div');
      newElement.className = 'cell empty';
      newElement.id = 'cell' + (i % 3) + '_' + Math.floor(i / 3);
      fragment.appendChild(newElement);
    }
    newElement = document.createElement('div');
    newElement.className = 'field__background';
    fragment.appendChild(newElement);
    fieldElement.appendChild(fragment);

    backField = document.querySelector('.field__background');

    if (isJustLoaded && localStorage.length >= 8) {
      loadedTurns = loadFromLocal();
      if (loadedTurns) showModalMessage('Your game settings and turns were loaded from the local storage');
    }

    if (!loadedTurns) {
      // Starting new game
      gameSettings.isGameActive = true;
      saveSettingsToLocal();
      if (gameSettings.whoGoesFirst === 'random') gameSettings.isNextTurnByX = !!Math.round(Math.random());
      else gameSettings.isNextTurnByX = (gameSettings.whoGoesFirst === 'x');
      localStorage.removeItem('turns');
    }

    myGameEngine.start(gameSettings, loadedTurns);
    isJustLoaded = false;
    backField.innerHTML = (gameSettings.isNextTurnByX) ? 'x' : 'o';
    isProcessing = false;
    turnHandler();
  }

  function clickHandler(e) {
    e.preventDefault();
    var elem = document.elementFromPoint(e.clientX, e.clientY);
    if (!isProcessing && gameSettings.isGameActive && elem.classList.contains('empty')) {
      isProcessing = true;
      if (checkIfDeviceMove()) {
        turnHandler();
      }
      else {
        turnHandler(elem);
      }
    }
  }

  function turnHandler(elem) {
    if (elem === undefined && !checkIfDeviceMove()) return;
    var turnRes;
    isProcessing = true;
    if (elem === undefined) {
      turnRes = myGameEngine.makeComputedTurn();
      elem = document.querySelector('#cell' + turnRes.x + '_' + turnRes.y);
    }
    else turnRes = myGameEngine.makeTurn(Number(elem.id.slice(4, elem.id.indexOf('_'))),
      Number(elem.id.slice(elem.id.indexOf('_') + 1)));
    elem.classList.remove('empty');
    if (gameSettings.isNextTurnByX) {
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
      gameSettings.isGameActive = false;
      localStorage.removeItem('turns');
      setTimeout(function() {
          document.addEventListener('click', restartClickHandler, false);
        },
        1500);
    }
    else {
      gameSettings.isNextTurnByX = !gameSettings.isNextTurnByX;
      fadeBackground();

      // Save turn to the localStorage:
      if (!localStorage.turns) localStorage.turns = '';
      else localStorage.turns += '/';
      localStorage.turns = myGameEngine.turnsToString();
      localStorage.isNextTurnByX = gameSettings.isNextTurnByX;
    }

    if (gameSettings.isGameActive && checkIfDeviceMove()) {
      setTimeout(turnHandler, Math.random() * 600 + 1500);
    }
    else {
      isProcessing = false;
    }
  }

  function checkIfDeviceMove() {
    return (gameSettings.isNextTurnByX && !gameSettings.isHumanX || !gameSettings.isNextTurnByX && !gameSettings.isHumanO);
  }

  function restartGame(isWithAnimation) {
    if (isWithAnimation) {
      fieldElement.classList.add('field__start-animation');
      setTimeout(function() {
        fieldElement.classList.remove('field__start-animation');
      }, 1200);
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
      backField.innerHTML = (gameSettings.isNextTurnByX) ? 'x' : 'o';
      backField.classList.remove('field__background-fadeout');
    }, 500);
  }

}();
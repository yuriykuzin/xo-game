! function() {

  'use strict';

  var Shake = require('shake.js');
  var XoGameEngine = require('./xo-game-engine');
  var myGameEngine = new XoGameEngine();

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
 
  //  fast access to some DOM elements:
  var backFieldElement;
  var fieldElement;
  var boardGameElement;
  var boardElement;
  var optionsBtnElement;
  var optionsFrameElement;
  var myCellStyle;
  
  var isContinueEnabled = true;
  var isJustLoaded = true;
  var isProcessing = false;

  window.onload = function() {
    myCellStyle = document.createElement('style');
    myCellStyle.id = 's_myCellStyle';
    document.head.appendChild(myCellStyle);
    myCellStyle = document.getElementById('s_myCellStyle');
    boardGameElement = document.querySelector('.board__game');
    fieldElement = document.querySelector('.field');
    boardElement = document.querySelector('.board');
    optionsFrameElement = document.querySelector('.options-frame');    
    backFieldElement = document.querySelector('.field__background');
    optionsBtnElement = document.querySelector('.options-button');
    
    setTimeout(function() {
      boardGameElement.classList.remove('boardgame__start-animation');
    }, 1200);
  
    fieldElement.addEventListener('click', clickHandler, false);
    optionsFrameElement.querySelector('.options-form').addEventListener('click', submitOptionsHandler, false);
    optionsFrameElement.querySelector('.options-form').addEventListener('change', checkIfSizeWinChange, false);
    optionsBtnElement.addEventListener('click', showOptions, false);
    fieldElement.addEventListener('click', clickHandler, false);

    var myShakeEvent = new Shake({
      threshold: 3,
      timeout: 1000
    });
    myShakeEvent.start();
    window.addEventListener('shake', shakeEventDidOccur, false);
    
    initGame();
  };
  
  function initGame() {
    var fragment = document.createDocumentFragment();
    var isSettingsLoaded = false;
    var newElement;
    var newRow;
    var loadedTurns;
    var size;
    
    if (isJustLoaded && localStorage.length >= 8) {
      isSettingsLoaded = loadSettingsFromLocal();
    }

    if (checkIfTicTacToe()) {

      // TicTacToe game (original version of appearance):
      myCellStyle.textContent = '';
      for (var i = 0; i < gameSettings.sizeY; i++) {
        newRow = document.createElement('div');
        newRow.className = 'field__row';
        for (var j = 0; j < gameSettings.sizeX; j++) {
          newElement = document.createElement('div');
          newElement.className = 'cell empty';
          newElement.id = 'cell' + j + '_' + i;
          newRow.appendChild(newElement);
        }
        fragment.appendChild(newRow);
      }
    }
    else {

      /*
      *   Custom field of any size and win condition. 
      *   Render it with dotted borders and custom size:
      */
      size = 90 / (Math.max(gameSettings.sizeX, gameSettings.sizeY)) 
        - 140 / Math.min(document.body.clientWidth, document.body.clientHeight);
      myCellStyle.textContent = '.cell {width: ' + size + 'vmin; height: ' + size +
        'vmin; font-size: ' + (size) + 'vmin;}';
      for (var i = 0; i < gameSettings.sizeY; i++) {
        newRow = document.createElement('div');
        newRow.className = 'field__row';
        for (var j = 0; j < gameSettings.sizeX; j++) {
          newElement = document.createElement('div');
          newElement.className = 'cell empty custom-cell';
          newElement.id = 'cell' + j + '_' + i;
          newElement.style.maxWidth = size + 'vmin';
          newRow.appendChild(newElement);
        }
        fragment.appendChild(newRow);
      }
    }
    fieldElement.appendChild(fragment);

    if (!isSettingsLoaded) {
      
      // Starting new game
      gameSettings.isGameActive = true;
      saveSettingsToLocal();
      if (gameSettings.whoGoesFirst === 'random') gameSettings.isNextTurnByX = !!Math.round(Math.random());
      else gameSettings.isNextTurnByX = (gameSettings.whoGoesFirst === 'x');
      localStorage.removeItem('turns');
    }
    else {
      
      // Try to load turns if succeed in loading settings
      loadedTurns = loadTurnsFromLocal();
      showModalMessage('Your game settings and turns were loaded from the local storage');
    }
    
    backFieldElement.innerHTML = (gameSettings.isNextTurnByX) ? 'x' : 'o';
    myGameEngine.start(gameSettings, loadedTurns);
    isJustLoaded = false;
    isProcessing = false;
    turnHandler();
  }  

  /*
  *   Handler for checking whether size or win conditions were changed in the settings form
  *
  */
  function checkIfSizeWinChange(e) {
    if (gameSettings.sizeX !== Number(document.forms[0].elements.sizeX.value) ||
      gameSettings.sizeY !== Number(document.forms[0].elements.sizeY.value) ||
      gameSettings.winCondition !== Number(document.forms[0].elements.winCondition.value)) {
        
      // there was a change of size or win conditions --> disable Continue btn if enabled
      if (isContinueEnabled) {
        isContinueEnabled = false;
        document.querySelector('#continueBtn').classList.add('btn-disabled');
      }
    }
    else {

      // no change of size or win conditions --> enable Continue btn if disabled
      if (!isContinueEnabled) {
        isContinueEnabled = true;
        document.querySelector('#continueBtn').classList.remove('btn-disabled');
      }
    }
  }

  function showModalMessage(msg) {
    var modal = document.getElementById('myModal');
    var fnClose = function(e) {
      modal.classList.add('modal__animation-hide');
      modal.classList.remove('modal__animation-show');
      window.removeEventListener('click', fnClose);
      window.removeEventListener('keydown', fnClose);
      setTimeout(function() {
        modal.style.zIndex = -1;
      }, 1500);
    };
    modal.style.zIndex = 2;
    boardGameElement.classList.remove('boardgame__start-animation');
    modal.querySelector('.modal__content__message').innerHTML = msg;
    modal.classList.add('modal__animation-show');
    modal.classList.remove('modal__animation-hide');
    window.addEventListener('click', fnClose);
    window.addEventListener('keydown', fnClose);
  }

  function submitOptionsHandler(e) {
    e.preventDefault();
    if (e.target.id === 'newGameBtn' ||
      (e.target.id === 'continueBtn' && isContinueEnabled)) {
      showOptions();
      document.removeEventListener('click', restartClickHandler, false);
      if (e.target.id === 'newGameBtn') {
        setTimeout(function () {
          restartGame(false);
        }, 400);
      }
      else turnHandler();
    }
    return false;
  }

  function showOptions(e) {
    boardGameElement.classList.remove('boardgame__start-animation');
    if (boardElement.classList.contains('options__is-shown')) {
      if (!e || e.target.className !== 'options-button') {
        
        // saving changes if it is not a click to 'Options' button:
        gameSettings.isHumanX = document.forms[0].elements.isHumanX.value === 'true';
        gameSettings.isHumanO = document.forms[0].elements.isHumanO.value === 'true';
        gameSettings.whoGoesFirst = document.forms[0].elements.whoGoesFirst.value;
        gameSettings.sizeX = Number(document.forms[0].elements.sizeX.value);
        gameSettings.sizeY = Number(document.forms[0].elements.sizeY.value);
        gameSettings.winCondition = Number(document.forms[0].elements.winCondition.value);
        saveSettingsToLocal();
      }
      
      //  Let's switch to "Game board" frame
      boardElement.classList.add('options__animation-hide');
      setTimeout(function() {
        boardElement.classList.remove('options__is-shown');
        boardElement.classList.remove('options__animation-hide');
      }, 1400);
    }
    else {
      
      //  Let's switch to "Options" frame
      document.forms[0].elements.isHumanX.value = gameSettings.isHumanX;
      document.forms[0].elements.isHumanO.value = gameSettings.isHumanO;
      document.forms[0].elements.whoGoesFirst.value = gameSettings.whoGoesFirst;
      document.forms[0].elements.sizeX.value = gameSettings.sizeX;
      document.forms[0].elements.sizeY.value = gameSettings.sizeY;
      document.forms[0].elements.winCondition.value = gameSettings.winCondition;
      isContinueEnabled = true;
      document.querySelector('#continueBtn').classList.remove('btn-disabled');
      boardElement.classList.add('options__animation-show');
      setTimeout(function() {
        boardElement.classList.add('options__is-shown');
        boardElement.classList.remove('options__animation-show');
      }, 1400);
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
    else if (!optionsFrameElement.classList.contains('mega-swing')) {
      optionsFrameElement.classList.add('mega-swing');
      setTimeout(function() {
        optionsFrameElement.classList.remove('mega-swing');
      }, 2100);
    }
  }

  /* global localStorage */

  function loadSettingsFromLocal() {
    for (var key in gameSettings) {
      if (localStorage[key] !== undefined) {
        gameSettings[key] = (key === 'whoGoesFirst') ? localStorage[key] : JSON.parse(localStorage[key]);
      }
      else {
        localStorage.clear();
        return false;
      }
    }
    return true;
  }

  function loadTurnsFromLocal() {
    var turns = {};    
    var loadTurns;
    var loadTurn;
    var elem;
    var letter;
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

  function checkIfTicTacToe() {
    return gameSettings.sizeX === 3 && gameSettings.sizeY === 3 && gameSettings.winCondition === 3;
  }

  /*
  *   This handler is fired when user clicks on the cell
  *
  */
  function clickHandler(e) {
    e.preventDefault();
    var elem = document.elementFromPoint(e.clientX, e.clientY);
    if (!isProcessing && gameSettings.isGameActive && elem.classList.contains('empty')) {
      isProcessing = true;
      if (checkIfDeviceTurn()) {
        turnHandler();
      }
      else {
        turnHandler(elem);
      }
    }
  }

  /*
  *   This handler is fired by clickHandler or other methods 
  *   to calculate device's turn or to process user's one
  *
  */
  function turnHandler(elem) {
    if (elem === undefined && !checkIfDeviceTurn()) return;
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
      backFieldElement.classList.add('field__background-fadeout');
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

    if (gameSettings.isGameActive && checkIfDeviceTurn()) {
      setTimeout(turnHandler, Math.random() * 600 + 1500);
    }
    else {
      isProcessing = false;
    }
  }

  function checkIfDeviceTurn() {
    return (gameSettings.isNextTurnByX && !gameSettings.isHumanX || 
      !gameSettings.isNextTurnByX && !gameSettings.isHumanO);
  }

  function restartGame(isWithAnimation) {
    if (isWithAnimation) {
      boardGameElement.classList.add('boardgame__start-animation');
      setTimeout(function() {
        boardGameElement.classList.remove('boardgame__start-animation');
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
    backFieldElement.classList.add('field__background-fadeout');
    setTimeout(function() {
      backFieldElement.innerHTML = (gameSettings.isNextTurnByX) ? 'x' : 'o';
      backFieldElement.classList.remove('field__background-fadeout');
    }, 800);
  }

}();

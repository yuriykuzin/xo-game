! function() {

  'use strict';

  var nextTurnIsX;
  var backField;
  var field;
  var isGameActive;

  var Shake = require('shake.js');  
  var XoGameEngine = require("./xo-game-engine");

  //  creating field 3x3 for collecting 3 items
  var myGameEngine = new XoGameEngine(3, 3, 3);

  window.onload = function() {
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
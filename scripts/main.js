'use strict';

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');

var testFormElement = document.getElementById('test-form');
var testAInputElement = document.getElementById('testA');
var testBInputElement = document.getElementById('testB');
var submit2ButtonElement = document.getElementById('submit2');

var targetNumber = 5678;
var userGuessedNumbers = [];

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="number"></div>' +
      '<div class="result"></div>' +
    '</div>';

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Displays a new Message in the UI.
function appendNewResult() {
  var id = userGuessedNumbers.length - 1;
  if (id < 0) return;

  var container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE;
  var div = container.firstChild;
  div.setAttribute('id', id);
  div.querySelector('.number').textContent = userGuessedNumbers[id][0];
  div.querySelector('.result').textContent = userGuessedNumbers[id][1];
  
  messageListElement.insertBefore(div, null);

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

function check4Digits(guessNum) {
  return new Promise(function(resolve, reject) {
    var i, j;
    var guessStr = guessNum.toString();

    if(!/(^\d{4}$)/.test(guessStr)) {
      reject('It must be a 4-digits-number that you guessed!');
    }
    for (i=1; i<4; i++){
      for (j=0; j<i; j++) {
        if (guessStr[i] == guessStr[j]) {
          reject('The number must have different digits!');
        }
      }
    }
    resolve(guessStr);
  });
}

function compare4Digits(guessStr) {
  var i, j;
  var tgtStr = targetNumber.toString();
  var A=0, B=0;
  
  for (i=0; i<4; i++) {
    for (j=0; j<4; j++) {
      if (tgtStr[i] == guessStr[j]) {
        if (i==j) {
          A++;
        }
        else {
          B++;
        }
      }
    }
  }

  return ([A, B]);
}

// Saves a new message on the Cloud Firestore.
function submitNewNumber(messageText) {
  // Add a new message entry to the Firebase database.
  return check4Digits(messageText).then(compare4Digits).then(function(result){
    userGuessedNumbers.push([messageText, result[0] + 'A' + result[1] + 'B']);
    appendNewResult();

    if (4==result[0]) {
      alert('Congratulations! You got it!');
    }
  }).catch(function(errMsg){
    alert('Sorry! ' + errMsg);
  });
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message
  if (messageInputElement.value) {
    submitNewNumber(messageInputElement.value.trim()).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

function generateNewTarget() {
  var seedNum = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var scrambleRounds = 300 + Math.floor(Math.random() * 100);

  while (scrambleRounds > 0){
    var i = Math.floor(seedNum.length * Math.random());
    var j = Math.floor(seedNum.length * Math.random());
    if (i!=j) {
      var t = seedNum[i];
      seedNum[i] = seedNum[j];
      seedNum[j] = t;
    }
    scrambleRounds--;
  }

  targetNumber = seedNum[0] * 1000 + seedNum[1] * 100 + seedNum[2] * 10 + seedNum[3];
  return targetNumber;
}
function onMessageFormReset(e) {
  e.preventDefault();
  
  while(messageListElement.firstChild) {
    messageListElement.removeChild(messageListElement.firstChild);
  }
  
}

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
messageFormElement.addEventListener('reset', onMessageFormReset);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

generateNewTarget();

'use strict';

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');

var testListElement = document.getElementById('tests');
var testFormElement = document.getElementById('test-form');
var testAInputElement = document.getElementById('testA');
var testBInputElement = document.getElementById('testB');
var testABDisplayElement = document.getElementById('testAB_show');
var submit2ButtonElement = document.getElementById('submit2');

var targetNumber = '5678';
var userGuessedNumbers = [];

var testNumbers = [];
var lastTest = '';

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

function compare4Digits(targetStr, guessStr) {
  var i, j;
  var A=0, B=0;
  for (i=0; i<4; i++) {
    for (j=0; j<4; j++) {
      if (targetStr[i] == guessStr[j]) {
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
  return check4Digits(messageText).then(function(guessStr){
    return compare4Digits(targetNumber, guessStr);
  }).then(function(result){
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

function toggleResult() {
  var ansA = parseInt(testAInputElement.value);
  var ansB = parseInt(testBInputElement.value);
  testABDisplayElement.innerHTML = ansA + 'A' + ansB + 'B';
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

  targetNumber = seedNum[0].toString() + seedNum[1].toString() + seedNum[2].toString() + seedNum[3].toString();
  return targetNumber;
}

function resetAllTests() {
  testNumbers.length = 0;
  for (var i=0; i<10; i++){
    for (var j=0; j<10; j++) {
      if (j == i) continue;
      for (var k=0; k<10; k++){
        if ((k==j) || (k==i)) continue;
        for (var l=0; l<10; l++) {
          if ((l==k) || (l==j) || (l==i)) continue;
          testNumbers.push(i.toString()+j.toString()+k.toString()+l.toString());
        }
      }
    }
  }
}

function appendNewTest(testStr, resultStr) {
  var id = 't' + testStr;
  var div = document.getElementById(id);
  
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', id);
    testListElement.insertBefore(div, null);
  }

  div.querySelector('.number').textContent = testStr;
  if (resultStr) {
    div.querySelector('.result').textContent = resultStr;
  }
  div.querySelector('.pic').style.backgroundImage = "url('images/firebase-logo.png')";

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  testListElement.scrollTop = testListElement.scrollHeight;
  testAInputElement.focus();
}
function guessNewTest() {
  var chooseOne = Math.floor(Math.random() * (testNumbers.length));
  return testNumbers[chooseOne];
}

function checkNewTest(ansA, ansB) {
  return new Promise(function(resolve, reject) {
    if ((ansA + ansB) > 4) {
      reject("Impossible answer if A+B > 4!");
    }
    resolve([ansA, ansB]);
  });
}

function onTestFormSubmit(e) {
  e.preventDefault();
  
  // Check that the user entered a message
  var ansA = parseInt(testAInputElement.value);
  var ansB = parseInt(testBInputElement.value);
  appendNewTest(lastTest, ansA + 'A' + ansB + 'B');

  if (4==ansA) {
    alert('Ha! Ha! I win!');
    return;
  }
  
  checkNewTest(ansA, ansB).then(function (){
    var newTests = [];
    for (var i=0; i<testNumbers.length; i++) {
      var testResult = compare4Digits(lastTest, testNumbers[i]);
      if ((testResult[0] == ansA) && (testResult[1] == ansB)) {
        newTests.push(testNumbers[i]);
      }
    }
    testNumbers = newTests;
    return testNumbers.length;
  }).then(function(len){
    if (len < 1) {
      alert("Impossible! I cannot find the correct answer!");
    }
    else {
      lastTest = guessNewTest();
      appendNewTest(lastTest, null);
    }
  }).catch(function(errMsg){
    alert(errMsg);
  });
}

function onMessageFormReset(e) {
  e.preventDefault();
  
  while(messageListElement.firstChild) {
    messageListElement.removeChild(messageListElement.firstChild);
  }

  while(testListElement.firstChild) {
    testListElement.removeChild(testListElement.firstChild);
  }
  
  generateNewTarget();
  resetAllTests();
  lastTest = guessNewTest();
  appendNewTest(lastTest, null);
}

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
messageFormElement.addEventListener('reset', onMessageFormReset);
testFormElement.addEventListener('submit', onTestFormSubmit);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

testAInputElement.addEventListener('change', toggleResult);
testBInputElement.addEventListener('change', toggleResult);

generateNewTarget();
resetAllTests();
lastTest = guessNewTest();
appendNewTest(lastTest, null);
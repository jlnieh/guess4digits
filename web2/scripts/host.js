/**
 * Copyright 2019 Jong-Liang Nieh All Rights Reserved.
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Triggered when the send new message form is submitted.
var PIC_LOGO_USER = 'images/profile_placeholder.png';
var PIC_LOGO_FIREBASE = 'images/firebase-logo.png';

var lastGuess;

function showNewGuess(newGuess) {
  var id = 'c' + newGuess;

  lastGuess = newGuess;
  displayMessage(id, new Date(), 'System', newGuess, PIC_LOGO_FIREBASE);
  submitButtonElement.removeAttribute('disabled');
};

function showMessage(errMsg){
  displayMessage('c_error', new Date(), 'System', errMsg, PIC_LOGO_FIREBASE);
  submitButtonElement.setAttribute('disabled', 'true');
}

function startHostGame() {
  dlgHelperElement.showModal();

  return requestNewHost()
          .then(() => requestNextGuess())
          .then(newGuess => showNewGuess(newGuess))
          .catch(errMsg => showMessage(errMsg));
}

function onMessageFormSubmit(e) {
  e.preventDefault();
  
  var ansResult = ansABDisplayElement.innerText;
  var id = 'h' + lastGuess;
   
  displayMessage(id, new Date(), 'User', lastGuess + ' >> ' + ansResult, PIC_LOGO_USER);
  submitAnswer(lastGuess, ansResult)
    .then(function() {
      if ('4A0B' == ansResult) { 
        throw new String('Yes! I got it!');
      } else {
        return requestNextGuess();
      }
    })
    .then(newGuess => showNewGuess(newGuess))
    .catch(errMsg => showMessage(errMsg));
}

// Triggered when the reset the same
function onMessageFormReset(e) {
  e.preventDefault();
  
  while(messageListElement.firstChild) {
    messageListElement.removeChild(messageListElement.firstChild);
  }  

  startHostGame();
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, picUrl) {
  var div = document.getElementById(id);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var child = null;
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', id);
    div.setAttribute('timestamp', timestamp);
    for (var i = 0; i < messageListElement.children.length; i++) {
      child = messageListElement.children[i];
      var time = child.getAttribute('timestamp');
      if (time && time > timestamp) {
        break;
      }
      child = null;
    }
    messageListElement.insertBefore(div, child);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } 
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  ansAInputElement.focus();
}

function toggleAnsA() {
  var ansA = parseInt(ansAInputElement.value);
  var ansB = parseInt(ansBInputElement.value);

  switch(ansA) {
    case 0: 
      // ansBInputElement.max = 4;
      break;
    case 1:
      if (ansB > 3) ansBInputElement.value = ansB = 3;
      break;
    case 2: 
      if (ansB > 2) ansBInputElement.value = ansB = 2;
      break;
    default:
      if (ansB > 0) ansBInputElement.value = ansB = 0;
      break;
  }
  ansABDisplayElement.innerHTML = ansA + 'A' + ansB + 'B';
}

function toggleAnsB() {
  var ansA = parseInt(ansAInputElement.value);
  var ansB = parseInt(ansBInputElement.value);

  switch(ansB) {
    case 1:
    case 2: 
      if (ansA > 2) ansAInputElement.value = ansA = 2;
      break;
    case 3:
      if (ansA > 1) ansAInputElement.value = ansA = 1;
      break;
    case 4:
      if (ansA > 0) ansAInputElement.value = ansA = 0;
      break;
    default:  //case 0: ansAInputElement.max = 4;
      break;
  }
  ansABDisplayElement.innerHTML = ansA + 'A' + ansB + 'B';
}

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var submitButtonElement = document.getElementById('submit');
var ansAInputElement = document.getElementById('ansA');
var ansBInputElement = document.getElementById('ansB');
var ansABDisplayElement = document.getElementById('ansAB_show');
var dlgHelperElement = document.getElementById('dlgHelper');
var targetInputElement = document.getElementById('target');
var closeButtonElement = document.getElementById('close');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
messageFormElement.addEventListener('reset', onMessageFormReset);

ansAInputElement.addEventListener('change', toggleAnsA);
ansBInputElement.addEventListener('change', toggleAnsB);

closeButtonElement.addEventListener('click', function() {
  dlgHelperElement.close();
});

window.addEventListener('load', startHostGame);

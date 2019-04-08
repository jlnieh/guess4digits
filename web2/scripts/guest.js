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

function giveHints(nextHints) {
  hintListElement.innerHTML = '';
  if (nextHints.length > 0)
  {
    messageInputElement.title = 'try: ' + nextHints[0];
    for (var i=0; i<nextHints.length; i++) {
      var option = document.createElement('option');
      option.value = nextHints[i];
      hintListElement.appendChild(option);
    }
  }
}

function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value) {
    var numMsg = messageInputElement.value;
    var id = 'u' + numMsg;
    displayMessage(id, new Date(), 'User', numMsg, PIC_LOGO_USER);

    submitNewNumber(numMsg).then(function(result) {
      var retMsg = numMsg + ' => ' + result;
      if ('4A0B' == result) {
        retMsg = retMsg + '\nCongratulations! You got it!';
      }
      id = 'r' + numMsg + '_' + result;
      displayMessage(id, new Date(), 'System', retMsg, PIC_LOGO_FIREBASE);

      calcHints(numMsg, result, 6).then(giveHints);
    }).catch(function(errMsg){
      id = 'r' + numMsg + '_error';
      displayMessage(id, new Date(), 'System', numMsg +'  ==>  ' + errMsg, PIC_LOGO_FIREBASE);
    });;

    // Clear message text field and re-enable the SEND button.
    resetMaterialTextfield(messageInputElement);
    toggleButton();
  }
}

// Triggered when the reset the same
function onMessageFormReset(e) {
  e.preventDefault();
  
  while(messageListElement.firstChild) {
    messageListElement.removeChild(messageListElement.firstChild);
  }  

  startNewGame().then(function() {
    resetHints();
    // Clear message text field and re-enable the SEND button.
    resetMaterialTextfield(messageInputElement);
    toggleButton();
  });
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.title = '';
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
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
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var hintListElement = document.getElementById('guess_hints');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
messageFormElement.addEventListener('reset', onMessageFormReset);


// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

startNewGame().then(function () {
  resetHints();
});

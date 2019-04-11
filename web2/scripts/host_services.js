/**
 * Copyright 2019 Jong-Liang Nieh All Rights Reserved.
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

var hintNumbers = [];

function _resetAllHints() {
    hintNumbers.length = 0;
    for (var i=0; i<10; i++){
      for (var j=0; j<10; j++) {
        if (j == i) continue;
        for (var k=0; k<10; k++){
          if ((k==j) || (k==i)) continue;
          for (var l=0; l<10; l++) {
            if ((l==k) || (l==j) || (l==i)) continue;
            hintNumbers.push(i.toString()+j.toString()+k.toString()+l.toString());
          }
        }
      }
    }
}

// export utilities
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

function requestNewHost() {
    return new Promise(function(resolve, reject) {
        _resetAllHints();
        resolve();
    });
}

function requestNextGuess() {
    return new Promise(function(resolve, reject) {
        var chooseOne = Math.floor(Math.random() * (hintNumbers.length));
        resolve(hintNumbers[chooseOne]);
    });
}

function submitAnswer(lastGuess, newAnswer) {
    return new Promise(function(resolve, reject) {
        var ansA = newAnswer[0];
        var ansB = newAnswer[2];

        for (var i=hintNumbers.length - 1; i>=0; i--) {
            var testResult = compare4Digits(lastGuess, hintNumbers[i]);
            if ((testResult[0] != ansA) || (testResult[1] != ansB)) {
                hintNumbers.splice(i, 1);
            }
        }
        if (hintNumbers.length > 0) {
            resolve(hintNumbers.length);
        } else {
            reject("Impossible! I cannot find the correct answer!");
        }
    });
}

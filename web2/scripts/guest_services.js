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

var targetNumber = '5678';
var hintNumbers = [];

function _resortHints() {
    if (hintNumbers.length > 3) {
        var scrambleRounds = hintNumbers.length * 2;
        while (scrambleRounds > 0) {
            var i = Math.floor(Math.random() * (hintNumbers.length - 1));
            var t = hintNumbers[0];
            hintNumbers[0] = hintNumbers[i];
            hintNumbers[i] = t;
            scrambleRounds--;
        }
    }
}

function _generateNewTarget() {
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

    return seedNum[0].toString() + seedNum[1].toString() + seedNum[2].toString() + seedNum[3].toString();
}

// export services
function startNewGame() {
    return new Promise(function (resolve, reject) {
        targetNumber = _generateNewTarget();
        resolve();
    });
}

function submitNewNumber(guessNumber) {
    return check4Digits(guessNumber)
                .then(function (guessStr) {
                    var result = compare4Digits(targetNumber, guessStr);
                    return result[0] + 'A' + result[1] + 'B';
                });
}

function resetHints() {
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

function calcHints(guessStr, result, max=6) {
  return new Promise(function (resolve, reject) {
    var ansA = Number(result[0]);
    var ansB = Number(result[2]);
    for (var i=hintNumbers.length - 1; i>=0; i--) {
      var testResult = compare4Digits(guessStr, hintNumbers[i]);
      if ((testResult[0] != ansA) || (testResult[1] != ansB)) {
        hintNumbers.splice(i, 1);
      }
    }
    
    if (max < hintNumbers.length) {
      _resortHints();
    }
    else {
      max = hintNumbers.length;
    }
    resolve(hintNumbers.slice(0, max));
  });
}

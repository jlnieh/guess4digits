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

var guestTargets = [];

function _resetAllHints() {
    guestTargets.length = 0;
    for (var i=0; i<10; i++){
      for (var j=0; j<10; j++) {
        if (j == i) continue;
        for (var k=0; k<10; k++){
          if ((k==j) || (k==i)) continue;
          for (var l=0; l<10; l++) {
            if ((l==k) || (l==j) || (l==i)) continue;
            guestTargets.push(i.toString()+j.toString()+k.toString()+l.toString());
          }
        }
      }
    }
}

function requestNewHost() {
    return new Promise(function(resolve, reject) {
        _resetAllHints();
        resolve();
    });
}

function requestNextGuess() {
    return new Promise(function(resolve, reject) {
        var chooseOne = Math.floor(Math.random() * (guestTargets.length));
        resolve(guestTargets[chooseOne]);
    });
}

function submitAnswer(lastGuess, newAnswer) {
    return new Promise(function(resolve, reject) {
        var ansA = newAnswer[0];
        var ansB = newAnswer[2];

        for (var i=guestTargets.length - 1; i>=0; i--) {
            var testResult = compare4Digits(lastGuess, guestTargets[i]);
            if ((testResult[0] != ansA) || (testResult[1] != ansB)) {
                guestTargets.splice(i, 1);
            }
        }
        if (guestTargets.length > 0) {
            resolve(guestTargets.length);
        } else {
            reject("Impossible! I cannot find the correct answer!");
        }
    });
}

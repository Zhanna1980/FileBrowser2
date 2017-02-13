/**
 * Created by zhannalibman on 13/02/2017.
 */

var _navigationHistory = (function() {
    "use strict";
    //the array that keeps the ids of opened folders and files
    var history = [];
    var currentElementIndex = -1;

    function getCurrentId() {
        if (currentElementIndex > -1 && currentElementIndex < history.length) {
            return history[currentElementIndex];
        } else {
            return undefined;
        }
    }

    function back() {
        if (currentElementIndex > 0){
            if (findElementById(history[--currentElementIndex] === null)) {
                return false;
            }
            else {

            }
        }
    }

    function forward() {

    }

    function update(){

    }


    return {
        getCurrentId: getCurrentId,
        back: back,
        forward: forward,
        update: update
    };
})();
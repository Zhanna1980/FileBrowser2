/**
 * Created by zhannalibman on 13/02/2017.
 */

var navigationHistory = (function() {
    "use strict";

    //the array that keeps the ids of opened folders and files
    var history = [];
    var currentElementIndex = -1;

    /**
     * Gets current element's id.
     * @return current element's id or undefined if the history is empty.
     * */
    function getCurrent() {
        if (currentElementIndex > -1 && currentElementIndex < history.length) {
            return history[currentElementIndex];
        } else {
            return undefined;
        }
    }

    function hasBack() {
        return currentElementIndex > 0;
    }

    function hasForward() {
        return currentElementIndex < history.length - 1;
    }

    /**
     * */
    function back() {
        if (hasBack()) {
            --currentElementIndex;
        }
        return getCurrent();
    }

    /**
     * */
    function forward() {
        if (hasForward()) {
            ++currentElementIndex;
        }
        return getCurrent();
    }

    function push(elementId){
        if(currentElementIndex > -1 && history[currentElementIndex] == elementId) {
            return;
        }
        history.splice(++currentElementIndex, 0, elementId);
        history.splice(currentElementIndex + 1);
    }

    function log (){
        for (var i = 0; i < history.length; i++){
            console.log(history[i]);
        }
        console.log("currElInd =", currentElementIndex);
    }


    return {
        getCurrentId: getCurrent,
        back: back,
        forward: forward,
        push: push,
        log: log,
        hasBack: hasBack,
        hasForward: hasForward
    };
})();
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

    /**
     * Return true is there is history back from current element
     * */
    function hasBack() {
        return currentElementIndex > 0;
    }

    /**
     * Return true is there is history forward from current element
     */
    function hasForward() {
        return currentElementIndex < history.length - 1;
    }

    /**
     * Moves one entry back in history
     * */
    function back() {
        if (hasBack()) {
            --currentElementIndex;
        }
        return getCurrent();
    }

    /**
     * Moves one entry forward in history
     * */
    function forward() {
        if (hasForward()) {
            ++currentElementIndex;
        }
        return getCurrent();
    }

    /**
     * Add element id to history
     */
    function push(elementId){
        if(currentElementIndex > -1 && history[currentElementIndex] == elementId) {
            return;
        }
        history.splice(++currentElementIndex, 0, elementId);
        history.splice(currentElementIndex + 1);
    }

    return {
        getCurrentId: getCurrent,
        back: back,
        forward: forward,
        push: push,
        hasBack: hasBack,
        hasForward: hasForward
    };
})();
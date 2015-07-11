/*global giant, giant, giant */
giant.postpone(giant, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    giant.originalEventStack = giant.EventStack.create();
});

giant.postpone(giant, 'pushOriginalEvent', function () {
    "use strict";

    /**
     * Adds an original event to the stack.
     * @param {giant.Event|*} originalEvent
     * @returns {giant.ValueLink}
     */
    giant.pushOriginalEvent = function (originalEvent) {
        return giant.originalEventStack.pushEvent(originalEvent);
    };
});

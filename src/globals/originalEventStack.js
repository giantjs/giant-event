/*global giant */
giant.postpone(giant, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    giant.originalEventStack = giant.EventStack.create();
});

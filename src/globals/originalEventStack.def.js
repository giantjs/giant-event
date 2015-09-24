/*global $event */
$oop.postpone($event, 'originalEventStack', function () {
    "use strict";

    /**
     * Global stack for original events.
     * @type {Array}
     */
    $event.originalEventStack = $event.EventStack.create();
});

$oop.postpone($event, 'pushOriginalEvent', function () {
    "use strict";

    /**
     * Adds an original event to the stack.
     * @param {$event.Event|*} originalEvent
     * @returns {$data.ValueLink}
     */
    $event.pushOriginalEvent = function (originalEvent) {
        return $event.originalEventStack.pushEvent(originalEvent);
    };
});

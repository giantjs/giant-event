$oop.postpone($event, 'eventSpace', function () {
    "use strict";

    /**
     * Global, shared event space.
     * @type {$event.EventSpace}
     */
    $event.eventSpace = $event.EventSpace.create();
});

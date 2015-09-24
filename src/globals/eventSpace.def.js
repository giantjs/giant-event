/*global giant */
$oop.postpone(giant, 'eventSpace', function () {
    "use strict";

    /**
     * Global, shared event space.
     * @type {giant.EventSpace}
     */
    giant.eventSpace = giant.EventSpace.create();
});

/*global $event */
$oop.postpone($event, 'EventCollection', function () {
    "use strict";

    /**
     * @name $event.EventCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {$event.EventCollection}
     */

    /**
     * @name $event.EventCollection#eventName
     * @ignore
     */

    /**
     * @name $event.EventCollection#eventSpace
     * @ignore
     */

    /**
     * @name $event.EventCollection#canBubble
     * @ignore
     */

    /**
     * @name $event.EventCollection#payload
     * @ignore
     */

    /**
     * @name $event.EventCollection#currentPath
     * @ignore
     */

    /**
     * @name $event.EventCollection#originalPath
     * @ignore
     */

    /**
     * @name $event.EventCollection#broadcastPath
     * @ignore
     */

    /**
     * @class $event.EventCollection
     * @extends $data.Collection
     * @extends $event.Event
     */
    $event.EventCollection = $data.Collection.of($event.Event);
});

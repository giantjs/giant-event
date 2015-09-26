$oop.postpone($event, 'nextPayloadStore', function () {
    "use strict";

    /**
     * Temporary storage for event payload.
     * @type {$event.PayloadStore}
     */
    $event.nextPayloadStore = $event.PayloadStore.create();
});

$oop.postpone($event, 'setNextPayloadItem', function () {
    "use strict";

    /**
     * Associates a payload item with an event name.
     * Subsequent events by the specified name will carry the specified payload item.
     * @param {string} eventName
     * @param {string} payloadItemName
     * @param {*} payloadItemValue
     */
    $event.setNextPayloadItem = function (eventName, payloadItemName, payloadItemValue) {
        $event.nextPayloadStore.setPayloadItem(eventName, payloadItemName, payloadItemValue);
    };
});

$oop.postpone($event, 'setNextPayloadItems', function () {
    "use strict";

    /**
     * Associates multiple payload items with an event name.
     * @param {string} eventName
     * @param {object} payload
     */
    $event.setNextPayloadItems = function (eventName, payload) {
        $event.nextPayloadStore.setPayloadItems(eventName, payload);
    };
});

$oop.postpone($event, 'deleteNextPayloadItem', function () {
    "use strict";

    /**
     * Dissociates a payload item from an event name.
     * @param {string} eventName
     * @param {string} payloadItemName
     */
    $event.deleteNextPayloadItem = function (eventName, payloadItemName) {
        $event.nextPayloadStore.deletePayloadItem(eventName, payloadItemName);
    };
});

$oop.postpone($event, 'deleteNextPayloadItems', function () {
    "use strict";

    /**
     * Dissociates multiple payload items from an event name.
     * Pass item names following the first argument.
     * @param {string} eventName
     */
    $event.deleteNextPayloadItems = function (eventName) {
        var nextPayloadStore = $event.nextPayloadStore;
        nextPayloadStore.deletePayloadItems.apply(nextPayloadStore, arguments);
    };
});

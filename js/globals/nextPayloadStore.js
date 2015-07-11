/*global giant, giant, giant, giant */
giant.postpone(giant, 'nextPayloadStore', function () {
    "use strict";

    /**
     * Temporary storage for event payload.
     * @type {giant.PayloadStore}
     */
    giant.nextPayloadStore = giant.PayloadStore.create();
});

giant.postpone(giant, 'setNextPayloadItem', function () {
    "use strict";

    /**
     * Associates a payload item with an event name.
     * Subsequent events by the specified name will carry the specified payload item.
     * @param {string} eventName
     * @param {string} payloadItemName
     * @param {*} payloadItemValue
     */
    giant.setNextPayloadItem = function (eventName, payloadItemName, payloadItemValue) {
        giant.nextPayloadStore.setPayloadItem(eventName, payloadItemName, payloadItemValue);
    };
});

giant.postpone(giant, 'setNextPayloadItems', function () {
    "use strict";

    /**
     * Associates multiple payload items with an event name.
     * @param {string} eventName
     * @param {object} payload
     */
    giant.setNextPayloadItems = function (eventName, payload) {
        giant.nextPayloadStore.setPayloadItems(eventName, payload);
    };
});

giant.postpone(giant, 'deleteNextPayloadItem', function () {
    "use strict";

    /**
     * Dissociates a payload item from an event name.
     * @param {string} eventName
     * @param {string} payloadItemName
     */
    giant.deleteNextPayloadItem = function (eventName, payloadItemName) {
        giant.nextPayloadStore.deletePayloadItem(eventName, payloadItemName);
    };
});

giant.postpone(giant, 'deleteNextPayloadItems', function () {
    "use strict";

    /**
     * Dissociates multiple payload items from an event name.
     * Pass item names following the first argument.
     * @param {string} eventName
     */
    giant.deleteNextPayloadItems = function (eventName) {
        var nextPayloadStore = giant.nextPayloadStore;
        nextPayloadStore.deletePayloadItems.apply(nextPayloadStore, arguments);
    };
});

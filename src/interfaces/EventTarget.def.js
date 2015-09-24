/**
 * Interface that marks a class as target for events. Event targets may subscribe to events.
 * @name $event.EventTarget
 * @class
 * @extends $oop.Base
 */

/**
 * Subscribes a handler to the specified event, in a specific event space.
 * @name $event.EventTarget#subscribeTo
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Unsubscribes a handler from the specified event, in a specific event space.
 * @name $event.EventTarget#unsubscribeFrom
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, and unsubscribes after the first time it was triggered.
 * @name $event.EventTarget#subscribeToUntilTriggered
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, but only if the event's original path matches a specified Query.
 * @name $event.EventTarget#delegateSubscriptionTo
 * @function
 * @param {string} eventName
 * @returns {$event.EventTarget}
 */

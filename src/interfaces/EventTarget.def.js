/**
 * Interface that marks a class as target for events. Event targets may subscribe to events.
 * @name giant.EventTarget
 * @class
 * @extends $oop.Base
 */

/**
 * Subscribes a handler to the specified event, in a specific event space.
 * @name giant.EventTarget#subscribeTo
 * @function
 * @param {string} eventName
 * @returns {giant.EventTarget}
 */

/**
 * Unsubscribes a handler from the specified event, in a specific event space.
 * @name giant.EventTarget#unsubscribeFrom
 * @function
 * @param {string} eventName
 * @returns {giant.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, and unsubscribes after the first time it was triggered.
 * @name giant.EventTarget#subscribeToUntilTriggered
 * @function
 * @param {string} eventName
 * @returns {giant.EventTarget}
 */

/**
 * Subscribes a handler to the specified event, in a specific event space, but only if the event's original path matches a specified Query.
 * @name giant.EventTarget#delegateSubscriptionTo
 * @function
 * @param {string} eventName
 * @returns {giant.EventTarget}
 */

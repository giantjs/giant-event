/**
 * Interface that marks a class as a source of events, ie. triggering and broadcasting events.
 * @name $event.EventSource
 * @class
 * @extends $oop.Base
 */

/**
 * Triggers an event of a specific type on a specific path in a specific event space.
 * These parameters may be passed to this method, or defined elsewhere depending on the implementation.
 * Triggered events are unidirectional, optionally bubbling towards the root path.
 * @name $event.EventSource#triggerSync
 * @function
 * @returns {$event.EventSource}
 */

/**
 * Broadcasts an event of a specific type on a specific path in a specific event space.
 * These parameters may be passed to this method, or defined elsewhere depending on the implementation.
 * Broadcast events will call all handlers subscribed at a path relative to the broadcast path.
 * @name $event.EventSource#broadcastSync
 * @function
 * @returns {$event.EventSource}
 */

/*global giant, giant, giant, giant */
giant.postpone(giant, 'EventSpace', function () {
    "use strict";

    var base = giant.Base,
        self = base.extend();

    /**
     * Instantiates an EventSpace.
     * @name giant.EventSpace.create
     * @function
     * @return {giant.EventSpace}
     */

    /**
     * Events traverse within a confined event space.
     * @class
     * @extends giant.Base
     * @extends giant.EventSpawner
     * @extends giant.EventTarget
     */
    giant.EventSpace = self
        .addPrivateMethods(/** @lends giant.EventSpace */{
            /**
             * Generates a stub for event handlers. (An empty array)
             * @return {Array}
             * @private
             */
            _generateHandlersStub: function () {
                return [];
            },

            /**
             * Prepares spawned event for triggering.
             * @param {giant.Event} event
             * @private
             */
            _prepareEvent: function (event) {
                var nextPayloadItems = giant.nextPayloadStore.getPayload(event.eventName),
                    nextOriginalEvent = giant.originalEventStack.getLastEvent();

                if (nextPayloadItems) {
                    // applying next payload on spawned event
                    event.setPayloadItems(nextPayloadItems);
                }

                if (nextOriginalEvent) {
                    // setting next original event on spawned event
                    event.setOriginalEvent(nextOriginalEvent);
                }
            }
        })
        .addMethods(/** @lends giant.EventSpace# */{
            /** @ignore */
            init: function () {
                /**
                 * Lookup for subscribed event handlers. Indexed by event name, then event path (stringified), then handler index.
                 * @type {giant.Tree}
                 * @constant
                 * TODO: Rename to subscriptionRegistry. Breaking.
                 */
                this.eventRegistry = giant.Tree.create();
            },

            /**
             * @param {string} eventName
             * @return {giant.Event}
             */
            spawnEvent: function (eventName) {
                var event = giant.Event.create(eventName, this);
                this._prepareEvent(event);
                return event;
            },

            /**
             * Subscribes to event.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * @param {string} eventName Name of event to be triggered.
             * @param {giant.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {giant.EventSpace}
             */
            subscribeTo: function (eventName, eventPath, handler) {
                giant.isFunction(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    eventPathString = eventPath.toString(),
                    handlers = eventRegistry.getOrSetNode(
                        [eventPathString, eventName].toPath(),
                        this._generateHandlersStub);

                // adding handler to handlers
                handlers.push(handler);

                return this;
            },

            /**
             * Unsubscribes from event. Removes entries associated with subscription
             * from event registry, both from the list of handlers and the list of
             * subscribed paths.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * TODO: Consider changing unsetKey to unsetPath. Measure performance impact.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {giant.Path} [eventPath] Path we're listening to
             * @param {function} [handler] Event handler function
             * @return {giant.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                giant.isFunctionOptional(handler, "Invalid event handler function");

                var eventRegistry = this.eventRegistry,
                    handlers,
                    handlerIndex;

                if (eventPath) {
                    if (eventName) {
                        if (handler) {
                            handlers = eventRegistry.getNode([eventPath, eventName].toPath());
                            if (handlers) {
                                // there are subscriptions on event/path
                                if (handlers.length > 1) {
                                    handlerIndex = handlers.indexOf(handler);
                                    if (handlerIndex > -1) {
                                        // specified handler is subscribed
                                        handlers.splice(handlerIndex, 1);
                                    }
                                } else {
                                    // removing last handler
                                    eventRegistry.unsetKey([eventPath, eventName].toPath());
                                }
                            }
                        } else {
                            // removing all handlers
                            eventRegistry.unsetKey([eventPath, eventName].toPath());
                        }
                    } else {
                        // removing all handlers for specified path
                        eventRegistry.unsetKey([eventPath].toPath());
                    }
                } else {
                    // removing all event bindings
                    this.eventRegistry.clear();
                }

                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {giant.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @return {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                /**
                 * Handler wrapper for events that automatically unsubscribe
                 * after the first trigger.
                 * @param {giant.Event} event
                 * @param {*} data
                 * @return {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function oneHandler(event, data) {
                    /*jshint validthis: true */
                    handler.call(this, event, data);
                    return event.eventSpace.unsubscribeFrom(event.eventName, event.currentPath, oneHandler);
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, eventPath, oneHandler);

                return oneHandler;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {giant.Path} capturePath Path where the event will actually subscribe
             * @param {giant.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @return {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                giant
                    .assert(delegatePath.isRelativeTo(capturePath), "Delegate path is not relative to capture path")
                    .isFunction(handler, "Invalid event handler function");

                /**
                 * Handler wrapper for subscribing delegates
                 * @param {giant.Event} event Event object passed down by the triggering process
                 * @param {*} data Custom event data
                 * @return {*} Whatever the user-defined handler returns (possibly a `false`)
                 */
                function delegateHandler(event, data) {
                    /*jshint validthis: true */
                    var originalPath = event.originalPath,
                        broadcastPath = event.broadcastPath;

                    if (delegatePath.isRootOf(originalPath) ||
                        broadcastPath && delegatePath.isRelativeTo(broadcastPath)
                        ) {
                        // triggering handler and passing forged current path set to delegatePath
                        return handler.call(this, event.clone(delegatePath), data);
                    }
                }

                // subscribing delegate handler to capturing path
                this.subscribeTo(eventName, capturePath, delegateHandler);

                return delegateHandler;
            },

            /**
             * Calls handlers associated with an event name and path.
             * Handlers are assumed to be synchronous.
             * @param {giant.Event} event
             * @return {number|boolean} Number of handlers processed, or false when one handler returned false.
             * @see giant.Event#triggerSync
             */
            callHandlers: function (event) {
                var handlersPath = [event.currentPath.toString(), event.eventName].toPath(),
                    handlers = this.eventRegistry.getNode(handlersPath),
                    i = 0, handler;

                if (handlers && handlers.length) {
                    // making local copy of handlers
                    // in case any of these handlers end up modifying the subscription registry
                    handlers = handlers.concat();

                    for (; i < handlers.length; i++) {
                        handler = handlers[i];
                        // calling handler, passing event and payload
                        if (handler.call(this, event, event.payload) === false) {
                            // stopping iteration when handler returns false
                            // TODO: Add .stopPropagation() API to event.
                            return false;
                        }
                    }
                }

                return i;
            },

            /**
             * Retrieves subscribed paths that are relative to the specified path.
             * @param {string} eventName
             * @param {giant.Path} path
             * @return {giant.PathCollection} Collection of paths relative to (not including) `path`
             * Question is which lib/class should delegate the method.
             */
            getPathsRelativeTo: function (eventName, path) {
                // obtaining all paths associated with event name
                var pathsQuery = ['{|}'.toKVP(), eventName].toQuery(),
                    paths = this.eventRegistry
                        .queryKeysAsHash(pathsQuery)
                        .toOrderedStringList();

                if (paths) {
                    // there are subscriptions matching eventName
                    return /** @type giant.PathCollection */paths
                        // querying collection of strings that are relative to `path`
                        .getRangeByPrefixAsHash(path.toString(), true)
                        .toStringCollection()
                        // converting them to a collection of paths
                        .toPathOrQuery().asType(giant.PathCollection);
                } else {
                    // no subscriptions match eventName
                    // returning empty path collection
                    return giant.PathCollection.create([]);
                }
            }
        });
});

(function () {
    "use strict";

    giant.addTypes(/** @lends giant */{
        isEventSpace: function (expr) {
            return giant.EventSpace.isPrototypeOf(expr);
        },

        isEventSpaceOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   giant.EventSpace.isPrototypeOf(expr);
        }
    });
}());

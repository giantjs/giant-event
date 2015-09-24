/*global $event */
$oop.postpone($event, 'EventSpace', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates an EventSpace.
     * @name $event.EventSpace.create
     * @function
     * @returns {$event.EventSpace}
     */

    /**
     * Events traverse within a confined event space.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSpawner
     * @extends $event.EventTarget
     */
    $event.EventSpace = self
        .addPrivateMethods(/** @lends $event.EventSpace */{
            /**
             * Generates a stub for event handlers. (An empty array)
             * @returns {Array}
             * @private
             */
            _generateHandlersStub: function () {
                return [];
            },

            /**
             * Prepares spawned event for triggering.
             * @param {$event.Event} event
             * @private
             */
            _prepareEvent: function (event) {
                var nextPayloadItems = $event.nextPayloadStore.getPayload(event.eventName),
                    nextOriginalEvent = $event.originalEventStack.getLastEvent();

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
        .addMethods(/** @lends $event.EventSpace# */{
            /** @ignore */
            init: function () {
                /**
                 * Lookup for subscribed event handlers. Indexed by event name, then event path (stringified), then handler index.
                 * @type {$data.Tree}
                 * @constant
                 * TODO: Rename to subscriptionRegistry. Breaking.
                 */
                this.eventRegistry = $data.Tree.create();
            },

            /**
             * @param {string} eventName
             * @returns {$event.Event}
             */
            spawnEvent: function (eventName) {
                var event = $event.Event.create(eventName, this);
                this._prepareEvent(event);
                return event;
            },

            /**
             * Subscribes to event.
             * TODO: Switch eventPath / eventName arguments. Breaking.
             * @param {string} eventName Name of event to be triggered.
             * @param {$data.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.EventSpace}
             */
            subscribeTo: function (eventName, eventPath, handler) {
                $assertion.isFunction(handler, "Invalid event handler function");

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
             * @param {$data.Path} [eventPath] Path we're listening to
             * @param {function} [handler] Event handler function
             * @returns {$event.EventSpace}
             */
            unsubscribeFrom: function (eventName, eventPath, handler) {
                $assertion.isFunctionOptional(handler, "Invalid event handler function");

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
             * @param {$data.Path} eventPath Path we're listening to
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            subscribeToUntilTriggered: function (eventName, eventPath, handler) {
                /**
                 * Handler wrapper for events that automatically unsubscribe
                 * after the first trigger.
                 * @param {$event.Event} event
                 * @param {*} data
                 * @returns {*} Whatever the user-defined handler returns (possibly a `false`)
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
             * @param {$data.Path} capturePath Path where the event will actually subscribe
             * @param {$data.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @returns {function} Event handler actually subscribed. Use this for unsubscribing.
             */
            delegateSubscriptionTo: function (eventName, capturePath, delegatePath, handler) {
                $assertion
                    .assert(delegatePath.isRelativeTo(capturePath), "Delegate path is not relative to capture path")
                    .isFunction(handler, "Invalid event handler function");

                /**
                 * Handler wrapper for subscribing delegates
                 * @param {$event.Event} event Event object passed down by the triggering process
                 * @param {*} data Custom event data
                 * @returns {*} Whatever the user-defined handler returns (possibly a `false`)
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
             * @param {$event.Event} event
             * @returns {number|boolean} Number of handlers processed, or false when one handler returned false.
             * @see $event.Event#triggerSync
             */
            callHandlers: function (event) {
                var handlersPath = [event.currentPath.toString(), event.eventName].toPath(),
                    handlers = this.eventRegistry.getNode(handlersPath),
                    handlerCount,
                    i = 0, link, unlink, handler, result;

                if (handlers && handlers.length) {
                    // making local copy of handlers
                    // in case any of these handlers end up modifying the subscription registry
                    handlers = handlers.concat();
                    handlerCount = handlers.length;

                    for (; i < handlerCount; i++) {
                        handler = handlers[i];

                        // pushing original event
                        link = $event.pushOriginalEvent(event);

                        // calling handler, passing event and payload
                        // TODO: Do not pass payload.
                        result = handler.call(this, event, event.payload);

                        if (result && typeof result.then === 'function') {
                            // handler returned a thenable
                            unlink = link.unlink.bind(link);
                            result.then(unlink, unlink);
                        } else {
                            // handler returned non-thenable
                            // unlinking immediately
                            link.unlink();
                        }

                        if (result === false) {
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
             * @param {$data.Path} path
             * @returns {$event.PathCollection} Collection of paths relative to (not including) `path`
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
                    return /** @type $event.PathCollection */paths
                        // querying collection of strings that are relative to `path`
                        .getRangeByPrefixAsHash(path.toString(), true)
                        .toStringCollection()
                        // converting them to a collection of paths
                        .toPathOrQuery().asType($event.PathCollection);
                } else {
                    // no subscriptions match eventName
                    // returning empty path collection
                    return $event.PathCollection.create([]);
                }
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends $event */{
        isEventSpace: function (expr) {
            return $event.EventSpace.isPrototypeOf(expr);
        },

        isEventSpaceOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $event.EventSpace.isPrototypeOf(expr);
        }
    });
}());

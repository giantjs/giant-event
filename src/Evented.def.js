$oop.postpone($event, 'Evented', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Trait.
     * Classes with this trait may trigger and capture
     * events on a specified event space directly.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSpawner
     * @extends $event.EventSource
     * @extends $event.EventTarget
     */
    $event.Evented = self
        .addPrivateMethods(/** @lends $event.Evented# */{
            /**
             * @param {$data.Dictionary} dictionary
             * @returns {Array}
             * @private
             */
            _flattenDictionary: function (dictionary) {
                var result = [],
                    items = dictionary.items,
                    keys = Object.keys(items),
                    i, key, values,
                    j;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    values = items[key];

                    if (values instanceof Array) {
                        for (j = 0; j < values.length; j++) {
                            result.push([key, values[j]]);
                        }
                    } else {
                        result.push([key, values]);
                    }
                }

                return result;
            },

            /**
             * @param {$data.Path} oldEventPath
             * @param {$data.Path} newEventPath
             * @private
             */
            _reSubscribe: function (oldEventPath, newEventPath) {
                var that = this;
                this._flattenDictionary(this.subscriptionRegistry)
                    .toCollection()
                    .forEachItem(function (keyValuePair) {
                        var eventName = keyValuePair[0],
                            handler = keyValuePair[1];
                        that.eventSpace
                            .unsubscribeFrom(eventName, oldEventPath, handler)
                            .subscribeTo(eventName, newEventPath, handler);
                    });
            }
        })
        .addMethods(/** @lends $event.Evented# */{
            /** @ignore */
            init: function () {
                /**
                 * Stores event name - handler associations for the current evented instance.
                 * @type {$data.Dictionary}
                 */
                this.subscriptionRegistry = undefined;
            },

            /**
             * Spawns an event in the current event space, prepared with the current event path
             * as the target path. Returned event may be triggered without specifying a target path.
             * Current eventSpace and eventPath properties must not be undefined.
             * @param {string} eventName
             * @returns {$event.Event}
             */
            spawnEvent: function (eventName) {
                return this.eventSpace.spawnEvent(eventName)
                    .setSender(this)
                    .setTargetPath(this.eventPath);
            },

            /**
             * Sets event space on current class or instance.
             * @param {$event.EventSpace} eventSpace
             * @returns {$event.Evented}
             * @memberOf {$event.Evented}
             */
            setEventSpace: function (eventSpace) {
                $assertion.isEventSpace(eventSpace, "Invalid event space");
                this.eventSpace = eventSpace;
                return this;
            },

            /**
             * Sets event path for the current class or instance.
             * @param {$data.Path} eventPath
             * @returns {$event.Evented}
             * @memberOf {$event.Evented}
             */
            setEventPath: function (eventPath) {
                var baseEventPath = this.getBase().eventPath,
                    subscriptionRegistry = this.subscriptionRegistry;

                $assertion
                    .isPath(eventPath, "Invalid event path")
                    .assert(
                        !baseEventPath || eventPath.isRelativeTo(baseEventPath),
                        "Specified event path is not relative to static event path");

                if (!subscriptionRegistry) {
                    // initializing subscription registry
                    this.subscriptionRegistry = $data.Dictionary.create();
                } else if (subscriptionRegistry.getKeyCount()) {
                    // re-subscribing events
                    this._reSubscribe(this.eventPath, eventPath);
                }

                // storing new event path
                this.eventPath = eventPath;

                return this;
            },

            /**
             * Subscribes to event.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.Evented}
             */
            subscribeTo: function (eventName, handler) {
                this.eventSpace.subscribeTo(eventName, this.eventPath, handler);
                this.subscriptionRegistry.addItem(eventName, handler);
                return this;
            },

            /**
             * Unsubscribes from event.
             * @param {string} [eventName] Name of event to be triggered.
             * @param {function} [handler] Event handler function
             * @returns {$event.Evented}
             */
            unsubscribeFrom: function (eventName, handler) {
                this.eventSpace.unsubscribeFrom(eventName, this.eventPath, handler);

                if (eventName) {
                    this.subscriptionRegistry.removeItem(eventName, handler);
                } else {
                    this.subscriptionRegistry.clear();
                }

                return this;
            },

            /**
             * Subscribes to event and unsubscribes after first trigger.
             * @param {string} eventName Name of event to be triggered.
             * @param {function} handler Event handler function that is called when the event
             * is triggered on (or bubbles to) the specified path.
             * @returns {$event.Evented}
             */
            subscribeToUntilTriggered: function (eventName, handler) {
                var oneHandler = this.eventSpace.subscribeToUntilTriggered(eventName, this.eventPath, handler);
                this.subscriptionRegistry.addItem(eventName, oneHandler);
                return this;
            },

            /**
             * Delegates event capturing to a path closer to the root.
             * Handlers subscribed this way CANNOT be unsubscribed individually.
             * @param {string} eventName
             * @param {$data.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @returns {$event.Evented}
             */
            delegateSubscriptionTo: function (eventName, delegatePath, handler) {
                var delegateHandler = this.eventSpace.delegateSubscriptionTo(eventName, this.eventPath, delegatePath, handler);
                this.subscriptionRegistry.addItem(eventName, delegateHandler);
                return this;
            },

            /**
             * Shorthand for **triggering** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @returns {$event.Evented}
             */
            triggerSync: function (eventName) {
                this.spawnEvent(eventName)
                    .triggerSync(this.eventPath);
                return this;
            },

            /**
             * Shorthand for **broadcasting** an event in the event space
             * associated with the instance / class.
             * @param {string} eventName
             * @returns {$event.Evented}
             */
            broadcastSync: function (eventName) {
                this.spawnEvent(eventName)
                    .broadcastSync(this.eventPath);
                return this;
            }
        });
});

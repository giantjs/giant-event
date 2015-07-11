/*global giant, giant, giant, giant */
giant.postpone(giant, 'Evented', function () {
    "use strict";

    var base = giant.Base,
        self = base.extend();

    /**
     * Trait.
     * Classes with this trait may trigger and capture
     * events on a specified event space directly.
     * @class
     * @extends giant.Base
     * @extends giant.EventSpawner
     * @extends giant.EventSource
     * @extends giant.EventTarget
     */
    giant.Evented = self
        .addPrivateMethods(/** @lends giant.Evented# */{
            /**
             * @param {giant.Dictionary} dictionary
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
             * @param {giant.Path} oldEventPath
             * @param {giant.Path} newEventPath
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
        .addMethods(/** @lends giant.Evented# */{
            /** @ignore */
            init: function () {
                /**
                 * Stores event name - handler associations for the current evented instance.
                 * @type {giant.Dictionary}
                 */
                this.subscriptionRegistry = undefined;
            },

            /**
             * Spawns an event in the current event space, prepared with the current event path
             * as the target path. Returned event may be triggered without specifying a target path.
             * Current eventSpace and eventPath properties must not be undefined.
             * @param {string} eventName
             * @return {giant.Event}
             */
            spawnEvent: function (eventName) {
                return this.eventSpace.spawnEvent(eventName)
                    .setSender(this)
                    .setTargetPath(this.eventPath);
            },

            /**
             * Sets event space on current class or instance.
             * @param {giant.EventSpace} eventSpace
             * @returns {giant.Evented}
             * @memberOf {giant.Evented}
             */
            setEventSpace: function (eventSpace) {
                giant.isEventSpace(eventSpace, "Invalid event space");
                this.eventSpace = eventSpace;
                return this;
            },

            /**
             * Sets event path for the current class or instance.
             * @param {giant.Path} eventPath
             * @returns {giant.Evented}
             * @memberOf {giant.Evented}
             */
            setEventPath: function (eventPath) {
                var baseEventPath = this.getBase().eventPath,
                    subscriptionRegistry = this.subscriptionRegistry;

                giant
                    .isPath(eventPath, "Invalid event path")
                    .assert(
                        !baseEventPath || eventPath.isRelativeTo(baseEventPath),
                        "Specified event path is not relative to static event path");

                if (!subscriptionRegistry) {
                    // initializing subscription registry
                    this.subscriptionRegistry = giant.Dictionary.create();
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
             * @return {giant.Evented}
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
             * @return {giant.Evented}
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
             * @return {giant.Evented}
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
             * @param {giant.Path} delegatePath Path we're listening to. (Could be derived, eg. Query)
             * @param {function} handler Event handler function
             * @return {giant.Evented}
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
             * @return {giant.Evented}
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
             * @return {giant.Evented}
             */
            broadcastSync: function (eventName) {
                this.spawnEvent(eventName)
                    .broadcastSync(this.eventPath);
                return this;
            }
        });
});

/*global giant */
$oop.postpone(giant, 'Event', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * @name giant.Event.create
     * @function
     * @param {string} eventName Event name
     * @param {giant.EventSpace} eventSpace Event space associated with event
     * @returns {giant.Event}
     */

    /**
     * An event is an object that may traverse in an event space.
     * Events carry all information regarding their position & properties.
     * @class
     * @extends $oop.Base
     * @extends giant.EventSource
     */
    giant.Event = self
        .addPrivateMethods(/** @lends giant.Event# */{
            /**
             * Creates a new event instance and prepares it to be triggered.
             * @param {giant.Path} targetPath
             * @returns {giant.Event}
             * @private
             */
            _spawnMainBroadcastEvent: function (targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .setBroadcastPath(targetPath)
                    .setTargetPath(targetPath);
            },

            /**
             * Creates a new event instance and prepares it to be broadcast.
             * Broadcast events do not bubble.
             * @param {giant.Path} broadcastPath
             * @param {giant.Path} targetPath
             * @returns {giant.Event}
             * @private
             */
            _spawnBroadcastEvent: function (broadcastPath, targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .allowBubbling(false)
                    .setBroadcastPath(broadcastPath)
                    .setTargetPath(targetPath);
            }
        })
        .addMethods(/** @lends giant.Event# */{
            /**
             * @param {string} eventName Event name
             * @param {giant.EventSpace} eventSpace Event space associated with event
             * @ignore
             */
            init: function (eventName, eventSpace) {
                $assertion
                    .isString(eventName, "Invalid event name")
                    .isEventSpace(eventSpace, "Invalid event space");

                /**
                 * @type {string}
                 * @constant
                 */
                this.eventName = eventName;

                /**
                 * @type {giant.EventSpace}
                 * @constant
                 */
                this.eventSpace = eventSpace;

                /**
                 * Whether the current event can bubble
                 * @type {boolean}
                 */
                this.canBubble = true;

                /**
                 * Giant event or DOM event that led to triggering the current event.
                 * In most cases, this property is set automatically.
                 * @type {giant.Event|*}
                 */
                this.originalEvent = undefined;

                /**
                 * Whether the event's default behavior was prevented.
                 * @type {boolean}
                 */
                this.defaultPrevented = false;

                /**
                 * Whether event was handled. (A subscribed handler ran.)
                 * @type {boolean}
                 */
                this.handled = false;

                /**
                 * Identifies the sender of the event.
                 * @type {*}
                 */
                this.sender = undefined;

                /**
                 * Custom payload to be carried by the event.
                 * In most cases, this property is not modified directly, but through
                 * giant.setNextPayloadItem()
                 * @type {object}
                 * @see giant.setNextPayloadItem
                 */
                this.payload = {};

                /**
                 * Path reflecting current state of bubbling
                 * @type {giant.Path}
                 */
                this.currentPath = undefined;

                /**
                 * Path on which the event was originally triggered
                 * @type {giant.Path}
                 */
                this.originalPath = undefined;

                /**
                 * Reference to the original target path if
                 * the event was triggered as part of a broadcast.
                 * @type {giant.Path}
                 */
                this.broadcastPath = undefined;
            },

            /**
             * Clones event and optionally sets its currentPath property to
             * the one specified by the argument.
             * Override in subclasses to clone additional properties.
             * @param {giant.Path} [currentPath]
             * @returns {giant.Event}
             */
            clone: function (currentPath) {
                $assertion.isPathOptional(currentPath, "Invalid current event path");

                var result = this.getBase().create(this.eventName, this.eventSpace);

                // transferring paths
                result.originalPath = this.originalPath;
                result.currentPath = currentPath ?
                    currentPath.clone() :
                    this.currentPath.clone();
                result.broadcastPath = this.broadcastPath;

                // transferring event state
                result.originalEvent = this.originalEvent;
                result.defaultPrevented = this.defaultPrevented;
                result.handled = this.handled;

                // transferring load
                result.sender = this.sender;
                result.payload = this.payload;

                return result;
            },

            /**
             * Sets whether the event can bubble
             * @param {boolean} value Bubbling flag
             * @returns {giant.Event}
             */
            allowBubbling: function (value) {
                $assertion.isBoolean(value, "Invalid bubbling flag");
                this.canBubble = value;
                return this;
            },

            /**
             * Sets original event that led to triggering the current event.
             * @param {giant.Event|*} originalEvent
             * @returns {giant.Event}
             */
            setOriginalEvent: function (originalEvent) {
                this.originalEvent = originalEvent;
                return this;
            },

            /**
             * Retrieves event from chain of original events by type.
             * @param {function|$oop.Base} eventType
             * @returns {giant.Event|*} Original event matching the specified type.
             */
            getOriginalEventByType: function (eventType) {
                var that = this.originalEvent,
                    result;

                if (typeof eventType === 'function') {
                    while (that) {
                        if (that instanceof eventType) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                } else if ($oop.Base.isBaseOf(eventType)) {
                    while (that) {
                        if (eventType.isBaseOf(that)) {
                            result = that;
                            break;
                        } else {
                            that = that.originalEvent;
                        }
                    }
                }

                return result;
            },

            /**
             * Retrieves event from chain of original events by the name of the event.
             * @param {string} eventName
             * @returns {giant.Event|*} Original event matching the specified name.
             */
            getOriginalEventByName: function (eventName) {
                var that = this.originalEvent,
                    result;

                while (that) {
                    if (that.eventName === eventName) {
                        result = that;
                        break;
                    } else {
                        that = that.originalEvent;
                    }
                }

                return result;
            },

            /**
             * Sets flag for default behavior prevention to true.
             * @returns {giant.Event}
             */
            preventDefault: function () {
                this.defaultPrevented = true;
                return this;
            },

            /**
             * Assigns paths to the event.
             * @param {giant.Path} targetPath Path on which to trigger event.
             * @returns {giant.Event}
             */
            setTargetPath: function (targetPath) {
                $assertion.isPath(targetPath, "Invalid target path");
                this.originalPath = targetPath;
                this.currentPath = targetPath.clone();
                return this;
            },

            /**
             * Assigns a broadcast path to the event.
             * @param {giant.Path} broadcastPath Path associated with broadcasting.
             * @returns {giant.Event}
             */
            setBroadcastPath: function (broadcastPath) {
                $assertion.isPath(broadcastPath, "Invalid broadcast path");
                this.broadcastPath = broadcastPath;
                return this;
            },

            /**
             * Sets event sender reference.
             * @param {*} sender
             * @returns {giant.Event}
             */
            setSender: function (sender) {
                this.sender = sender;
                return this;
            },

            /**
             * Sets an item on the event payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via giant.setNextPayloadItem.
             * @param {string} payloadName
             * @param {*} payloadValue
             * @returns {giant.Event}
             * @see giant.EventSpace#setNextPayloadItem
             */
            setPayloadItem: function (payloadName, payloadValue) {
                this.payload[payloadName] = payloadValue;
                return this;
            },

            /**
             * Sets multiple payload items in the current event's payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via giant.setNextPayloadItems.
             * @param {object} payloadItems
             * @returns {giant.Event}
             */
            setPayloadItems: function (payloadItems) {
                var payload = this.payload,
                    payloadNames = Object.keys(payloadItems),
                    i, payloadName;

                for (i = 0; i < payloadNames.length; i++) {
                    payloadName = payloadNames[i];
                    payload[payloadName] = payloadItems[payloadName];
                }

                return this;
            },

            /**
             * Triggers event.
             * Event handlers are assumed to be synchronous. Event properties change
             * between stages of bubbling, hence holding on to an event instance in an async handler
             * may not reflect the current paths and payload carried.
             * @param {giant.Path} [targetPath] Path on which to trigger event.
             * @returns {giant.Event}
             */
            triggerSync: function (targetPath) {
                $assertion.isPathOptional(targetPath, "Invalid target path");

                // preparing event for trigger
                if (targetPath) {
                    this.setTargetPath(targetPath);
                }

                var currentPath = this.currentPath,
                    eventSpace = this.eventSpace,
                    handlerCount;

                if (!this.canBubble || this.originalPath.isA(giant.Query)) {
                    // event can't bubble because it's not allowed to
                    // or because path is a query and queries shouldn't bubble
                    // calling subscribed handlers once
                    eventSpace.callHandlers(this);
                } else {
                    // bubbling and calling handlers
                    while (currentPath.asArray.length) {
                        handlerCount = eventSpace.callHandlers(this);
                        if (handlerCount === false) {
                            // bubbling was deliberately stopped
                            // getting out of the bubbling loop
                            break;
                        } else {
                            if (handlerCount > 0) {
                                // setting handled flag
                                this.handled = true;
                            }
                            currentPath.asArray.pop();
                        }
                    }
                }

                return this;
            },

            /**
             * Broadcasts the event to all subscribed paths branching from the specified path.
             * Events spawned by a broadcast do not bubble except for the one that is triggered
             * on the specified broadcast path. It is necessary for delegates to react to
             * broadcasts.
             * @param {giant.Path} [broadcastPath] Target root for broadcast.
             * @returns {giant.Event}
             */
            broadcastSync: function (broadcastPath) {
                $assertion.isPathOptional(broadcastPath, "Invalid broadcast path");

                // defaulting to current path in case broadcast path was omitted
                broadcastPath = broadcastPath || this.currentPath;

                var mainEvent = this._spawnMainBroadcastEvent(broadcastPath),
                    broadcastEvents = this.eventSpace
                        // obtaining subscribed paths relative to broadcast path
                        .getPathsRelativeTo(this.eventName, broadcastPath)
                        // spawning an event for each subscribed path
                        .passEachItemTo(this._spawnBroadcastEvent, this, 1, broadcastPath)
                        .asType(giant.EventCollection)
                        // adding main event
                        .setItem('main', mainEvent);

                // triggering all affected events
                broadcastEvents
                    .setSender(this.sender)
                    .setPayloadItems(this.payload)
                    .setOriginalEvent(this.originalEvent)
                    .triggerSync();

                return this;
            }
        });
});

(function () {
    "use strict";

    $assertion.addTypes(/** @lends giant */{
        /** @param {giant.Event} expr */
        isEvent: function (expr) {
            return giant.Event.isBaseOf(expr);
        },

        /** @param {giant.Event} expr */
        isEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                giant.Event.isBaseOf(expr);
        }
    });
}());

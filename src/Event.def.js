$oop.postpone($event, 'Event', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Instantiates class.
     * @name $event.Event.create
     * @function
     * @param {string} eventName Event name
     * @param {$event.EventSpace} eventSpace Event space associated with event
     * @returns {$event.Event}
     */

    /**
     * An event is an object that may traverse in an event space.
     * Events carry all information regarding their position & properties.
     * @class
     * @extends $oop.Base
     * @extends $event.EventSource
     */
    $event.Event = self
        .addPrivateMethods(/** @lends $event.Event# */{
            /**
             * Creates a new event instance and prepares it to be triggered.
             * @param {$data.Path} targetPath
             * @returns {$event.Event}
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
             * @param {$data.Path} broadcastPath
             * @param {$data.Path} targetPath
             * @returns {$event.Event}
             * @private
             */
            _spawnBroadcastEvent: function (broadcastPath, targetPath) {
                return self.create(this.eventName, this.eventSpace)
                    .allowBubbling(false)
                    .setBroadcastPath(broadcastPath)
                    .setTargetPath(targetPath);
            }
        })
        .addMethods(/** @lends $event.Event# */{
            /**
             * @param {string} eventName Event name
             * @param {$event.EventSpace} eventSpace Event space associated with event
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
                 * @type {$event.EventSpace}
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
                 * @type {$event.Event|*}
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
                 * $event.setNextPayloadItem()
                 * @type {object}
                 * @see $event.setNextPayloadItem
                 */
                this.payload = {};

                /**
                 * Path reflecting current state of bubbling
                 * @type {$data.Path}
                 */
                this.currentPath = undefined;

                /**
                 * Path on which the event was originally triggered
                 * @type {$data.Path}
                 */
                this.originalPath = undefined;

                /**
                 * Reference to the original target path if
                 * the event was triggered as part of a broadcast.
                 * @type {$data.Path}
                 */
                this.broadcastPath = undefined;
            },

            /**
             * Clones event and optionally sets its currentPath property to
             * the one specified by the argument.
             * Override in subclasses to clone additional properties.
             * @param {$data.Path} [currentPath]
             * @returns {$event.Event}
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
             * @returns {$event.Event}
             */
            allowBubbling: function (value) {
                $assertion.isBoolean(value, "Invalid bubbling flag");
                this.canBubble = value;
                return this;
            },

            /**
             * Sets original event that led to triggering the current event.
             * @param {$event.Event|*} originalEvent
             * @returns {$event.Event}
             */
            setOriginalEvent: function (originalEvent) {
                this.originalEvent = originalEvent;
                return this;
            },

            /**
             * Retrieves event from chain of original events by type.
             * @param {function|$oop.Base} eventType
             * @returns {$event.Event|*} Original event matching the specified type.
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
             * @returns {$event.Event|*} Original event matching the specified name.
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
             * @returns {$event.Event}
             */
            preventDefault: function () {
                this.defaultPrevented = true;
                return this;
            },

            /**
             * Assigns paths to the event.
             * @param {$data.Path} targetPath Path on which to trigger event.
             * @returns {$event.Event}
             */
            setTargetPath: function (targetPath) {
                $assertion.isPath(targetPath, "Invalid target path");
                this.originalPath = targetPath;
                this.currentPath = targetPath.clone();
                return this;
            },

            /**
             * Assigns a broadcast path to the event.
             * @param {$data.Path} broadcastPath Path associated with broadcasting.
             * @returns {$event.Event}
             */
            setBroadcastPath: function (broadcastPath) {
                $assertion.isPath(broadcastPath, "Invalid broadcast path");
                this.broadcastPath = broadcastPath;
                return this;
            },

            /**
             * Sets event sender reference.
             * @param {*} sender
             * @returns {$event.Event}
             */
            setSender: function (sender) {
                this.sender = sender;
                return this;
            },

            /**
             * Sets an item on the event payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via $event.setNextPayloadItem.
             * @param {string} payloadName
             * @param {*} payloadValue
             * @returns {$event.Event}
             * @see $event.EventSpace#setNextPayloadItem
             */
            setPayloadItem: function (payloadName, payloadValue) {
                this.payload[payloadName] = payloadValue;
                return this;
            },

            /**
             * Sets multiple payload items in the current event's payload.
             * An event may carry multiple payload items set by multiple sources.
             * User payloads are usually set via $event.setNextPayloadItems.
             * @param {object} payloadItems
             * @returns {$event.Event}
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
             * @param {$data.Path} [targetPath] Path on which to trigger event.
             * @returns {$event.Event}
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

                if (!this.canBubble || this.originalPath.isA($data.Query)) {
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
             * @param {$data.Path} [broadcastPath] Target root for broadcast.
             * @returns {$event.Event}
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
                        .asType($event.EventCollection)
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

    $assertion.addTypes(/** @lends $event */{
        /** @param {$event.Event} expr */
        isEvent: function (expr) {
            return $event.Event.isBaseOf(expr);
        },

        /** @param {$event.Event} expr */
        isEventOptional: function (expr) {
            return typeof expr === 'undefined' ||
                $event.Event.isBaseOf(expr);
        }
    });
}());

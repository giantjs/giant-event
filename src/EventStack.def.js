/*global $event */
$oop.postpone($event, 'EventStack', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates an EventStack instance.
     * @name $event.EventStack.create
     * @function
     * @returns {$event.EventStack}
     */

    /**
     * Stores events in a quasi-stack structure.
     * @class
     * @extends $oop.Base
     */
    $event.EventStack = self
        .addMethods(/** @lends $event.EventStack# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Chain structure serving as the buffer for events.
                 * @type {$data.OpenChain}
                 */
                this.events = $data.OpenChain.create();
            },

            /**
             * Adds an event to the stack. To remove the event from the stack, call .unlink() on the returned $data.ValueLink instance.
             * @param {$event.Event|*} event
             * @returns {$data.ValueLink}
             */
            pushEvent: function (event) {
                var link = $data.ValueLink.create().setValue(event);
                this.events.pushLink(link);
                return link;
            },

            /**
             * Retrieves the last event added to the stack.
             * @returns {$event.Event|*}
             */
            getLastEvent: function () {
                return this.events.lastLink.previousLink.value;
            }
        });
});

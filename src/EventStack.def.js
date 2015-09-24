/*global giant */
$oop.postpone(giant, 'EventStack', function () {
    "use strict";

    var base = $oop.Base,
        self = base.extend();

    /**
     * Creates an EventStack instance.
     * @name giant.EventStack.create
     * @function
     * @returns {giant.EventStack}
     */

    /**
     * Stores events in a quasi-stack structure.
     * @class
     * @extends $oop.Base
     */
    giant.EventStack = self
        .addMethods(/** @lends giant.EventStack# */{
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
             * @param {giant.Event|*} event
             * @returns {$data.ValueLink}
             */
            pushEvent: function (event) {
                var link = $data.ValueLink.create().setValue(event);
                this.events.pushLink(link);
                return link;
            },

            /**
             * Retrieves the last event added to the stack.
             * @returns {giant.Event|*}
             */
            getLastEvent: function () {
                return this.events.lastLink.previousLink.value;
            }
        });
});

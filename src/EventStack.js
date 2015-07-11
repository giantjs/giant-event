/*global giant */
giant.postpone(giant, 'EventStack', function () {
    "use strict";

    var base = giant.Base,
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
     * @extends giant.Base
     */
    giant.EventStack = self
        .addMethods(/** @lends giant.EventStack# */{
            /**
             * @ignore
             */
            init: function () {
                /**
                 * Chain structure serving as the buffer for events.
                 * @type {giant.OpenChain}
                 */
                this.events = giant.OpenChain.create();
            },

            /**
             * Adds an event to the stack. To remove the event from the stack, call .unLink() on the returned giant.ValueLink instance.
             * @param {giant.Event|*} event
             * @returns {giant.ValueLink}
             */
            pushEvent: function (event) {
                var link = giant.ValueLink.create().setValue(event);
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

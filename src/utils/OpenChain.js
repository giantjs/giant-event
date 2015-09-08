/*global giant */
giant.postpone(giant, 'OpenChain', function () {
    "use strict";

    var base = giant.Base,
        self = base.extend();

    /**
     * Creates an OpenChain instance.
     * @name giant.OpenChain.create
     * @function
     * @returns {giant.OpenChain}
     */

    /**
     * Chain data structure with two fixed ends and value carrying links in between.
     * OpenChain behaves like a stack in that you may append and prepend the chain
     * using a stack-like API. (push, pop, etc.)
     * @class
     * @extends giant.Base
     */
    giant.OpenChain = self
        .addMethods(/** @lends giant.OpenChain# */{
            /** @ignore */
            init: function () {
                /**
                 * First (fixed) link in the chain.
                 * @type {giant.ValueLink}
                 */
                this.firstLink = giant.Link.create()
                    .setParentChain(this);

                /**
                 * Last (fixed) link in the chain.
                 * @type {giant.ValueLink}
                 */
                this.lastLink = giant.Link.create()
                    .addAfter(this.firstLink);
            },

            /**
             * Adds link at the end of the chain.
             * @param {giant.Link} link
             */
            pushLink: function (link) {
                link.addBefore(this.lastLink);
                return this;
            },

            /**
             * Adds new link with the specified value at the end of the chain.
             * @param {*} value
             * @returns {giant.OpenChain}
             */
            pushValue: function (value) {
                this.pushLink(giant.ValueLink.create()
                    .setValue(value));
                return this;
            },

            /**
             * Removes link from the end of the chain and returns removed link.
             * @returns {giant.Link}
             */
            popLink: function () {
                return this.lastLink.previousLink
                    .unlink();
            },

            /**
             * Adds link at the start of the chain.
             * @param {giant.Link} link
             */
            unshiftLink: function (link) {
                link.addAfter(this.firstLink);
                return this;
            },

            /**
             * Adds new link with the specified value at the start of the chain.
             * @param {*} value
             * @returns {giant.OpenChain}
             */
            unshiftValue: function (value) {
                this.unshiftLink(giant.ValueLink.create()
                    .setValue(value));
                return this;
            },

            /**
             * Removes link from the start of the chain and returns removed link.
             * @returns {giant.Link}
             */
            shiftLink: function () {
                return this.firstLink.nextLink
                    .unlink();
            },

            /**
             * Iterates over links from first to last and calls the specified function
             * passing the current link to it.
             * @param {function} handler
             * @param {object} [context=this]
             * @returns {giant.OpenChain}
             */
            forEachLink: function (handler, context) {
                giant
                    .isFunction(handler, "Invalid callback function")
                    .isObjectOptional(context, "Invalid context");

                var link = this.firstLink.nextLink,
                    i = 0;

                while (link !== this.lastLink) {
                    if (handler.call(context || this, link, i++) === false) {
                        break;
                    }
                    link = link.nextLink;
                }

                return this;
            },

            /**
             * Retrieves the chain's links as an array.
             * O(n) complexity.
             * @returns {Array}
             */
            getLinks: function () {
                var link = this.firstLink.nextLink,
                    result = [];

                while (link !== this.lastLink) {
                    result.push(link);
                    link = link.nextLink;
                }

                return result;
            },

            /**
             * Retrieves the values stored in the chain's links as an array.
             * O(n) complexity.
             * @returns {Array}
             */
            getValues: function () {
                var link = this.firstLink.nextLink,
                    result = [];

                while (link !== this.lastLink) {
                    result.push(link.value);
                    link = link.nextLink;
                }

                return result;
            }
        });
});

/*global giant, giant, giant, giant */
giant.postpone(giant, 'ValueLink', function () {
    "use strict";

    var base = giant.Link,
        self = base.extend();

    /**
     * Creates a ValueLink instance.
     * @name giant.ValueLink.create
     * @function
     * @returns {giant.ValueLink}
     */

    /**
     * Link that carries a value, and has the option to be unlinked.
     * @class
     * @extends giant.Link
     */
    giant.ValueLink = self
        .addMethods(/** @lends giant.ValueLink# */{
            /** @ignore */
            init: function () {
                base.init.call(this);

                /**
                 * Value associated with link.
                 * @type {*}
                 */
                this.value = undefined;
            },

            /**
             * Sets link value.
             * @param {*} value
             * @returns {giant.ValueLink}
             */
            setValue: function (value) {
                this.value = value;
                return this;
            }
        });
});

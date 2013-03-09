/**
 * Event Path
 *
 * Path that points to an event target.
 */
/*global dessert, troop, evan */
troop.promise(evan, 'EventPath', function () {
    /**
     * @class evan.EventPath
     * @extends evan.Path
     */
    return evan.Path.extend()
        .addMethod(/** @lends evan.EventPath */{
            /**
             * Decreases path length by one.
             */
            shrink: function () {
                this.asArray.pop();
                this.asString = this.asArray.join('.');

                return this;
            }
        });
});

dessert.addTypes(/** @lends dessert */{
    isEventPath: function (expr) {
        return evan.EventPath.isBaseOf(expr);
    },

    isEventPathOptional: function (expr) {
        return typeof expr === 'undefined' ||
               evan.EventPath.isBaseOf(expr);
    }
});

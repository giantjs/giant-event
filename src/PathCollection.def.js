/*global giant */
giant.postpone(giant, 'PathCollection', function () {
    "use strict";

    /**
     * @name giant.PathCollection.create
     * @function
     * @param {object} [items] Initial contents.
     * @returns {giant.PathCollection}
     */

    /**
     * @name giant.PathCollection#asArray
     * @ignore
     */

    /**
     * @class giant.PathCollection
     * @extends giant.Collection
     * @extends giant.Path
     */
    giant.PathCollection = giant.Collection.of(giant.Path);
});

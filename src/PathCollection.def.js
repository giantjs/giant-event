/*global giant */
$oop.postpone(giant, 'PathCollection', function () {
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
     * @extends $data.Collection
     * @extends $data.Path
     */
    giant.PathCollection = $data.Collection.of($data.Path);
});

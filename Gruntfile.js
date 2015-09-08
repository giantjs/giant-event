/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'src/namespace.js',
            'src/interfaces/EventSpawner.js',
            'src/interfaces/EventSource.js',
            'src/interfaces/EventTarget.js',
            'src/PathCollection.js',
            'src/Event.js',
            'src/EventCollection.js',
            'src/EventSpace.js',
            'src/Evented.js',
            'src/EventStack.js',
            'src/PayloadStore.js',
            'src/globals/originalEventStack.js',
            'src/globals/nextPayloadStore.js',
            'src/globals/eventSpace.js',
            'src/exports.js'
        ],

        test: [
            'src/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};

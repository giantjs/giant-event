/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Event");

    var eventSpace = evan.EventSpace.create();

    test("Instantiation", function () {
        raises(function () {
            evan.Event.create('foo', 'testEvent');
        }, "Invalid event space");

        raises(function () {
            evan.Event.create(eventSpace, 123);
        }, "Invalid event name");

        var event = evan.Event.create(eventSpace, 'testEvent');

        equal(event.eventName, 'testEvent', "Event name");
        strictEqual(event.eventSpace, eventSpace, "Event space");
        equal(typeof event.originalPath, 'undefined', "Original path");
        equal(typeof event.currentPath, 'undefined', "Current path");
        equal(typeof event.data, 'undefined', "Data load");
    });

    test("Cloning", function () {
        var originalEvent = evan.Event.create(eventSpace, 'testEvent')
            .prepareTrigger('test.path.hello.world'.toPath(), {foo: 'bar'}),
            cloneEvent,
            currentPath;

        cloneEvent = originalEvent.clone();

        strictEqual(originalEvent.eventSpace, cloneEvent.eventSpace, "Event spaces are the same");
        equal(originalEvent.eventName, cloneEvent.eventName, "Event names are the same");
        strictEqual(originalEvent.originalPath, cloneEvent.originalPath, "Original paths are the same");
        notStrictEqual(originalEvent.currentPath, cloneEvent.currentPath, "Current paths are not the same...");
        equal(originalEvent.currentPath.toString(), cloneEvent.currentPath.toString(), "...but they match");
        strictEqual(originalEvent.data, cloneEvent.data, "Custom data is the same");

        currentPath = 'test.path'.toEventPath();
        cloneEvent = originalEvent.clone(currentPath);

        notStrictEqual(cloneEvent.currentPath, currentPath, "Current path is not the same as specified...");
        equal(cloneEvent.currentPath.toString(), 'test.path', "..but they match");
    });

    test("Trigger preparation", function () {
        var event = evan.Event.create(eventSpace, 'testEvent');
        equal(typeof event.originalPath, 'undefined', "No original path initially");
        equal(typeof event.currentPath, 'undefined', "No current path initially");
        equal(typeof event.data, 'undefined', "No data initially");

        raises(function () {
            event.prepareTrigger('test.path', 'foo');
        }, "Invalid path");

        event.prepareTrigger('test.path'.toPath(), 'foo');

        ok(event.originalPath.instanceOf(sntls.Path), "Original path is plain path");
        ok(event.currentPath.instanceOf(evan.EventPath), "Current path is event specific path");

        notStrictEqual(event.originalPath, event.currentPath, "Original and current path different instances");
        deepEqual(event.originalPath.asArray, ['test', 'path'], "Original path set");
        deepEqual(event.currentPath.asArray, ['test', 'path'], "Current path set");
        equal(event.data, 'foo', "Custom data set");
    });

    test("Triggering", function () {
        expect(11);

        var event = evan.Event.create(eventSpace, 'testEvent'),
            i = 0;

        evan.EventSpace.addMock({
            callHandlers: function (event) {
                equal(event.eventName, 'testEvent', "Event name");
                equal(event.originalPath.toString(), 'test.path', "Original event path");
                equal(event.currentPath.toString(), ['test.path', 'test'][i++], "Current event path");
                deepEqual(event.data, {foo: 'bar'}, "Custom event data");
            }
        });

        event.triggerSync('test.path'.toPath(), {foo: 'bar'});

        equal(typeof event.originalPath, 'undefined', "Original path reset");
        equal(typeof event.currentPath, 'undefined', "Current path reset");
        equal(typeof event.data, 'undefined', "Data load reset");

        evan.EventSpace.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = evan.Event.create(eventSpace, 'testEvent');

        evan.EventSpace.addMock({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test.path', "Current event path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync('test.path'.toPath(), {foo: 'bar'});

        evan.EventSpace.removeMocks();
    });

    test("Broadcast", function () {
        var triggeredPaths = [],
            eventSpace = evan.EventSpace.create()
                .on('myEvent', 'test.event'.toPath(), function () {})
                .on('myEvent', 'test.event.foo'.toPath(), function () {})
                .on('myEvent', 'test.event.foo.bar'.toPath(), function () {})
                .on('myEvent', 'test.foo.bar'.toPath(), function () {})
                .on('myEvent', 'test.event.hello'.toPath(), function () {})
                .on('otherEvent', 'test.event'.toPath(), function () {})
                .on('otherEvent', 'test.event.foo'.toPath(), function () {}),
            event = eventSpace.spawnEvent('myEvent');

        evan.Event.addMock({
            triggerSync: function () {
                triggeredPaths.push(this.originalPath.toString());
            }
        });

        event.broadcastSync('test.event'.toPath(), 'foo');

        deepEqual(
            triggeredPaths,
            ['test.event', 'test.event.foo', 'test.event.foo.bar', 'test.event.hello'],
            "Paths triggered by broadcast"
        );

        evan.Event.removeMocks();
    });
}());

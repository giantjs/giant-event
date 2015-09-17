/*global giant, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Event");

    var eventSpace = giant.EventSpace.create();

    test("Instantiation", function () {
        raises(function () {
            giant.Event.create();
        }, "should raise exception on invalid event name argument");

        raises(function () {
            giant.Event.create('foo');
        }, "should raise exception on invalid event space argument");

        var event = giant.Event.create('testEvent', eventSpace);

        equal(event.eventName, 'testEvent', "should set event name");
        strictEqual(event.eventSpace, eventSpace, "should set event space");

        equal(event.canBubble, true, "should turn on bubbling");
        equal(typeof event.originalEvent, 'undefined', "should clear original event");
        equal(event.defaultPrevented, false, "should set defaultPrevented to false");
        equal(event.handled, false, "should set handled flag to false");

        equal(typeof event.originalPath, 'undefined', "should clear original path");
        equal(typeof event.currentPath, 'undefined', "should clear current path");
        equal(typeof event.sender, 'undefined', "should set sender property");
        deepEqual(event.payload, {}, "should set payload property");
    });

    test("Cloning event", function () {
        var MyEvent = giant.Event.extend(),
            originalEvent = MyEvent.create('testEvent', eventSpace)
                .setTargetPath('test.path.hello.world'.toPath())
                .setPayloadItem('foo', 'bar'),
            cloneEvent,
            currentPath;

        cloneEvent = originalEvent.clone();

        ok(cloneEvent.isA(MyEvent), "should preserve event (sub)class");
        strictEqual(originalEvent.eventSpace, cloneEvent.eventSpace, "should transfer event space");
        equal(originalEvent.eventName, cloneEvent.eventName, "should transfer event name");

        strictEqual(originalEvent.originalEvent, cloneEvent.originalEvent, "should transfer original event");
        equal(originalEvent.defaultPrevented, cloneEvent.defaultPrevented, "should transfer default prevention flag");
        equal(originalEvent.handled, cloneEvent.handled, "should transfer handled flag");

        strictEqual(originalEvent.originalPath, cloneEvent.originalPath, "should transfer original path");
        notStrictEqual(originalEvent.currentPath, cloneEvent.currentPath, "should create a new current path");
        equal(originalEvent.currentPath.toString(), cloneEvent.currentPath.toString(), "should transfer contents of current path");

        strictEqual(originalEvent.payload, cloneEvent.payload, "should transfer payload");
        strictEqual(originalEvent.sender, cloneEvent.sender, "should transfer sender");

        currentPath = 'test>path'.toPath();
        cloneEvent = originalEvent.clone(currentPath);

        notStrictEqual(cloneEvent.currentPath, currentPath, "Current path is not the same as specified...");
        equal(cloneEvent.currentPath.toString(), 'test>path', "..but they match");
    });

    test("Setting original event", function () {
        var originalEvent = giant.Event.create('originalEvent', eventSpace),
            event = giant.Event.create('testEvent', eventSpace);

        strictEqual(event.setOriginalEvent(originalEvent), event, "should be chainable");
        strictEqual(event.originalEvent, originalEvent, "should set original event");
    });

    test("Getting original event by type", function () {
        var event1 = new Event('foo'),
            Event2 = giant.Event.extend(),
            Event3 = giant.Event.extend(),
            event2 = Event2.create('event2', giant.EventSpace.create())
                .setOriginalEvent(event1),
            event3 = Event3.create('event3', giant.EventSpace.create())
                .setOriginalEvent(event2),
            event = giant.Event.create('event', giant.EventSpace.create())
                .setOriginalEvent(event3);

        strictEqual(event.getOriginalEventByType(Event), event1);
        strictEqual(event.getOriginalEventByType(Event2), event2);
        strictEqual(event.getOriginalEventByType(Event3), event3);
        strictEqual(event.getOriginalEventByType(giant.Event), event3);
    });

    test("Getting original event by name", function () {
        var event1 = evan.Event.create('foo', evan.EventSpace.create()),
            event2 = evan.Event.create('bar', evan.EventSpace.create())
                .setOriginalEvent(event1),
            event3 = evan.Event.create('baz', evan.EventSpace.create())
                .setOriginalEvent(event2);

        strictEqual(event3.getOriginalEventByName('foo'), event1);
        strictEqual(event3.getOriginalEventByName('bar'), event2);
        equal(typeof event3.getOriginalEventByName('baz'), 'undefined');
    });

    test("Setting default prevention flag", function () {
        var event = giant.Event.create('testEvent', eventSpace);

        strictEqual(event.preventDefault(), event, "should be chainable");
        equal(event.defaultPrevented, true, "should set defaultPrevented to true");
    });

    test("Setting target path", function () {
        var event = giant.Event.create('testEvent', eventSpace);

        raises(function () {
            event.setTargetPath('test>path');
        }, "should raise exception on invalid path");

        event.setTargetPath('test>path'.toPath());

        ok(event.originalPath.instanceOf(giant.Path), "should set a Path instance as originalPath");
        ok(event.currentPath.instanceOf(giant.Path), "should set a Path instance as currentPath");

        notStrictEqual(event.originalPath, event.currentPath,
            "should set different Path instances for originalPath and currentPath");
        equal(event.originalPath.toString(), event.currentPath.toString(),
            "should set originalPath and currentPath with identical contents");
    });

    test("Sender setter", function () {
        var event = giant.Event.create('testEvent', eventSpace),
            sender = {};

        strictEqual(event.setSender(sender), event, "should be chainable");
        strictEqual(event.sender, sender, "should set sender property");
    });

    test("Setting single payload item", function () {
        var event = giant.Event.create('testEvent', eventSpace);

        strictEqual(event.setPayloadItem('foo', 'bar'), event, "should be chainable");

        deepEqual(event.payload, {
            foo: 'bar'
        }, "should add payload");

        event.setPayloadItem('hello', 'world');

        deepEqual(event.payload, {
            foo  : 'bar',
            hello: 'world'
        }, "should add additional payload leaving old");
    });

    test("Setting multiple payload item", function () {
        var event = giant.Event.create('testEvent', eventSpace);

        strictEqual(event.setPayloadItems({
            foo  : 'bar',
            hello: 'world'
        }), event, "should be chainable");

        deepEqual(event.payload, {
            foo  : 'bar',
            hello: 'world'
        }, "should add payload items");
    });

    test("Triggering event", function () {
        expect(14);

        var originalEvent = giant.Event.create('original-event', eventSpace),
            event = giant.Event.create('test-event', eventSpace)
                .setPayloadItem('foo', 'bar')
                .setOriginalEvent(originalEvent),
            handledFlags = [],
            i = 0;

        raises(function () {
            event.triggerSync('foo');
        }, "should raise exception on invalid target path");

        giant.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.eventName, 'test-event',
                    "should call handlers with correct event name");
                equal(event.originalPath.toString(), 'test>path',
                    "should call handlers with correct original event path,");
                equal(event.currentPath.toString(), ['test>path', 'test'][i++],
                    "should call handlers with correct current event path");
                deepEqual(event.payload, {foo: 'bar'},
                    "should call handlers with correct payload");

                handledFlags.push(event.handled);

                // emulating that one handler was run
                return 1;
            }
        });

        event.triggerSync('test>path'.toPath());

        deepEqual(handledFlags, [false, true], "should set handled flags as event bubbles");

        equal(event.originalPath.toString(), 'test>path', "should leave original path intact");
        deepEqual(event.currentPath.asArray, [], "should leave current path empty (traversed)");
        deepEqual(event.payload, {foo: 'bar'}, "should leave payload intact");
        strictEqual(event.originalEvent, originalEvent, "should leave original event intact");

        giant.EventSpace.removeMocks();
    });

    test("Triggering with stop-propagation", function () {
        expect(1);

        var event = giant.Event.create('testEvent', eventSpace);

        giant.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers on specified path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync('test>path'.toPath());

        giant.EventSpace.removeMocks();
    });

    test("Triggering on queries", function () {
        expect(2);

        var event = giant.Event.create('testEvent', eventSpace);

        giant.EventSpace.addMocks({
            callHandlers: function (event) {
                ok(event.currentPath.isA(giant.Query), "should call handlers with query");
                equal(event.currentPath.toString(), 'test>|>path', "should set correct query contents");
            }
        });

        event.triggerSync('test>|>path'.toQuery());

        giant.EventSpace.removeMocks();
    });

    test("Triggering without bubbling", function () {
        expect(1);

        var event = giant.Event.create('testEvent', eventSpace)
            .allowBubbling(false);

        giant.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path', "should call handlers only once");
            }
        });

        event.triggerSync('test>path'.toPath());

        giant.EventSpace.removeMocks();
    });

    test("Triggering with pre-set target", function () {
        expect(1);

        var event = giant.Event.create('testEvent', eventSpace)
            .setTargetPath('test>path'.toPath());

        giant.EventSpace.addMocks({
            callHandlers: function (event) {
                equal(event.currentPath.toString(), 'test>path',
                    "should call handlers on pre-set path");

                // stops propagation after first bubbling
                return false;
            }
        });

        event.triggerSync();

        giant.EventSpace.removeMocks();
    });

    test("Broadcasting event", function () {
        expect(10);

        var triggeredPaths = [],
            eventSpace = giant.EventSpace.create()
                .subscribeTo('my-event', 'test>event'.toPath(), function () {})
                .subscribeTo('my-event', 'test>event>foo'.toPath(), function () {})
                .subscribeTo('my-event', 'test>event>foo>bar'.toPath(), function () {})
                .subscribeTo('my-event', 'test>foo>bar'.toPath(), function () {})
                .subscribeTo('my-event', 'test>event>hello'.toPath(), function () {})
                .subscribeTo('other-event', 'test>event'.toPath(), function () {})
                .subscribeTo('other-event', 'test>event>foo'.toPath(), function () {}),
            originalEvent = eventSpace.spawnEvent('original-event'),
            event = eventSpace.spawnEvent('my-event')
                .setOriginalEvent(originalEvent)
                .setPayloadItem('foo', 'bar');

        raises(function () {
            event.broadcastSync('foo');
        }, "should raise exception on invalid broadcast path");

        giant.Event.addMocks({
            triggerSync: function () {
                triggeredPaths.push(this.originalPath.toString());
                deepEqual(this.payload, {foo: 'bar'}, "should set payload on spawned event");
                strictEqual(this.originalEvent, originalEvent, "should set original event on spawned event");
            }
        });

        event.broadcastSync('test>event'.toPath());

        giant.Event.removeMocks();

        deepEqual(
            triggeredPaths,
            ['test>event>foo', 'test>event>foo>bar', 'test>event>hello', 'test>event'],
            "should trigger event on all paths below broadcast path"
        );
    });

    test("Broadcasting with pre-set target", function () {
        expect(1);

        var event = eventSpace.spawnEvent('my-event')
            .setTargetPath('test>path'.toPath());

        event.addMocks({
            _spawnMainBroadcastEvent: function (broadcastPath) {
                equal(broadcastPath.toString(), 'test>path',
                    "should call handlers on pre-set path");

                // just so the rest of the method can complete
                return giant.Event.create('foo', eventSpace)
                    .setTargetPath(broadcastPath);
            }
        });

        event.broadcastSync();
    });
}());

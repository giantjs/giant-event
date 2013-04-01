/*global evan, module, test, expect, ok, equal, strictEqual, deepEqual, raises */
(function (EventSpace) {
    module("EventSpace");

    test("Instantiation", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();
        deepEqual(eventSpace.registry, {}, "Event registry initialized");
    });

    test("Event creation", function () {
        expect(2);

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();

        evan.Event.addMock({
            create: function (es, eventName) {
                strictEqual(es, eventSpace, "Event space");
                equal(eventName, 'myEvent', "Event name");
            }
        });

        eventSpace.createEvent('myEvent');

        evan.Event.removeMocks();
    });

    test("Subscription", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create();

        function handler1() {}

        function handler2() {}

        raises(function () {
            eventSpace.on('myEvent', 'test.event.path', 123);
        }, "Invalid event handler");

        eventSpace.on('myEvent', 'test.event.path', handler1);

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler1]
                }
            },
            "Event handler added to registry"
        );

        eventSpace.on('myEvent', 'test.event.path', handler2);

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler1, handler2]
                }
            },
            "Event handler added to registry"
        );
    });

    test("Unsubscription", function () {
        function handler1() {}

        function handler2() {}

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
            .on('myEvent', 'test.event.path', handler1)
            .on('myEvent', 'test.event.path', handler2);

        eventSpace.off('myEvent', 'test.event.path', handler1);

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {
                    myEvent: [handler2]
                }
            },
            "Former handler unsubscribed"
        );

        eventSpace.off('myEvent', 'test.event.path');

        deepEqual(
            eventSpace.registry,
            {
                'test.event.path': {}
            },
            "All handlers unsubscribed"
        );
    });

    test("Bubbling", function () {
        expect(2);

        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
                .on('myEvent', 'test.event', function (event, data) {
                    strictEqual(event, myEvent, "Event instance passed to handler");
                    strictEqual(data, event.data, "Custom event data passed to handler");
                }),
            myEvent = eventSpace.createEvent('myEvent');

        myEvent.originalPath = evan.EventPath.create('test.event');
        myEvent.currentPath = myEvent.originalPath.clone();

        strictEqual(eventSpace.bubbleSync(myEvent), eventSpace, "Bubbling returns event space");
    });

    test("Bubbling", function () {
        var eventSpace = /** @type {evan.EventSpace} */ EventSpace.create()
                .on('event', 'test.event', function () {
                    return false;
                }),
            event = eventSpace.createEvent('event');

        event.originalPath = evan.EventPath.create('test.event');
        event.currentPath = event.originalPath.clone();

        eventSpace.bubbleSync(event);

        equal(eventSpace.bubbleSync(event), false, "Propagation stopped by handler");
    });
}(evan.EventSpace));

/*global $event */
(function () {
    "use strict";

    module("EventStack");

    test("Instantiation", function () {
        var eventStack = $event.EventStack.create();

        ok(eventStack.events.isA($data.OpenChain), "should add events property");
    });

    test("Pushing event", function () {
        expect(3);

        var eventStack = $event.EventStack.create(),
            event = {},
            link;

        eventStack.events.addMocks({
            pushLink: function (link) {
                strictEqual(link.value, event, "should push link to chain");
            }
        });

        link = eventStack.pushEvent(event);

        ok(link.isA($data.ValueLink), "should return ValueLink instance");
        strictEqual(link.value, event, "should set event as link value");
    });

    test("First event getter", function () {
        var eventStack = $event.EventStack.create(),
            event = {};

        eventStack.pushEvent({});
        eventStack.pushEvent(event);

        strictEqual(eventStack.getLastEvent(), event, "should return first event");
    });

    test("Unordered pop", function () {
        var eventStack = $event.EventStack.create(),
            link1 = eventStack.pushEvent(1), // will be sync
            link2 = eventStack.pushEvent(2), // will be async
            link3 = eventStack.pushEvent(3); // will be sync

        deepEqual(eventStack.events.getValues(), [1, 2, 3],
            "should start with all events in the stack");

        link1.unlink();

        deepEqual(eventStack.events.getValues(), [2, 3],
            "should then remove first sync link from stack");

        link3.unlink();

        deepEqual(eventStack.events.getValues(), [2],
            "should then remove second sync link from stack");

        link2.unlink();

        deepEqual(eventStack.events.getValues(), [],
            "should then remove async link from stack");
    });
}());

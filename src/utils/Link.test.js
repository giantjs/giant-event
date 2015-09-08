/*global giant, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Link");

    test("Instantiation", function () {
        var link = giant.Link.create();

        ok(link.hasOwnProperty('previousLink'), "should add previousLink property");
        ok(link.hasOwnProperty('nextLink'), "should add nextLink property");
        ok(link.hasOwnProperty('parentChain'), "should add parentChain property");
    });

    test("Adding link after disconnected link", function () {
        var chain = giant.OpenChain.create(),
            link = giant.Link.create(),
            previousLink = giant.Link.create()
                .setParentChain(chain);

        strictEqual(link.addAfter(previousLink), link, "should be chainable");
        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(link.parentChain, chain, "should set parentChain on link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");

        raises(function () {
            link.addAfter(giant.Link.create());
        }, "should raise exception on attempting to add already connected link");
    });

    test("Adding link after connected link", function () {
        var link = giant.Link.create(),
            previousLink = giant.Link.create(),
            nextLink = giant.Link.create()
                .addAfter(previousLink);

        link.addAfter(previousLink);

        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on next link");
    });

    test("Adding link before disconnected link", function () {
        var chain = giant.OpenChain.create(),
            link = giant.Link.create(),
            nextLink = giant.Link.create()
                .setParentChain(chain);

        strictEqual(link.addBefore(nextLink), link, "should be chainable");
        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(link.parentChain, chain, "should set parentChain on link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on after link");

        raises(function () {
            link.addBefore(giant.Link.create());
        }, "should raise exception on attempting to add already connected link");
    });

    test("Adding link before connected link", function () {
        var link = giant.Link.create(),
            nextLink = giant.Link.create(),
            previousLink = giant.Link.create()
                .addBefore(nextLink);

        link.addBefore(nextLink);

        strictEqual(link.nextLink, nextLink, "should set nextLink on link");
        strictEqual(link.previousLink, previousLink, "should set previousLink on link");
        strictEqual(nextLink.previousLink, link, "should set previousLink on next link");
        strictEqual(previousLink.nextLink, link, "should set nextLink on previous link");
    });

    test("Link removal", function () {
        var link = giant.Link.create(),
            afterLink = giant.Link.create()
                .addAfter(link),
            beforeLink = giant.Link.create()
                .addBefore(link);

        strictEqual(link.unlink(), link, "should be chainable");
        ok(!link.nextLink, "should remove nextLink");
        ok(!link.previousLink, "should remove previousLink");
        strictEqual(afterLink.previousLink, beforeLink, "should set previousLink on old next link");
        strictEqual(beforeLink.nextLink, afterLink, "should set nextLink on old previous link");
    });

    test("Unlinking lone link", function () {
        var link = giant.Link.create();

        link.unlink();
        ok(!link.nextLink, "should leave nextLink unaffected");
        ok(!link.previousLink, "should leave previousLink unaffected");
    });

    test("Setting parent chain", function () {
        var link = giant.Link.create(),
            chain = giant.OpenChain.create();

        strictEqual(link.setParentChain(chain), link, "should be chainable");
        strictEqual(link.parentChain, chain, "should set parentChain property");

        raises(function () {
            giant.Link.create()
                .addAfter(link)
                .setParentChain(chain);
        }, "should raise exception on attempting to set parent on a connected link");
    });
}());

/*global giant, Event, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("OpenChain");

    test("Instantiation", function () {
        var chain = giant.OpenChain.create();

        ok(chain.firstLink.instanceOf(giant.Link), "should add firstLink property");
        ok(chain.lastLink.instanceOf(giant.Link), "should add lastLink property");
        strictEqual(chain.lastLink.previousLink, chain.firstLink, "should link first to last link");
        strictEqual(chain.firstLink.nextLink, chain.lastLink, "should link last to first link");
        strictEqual(chain.lastLink.parentChain, chain, "should set parentChain on lastLink");
        strictEqual(chain.firstLink.parentChain, chain, "should set parentChain on firstLink");
    });

    test("Link push", function () {
        var chain = giant.OpenChain.create(),
            link = giant.ValueLink.create();

        strictEqual(chain.pushLink(link), chain, "should be chainable");
        strictEqual(chain.firstLink.nextLink, link, "should set pushed link in chain");
    });

    test("Link pop", function () {
        var link = giant.ValueLink.create(),
            chain = giant.OpenChain.create()
                .pushLink(link);

        strictEqual(chain.popLink(), link, "should return removed link");
        strictEqual(chain.firstLink.nextLink, chain.lastLink, "should remove link from chain");
    });

    test("Link unshift", function () {
        var chain = giant.OpenChain.create(),
            link = giant.ValueLink.create();

        strictEqual(chain.unshiftLink(link), chain, "should be chainable");
        strictEqual(chain.firstLink.nextLink, link, "should set un-shifted link in chain");
    });

    test("Link shift", function () {
        var link = giant.ValueLink.create(),
            chain = giant.OpenChain.create()
                .unshiftLink(link);

        strictEqual(chain.shiftLink(), link, "should return removed link");
        strictEqual(chain.firstLink.nextLink, chain.lastLink, "should remove link from chain");
    });

    test("Iterator", function () {
        var chain = giant.OpenChain.create()
                .pushLink(giant.ValueLink.create().setValue(3))
                .unshiftLink(giant.ValueLink.create().setValue(2))
                .unshiftLink(giant.ValueLink.create().setValue(1))
                .pushLink(giant.ValueLink.create().setValue(4)),
            results = [];

        raises(function () {
            chain.forEachLink();
        }, "should raise exception on missing arguments");

        chain.forEachLink(function (link, i) {
            results.push([link, i]);
        });

        deepEqual(results, [
            [chain.firstLink.nextLink, 0],
            [chain.firstLink.nextLink.nextLink, 1],
            [chain.firstLink.nextLink.nextLink.nextLink, 2],
            [chain.lastLink.previousLink, 3]
        ], "should call handler for all links");
    });

    test("Links getter", function () {
        var chain = giant.OpenChain.create()
            .pushLink(giant.ValueLink.create().setValue(3))
            .unshiftLink(giant.ValueLink.create().setValue(2))
            .unshiftLink(giant.ValueLink.create().setValue(1))
            .pushLink(giant.ValueLink.create().setValue(4));

        deepEqual(chain.getLinks(), [
            chain.firstLink.nextLink,
            chain.firstLink.nextLink.nextLink,
            chain.firstLink.nextLink.nextLink.nextLink,
            chain.lastLink.previousLink
        ], "should return values in order of links");
    });

    test("Values getter", function () {
        var chain = giant.OpenChain.create()
            .pushLink(giant.ValueLink.create().setValue(3))
            .unshiftLink(giant.ValueLink.create().setValue(2))
            .unshiftLink(giant.ValueLink.create().setValue(1))
            .pushLink(giant.ValueLink.create().setValue(4));

        deepEqual(chain.getValues(), [1, 2, 3, 4], "should return values in order of links");
    });
}());

/*global sntls, evan, module, test, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Query");

    test("URI encode", function () {
        deepEqual(
            evan.Query._encodeURI([
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ]),
            [
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ],
            "Query structure encoded"
        );
    });

    test("URI decode", function () {
        deepEqual(
            evan.Query._decodeURI([
                ['f%7Co', 'b%3Cr'],
                {},
                'baz%5C'
            ]),
            [
                ['f|o', 'b<r'],
                {},
                'baz\\'
            ],
            "Query structure decoded"
        );
    });

    test("Parsing", function () {
        var Query = evan.Query,
            query = 'foo>\\>bar>hello<world>|';

        deepEqual(
            evan.Query._parseString(query),
            ['foo', Query.PATTERN_SKIP, 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK],
            "Query parsed"
        );
    });

    test("Matching key to pattern", function () {
        ok(evan.Query._matchKeyToPattern('hello', 'hello'), "Key matches string");
        ok(!evan.Query._matchKeyToPattern('hello', 'foo'), "Key doesn't match different string");

        ok(evan.Query._matchKeyToPattern('hello', evan.Query.PATTERN_ASTERISK), "Key matches wildcard");
        ok(!evan.Query._matchKeyToPattern('hello', {}), "Key doesn't match unknown wildcard");

        ok(evan.Query._matchKeyToPattern('hello', ['hello', 'world']), "Key matches choices");
        ok(!evan.Query._matchKeyToPattern('hello', ['foo', 'bar']), "Key doesn't match choices it's not in");
    });

    test("Matching query to path", function () {
        var query;

        query = 'test>path>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Static query matched by path");
        ok(!query.matchesPath('test>path>bar'.toPath()), "Static query not matched by path");

        query = 'test>|>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Query w/ wildcard matched by path");
        ok(!query.matchesPath('foo>path>foo'.toPath()), "Query w/ wildcard not matched by path");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ wildcard not matched by path");
        ok(!query.matchesPath('test>path'.toPath()), "Query w/ wildcard not matched by path");

        query = 'test>\\>foo'.toQuery();
        ok(query.matchesPath('test>path>foo'.toPath()), "Query w/ skipping matched by path");
        ok(query.matchesPath('test>path>hello>foo'.toPath()), "Query w/ skipping matched by path");
        ok(query.matchesPath('test>path>hello>world>foo'.toPath()), "Query w/ skipping matched by path");
        ok(!query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ skipping not matched by path");

        query = '\\>test>foo'.toQuery();
        ok(query.matchesPath('test>foo'.toPath()), "Query w/ skipping at start matched by path");
        ok(query.matchesPath('hello>world>test>foo'.toPath()), "Query w/ skipping at start matched by path");
        ok(!query.matchesPath('test>path'.toPath()), "Query w/ skipping at start not matched by path");

        query = 'test>path>\\'.toQuery();
        ok(query.matchesPath('test>path>foo>bar'.toPath()), "Query w/ skipping at end matched by path");
    });

    test("Instantiation", function () {
        var query;

        raises(function () {
            evan.Query.create(5);
        }, "Invalid query");

        query = evan.Query.create(['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']]);
        deepEqual(
            query.asArray,
            ['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized w/ array"
        );

        query = evan.Query.create('hello>|>you<all');
        deepEqual(
            query.asArray,
            ['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized w/ string"
        );
    });

    test("Type conversion", function () {
        var query;

        query = ['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']].toQuery();
        deepEqual(
            query.asArray,
            ['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized from array"
        );

        query = 'hello>|>you<all'.toQuery();
        deepEqual(
            query.asArray,
            ['hello', evan.Query.PATTERN_ASTERISK, ['you', 'all']],
            "Query initialized from string"
        );
    });

    test("Stem extraction", function () {
        var Query = evan.Query,
            query = Query.create(['foo', 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK]),
            result;

        result = query.getStemPath();

        ok(result.instanceOf(sntls.Path), "Stem path is class Path");
        deepEqual(result.asArray, ['foo', 'bar'], "Stem path buffer");
    });

    test("Serialization", function () {
        var Query = evan.Query,
            query = Query.create([
                'foo', Query.PATTERN_SKIP, 'bar', ['hello', 'world'], Query.PATTERN_ASTERISK
            ]);

        equal(query.toString(), 'foo>\\>bar>hello<world>|', "Query in string form");
    });
}());

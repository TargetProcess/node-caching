var Caching = require('../')
    , memoryCache = new Caching('memory')
    , assert = require('assert');

describe('MemoryStore', function () {

    it('should call store once only for the same key', function (done) {
        var wroteCache = false
            , lastResults
            , callbacksCalled = 0
            , key = 'hello memory ' + Math.random()
            , ttl = 500; // 1s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        memoryCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            lastResults = results;
            wroteCache = false;
        });

        // Try again
        memoryCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.equal(results, lastResults);
            assert.ok(!wroteCache);
            lastResults = results;
            wroteCache = false;

            assert.equal(callbacksCalled, 3);
            done();
        });
    });

    it('should support expiration', function (done) {
        var wroteCache = false
            , lastResults
            , callbacksCalled = 0
            , key = 'hello memory ' + Math.random()
            , ttl = 500; // .5s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        memoryCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            lastResults = results;
            wroteCache = false;
        });

        // Wait until the cache has expired
        setTimeout(function () {
            memoryCache(key, ttl, store, function (err, results) {
                callbacksCalled++;
                assert.ifError(err);
                assert.equal(typeof results, 'number');
                assert.notEqual(results, lastResults);
                assert.ok(wroteCache);
                lastResults = results;
                wroteCache = false;


                assert.equal(callbacksCalled, 4);
                done();
            });
        }, ttl * 2);
    });

    it('should support removal', function (done) {

        var wroteCache = false
            , callbacksCalled = 0
            , key = 'hello rem memory ' + Math.random()
            , ttl = 500; // .5s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
                wroteCache = false;
            }, 200);
        }

        // Feel the cache
        memoryCache(key, ttl, store, function setBeforeRemoval(err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);

            // Remove it manually
            memoryCache.remove(key);

            // Try again
            memoryCache(key, ttl, store, function getAfterRemoval(err, results) {
                callbacksCalled++;
                assert.ifError(err);
                assert.equal(typeof results, 'number');
                assert.ok(wroteCache);

                assert.equal(callbacksCalled, 4);
                done();
            });
        });
    });

    it('should support removal by pattern', function (done) {

        var wroteCache = false
            , callbacksCalled = 0
            , key = 'hello rem memory ' + Math.random()
            , ttl = 500; // .5s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
                wroteCache = false;
            }, 200);
        }

        // Feel the cache
        memoryCache(key, ttl, store, function setBeforeRemoval(err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);

            // Remove it manually (using a pattern)
            memoryCache.remove('hello rem*');

            // Try again
            memoryCache(key, ttl, store, function getAfterRemoval(err, results) {
                callbacksCalled++;
                assert.ifError(err);
                assert.equal(typeof results, 'number');
                assert.ok(wroteCache);

                assert.equal(callbacksCalled, 4);
                done();
            });
        });
    });
});
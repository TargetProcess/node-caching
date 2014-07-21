var Caching = require('../')
    , assert = require('assert');

describe('RedisStore', function () {

    it('should call store once only for the same key', function (done) {

        var redisCache = new Caching('redis')
            , wroteCache = false
            , callbacksCalled = 0
            , key = 'hello redis ' + Math.random()
            , ttl = 500; // 1s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        redisCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            wroteCache = false;
        });

        // Try again
        redisCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(!wroteCache);
            redisCache.store.client.end();


            assert.equal(callbacksCalled, 3);
            done();
        });
    });


    it('should support expiration', function (done) {

        this.timeout(5000);

        var redisCache = new Caching('redis')
            , wroteCache = false
            , callbacksCalled = 0
            , key = 'hello redis ' + Math.random()
            , ttl = 1000; // 1s (the least possible on Redis since it only takes integer seconds)

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        redisCache(key, ttl, store, function (err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            wroteCache = false;
        });

        // Wait until the cache has expired
        var t = Date.now();
        setTimeout(function () {
            redisCache(key, ttl, store, function (err, results) {
                callbacksCalled++;
                assert.ifError(err);
                assert.equal(typeof results, 'number');
                assert.ok(wroteCache);
                redisCache.store.client.end();

                assert.equal(callbacksCalled, 4);
                done();
            });
        }, ttl * 2);
    });


    it('should support removal', function (done) {

        this.timeout(5000);

        var redisCache = new Caching('redis')
            , wroteCache = false
            , callbacksCalled = 0
            , key = 'hello rem redis ' + Math.random()
            , ttl = 500; // .5s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        redisCache(key, ttl, store, function setBeforeRemoval(err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            wroteCache = false;

            // Remove it manually
            redisCache.remove(key);

            // Try again (wait a little bit because the patters requires two redis commands)
            setTimeout(function () {
                redisCache(key, ttl, store, function getAfterRemoval(err, results) {
                    callbacksCalled++;
                    assert.ifError(err);
                    assert.equal(typeof results, 'number');
                    assert.ok(wroteCache);
                    redisCache.store.client.end();

                    assert.equal(callbacksCalled, 4);
                    done();
                });
            }, 50);
        });
    });


    it('should support removal by pattern', function (done) {

        this.timeout(5000);

        var redisCache = new Caching('redis')
            , wroteCache = false
            , callbacksCalled = 0
            , key = 'hello rem redis ' + Math.random()
            , ttl = 500; // .5s

        function store(next) {
            callbacksCalled++;
            wroteCache = true;
            setTimeout(function () {
                next(null, Date.now());
            }, 200);
        }

        // Feel the cache
        redisCache(key, ttl, store, function setBeforeRemoval(err, results) {
            callbacksCalled++;
            assert.ifError(err);
            assert.equal(typeof results, 'number');
            assert.ok(wroteCache);
            wroteCache = false;

            // Remove it manually (using a pattern)
            redisCache.remove('hello rem*');

            // Try again (wait a little bit because the patters requires two redis commands)
            setTimeout(function () {
                redisCache(key, ttl, store, function getAfterRemoval(err, results) {
                    callbacksCalled++;
                    assert.ifError(err);
                    assert.equal(typeof results, 'number');
                    assert.ok(wroteCache);
                    redisCache.store.client.end();

                    assert.equal(callbacksCalled, 4);
                    done();
                });
            }, 50);
        });
    });
});
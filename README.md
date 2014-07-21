# node-caching

* In-memory / haredis-based cache with smooth API for node.js
* Inspired by [Mathias Pettersson](https://github.com/mape/node-caching)

## Installation

Via [npm](http://github.com/isaacs/npm):

    $ npm install caching

## Code example
    var Caching = require('caching');
    var cache = new Caching('redis'); /* use 'memory' or 'redis' */
    
    setInterval(function() {
        cache(
            'key',
            10000 /*ttl in ms*/,
            function(passalong) {
                // This will only run once, all following requests will use cached data.
                setTimeout(function() {
                    passalong(null, 'Cached result');
                }, 1000);
            },
            function(err, results) {
                // This callback will be reused each call
                console.log(results);
            });
    }, 100);

## Built in stores
* Memory
* Redis

## Api

    cache(key, ttl, runIfNothingInCache, useReturnedCachedResults);

### arguments[0]
Key, `'myKey'`
### arguments[1]
Time To Live in ms, `60*30*1000`
### arguments[2]
Callback that will run if results aren't already in cache store.

    function(passalong) {
        setTimeout(function() {
            passalong(null, 'mape', 'frontend developer', 'sweden');
        }, 1000);
    }

### arguments[3]
Callback that is called every time the method runs.

    function(err, name, position, location) {
        console.log(name, position, location);
    }
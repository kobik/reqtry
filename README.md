[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![NPM Downloads][downloads-image]][downloads-url]
# request-repeat

Wraps both request-promise-native and retry-as-promised together, in order to provide an easy way to do requests with retries while returning a promise.

**Note**: *request-promise* option `resolveWithFullResponse` will be always set to `true`. Hence, the result of any successful request would always contain the full response, regardless its user-defined value.

## API
request-repeat should support all [request-promise-native](https://github.com/request/request-promise-native) functionality, so you can pass all options as you would pass them to the original package

### retry
request-repeat should support all [retry-as-promised](https://www.npmjs.com/package/retry-as-promised) functionality, so you can pass all options as you would pass them to the original package by setting them in retry object
```js
retry: {
  /* retry-as-promised options */
}
```

In addition to the original package options, the following extra options are accepted
#### retryOn5xx
enable retry on any 5xx error
```js
retry: {
  retryOn5xx: true
}
```

#### retryStrategyFn
a function that is used to decide on what other cases to do a retry
```js
retry: {
  retryStrategyFn: function (response) {
    // return a boolean
  }
}
```

#### successFn
a function that is called on success
```js
retry: {
  successFn: function (request, response, errorCount) {
    // do something on success
  }
}
```

#### errorFn
a function that is called on error
```js
retry: {
  errorFn: function (request, error, errorCount) {
    // do something on error
  }
}
```
#### Usage
```js
var request = require('request-repeat');

var options = {
  url: 'http://www.site-with-issues.com',
  body: {/* body */},
  json: true,
  retry: {
    max: 3,
    backoffBase: 500,
    retryOn5xx: true,
    retryStrategyFn: function(response) {
      return response.statusCode === 500 && response.body.match(/Temporary error/);
    },
    errorFn: function(request, error, errorCount) {
      console.error(`- Request to ${request.url} failed on the ${retries} attempt with error ${error.message}`);
    },
    successFn: function(request, response) {
      console.info(`- Got status-code ${response.statusCode} on request to ${request.url}`);
    }
  }
}
```

#### Result
```js
> request.post(options).then()...
- "Request to http://www.site-with-issues.com failed on the 1 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80"
- "Request to http://www.site-with-issues.com failed on the 2 attempt with RequestError: Error: getaddrinfo ENOTFOUND www.site-with-issues.com www.site-with-issues.com:80"
- "Got status-code 200 on request to http://www.site-with-issues.com"
```

#### Usage with defaults
```js
var request = require('request-repeat');

var requestWithDefaults = request.defaults({
  json: true,
  retry: {
    max: 3,
    backoffBase: 500,
    retryOn5xx: true,
    retryStrategyFn: function(response) {
      return response.statusCode === 500 && response.body.match(/Temporary error/);
    },
    errorFn: function(request, error, errorCount) {
      console.error(`- Request to ${request.url} failed on the ${retries} attempt with error ${error.message}`);
    },
    successFn: function(request, response) {
      console.info(`- Got status-code ${response.statusCode} on request to ${request.url}`);
    }
  }
});

requestWithDefaults.get('http://www.site-with-issues.com').then...
```
[npm-image]: https://img.shields.io/npm/v/request-repeat.svg?style=flat
[npm-url]: https://npmjs.org/package/request-repeat
[travis-image]: https://travis-ci.org/kobik/request-repeat.svg?branch=master
[travis-url]: https://travis-ci.org/kobik/request-repeat
[coveralls-image]: https://coveralls.io/repos/github/kobik/request-repeat/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/repos/github/kobik/request-repeat/badge.svg?branch=master
[downloads-image]: http://img.shields.io/npm/dm/request-repeat.svg?style=flat
[downloads-url]: https://npmjs.org/package/request-repeat
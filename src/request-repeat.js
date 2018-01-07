'use strict';

var retry = require('retry-as-promised');
var StatusCodeError = require('./StatusCodeError');
var RequestError = require('./RequestError');
var defaults = require('lodash').defaults;
var isObject = require('lodash').isObject;

/**
 * Send request using retry-as-promised
 *
 * @param {Object} request the request-promise instance to use
 * @param {string} method the method to send
 * @param {(string|Object)} url the url to send the request to or options
 * @param {Object} options
 * @returns {Promise}
 */
module.exports = function request(request, method, url, options) {
    var [_url, _options, retryOptions] = buildOptions(url, options, request.retryDefaults);

    var errorCount = 0;
    return retry(() => {
        return request[method](_url, _options)
            .then((response) => handleResponse(retryOptions, request, response))
            .catch((error) => handleError(retryOptions, _url, error, ++errorCount));
    }, retryOptions)
        .then((response) => buildResponse(retryOptions, response, errorCount));
};

function buildOptions(url, options, retryDefaults) {
    var retryOptions;
    if (typeof url === 'string') {
        options = options || {};
        retryOptions = defaults({}, options.retry, retryDefaults);
        options = buildRequestOptions(options, retryOptions);
    } else if (typeof url === 'object') {
        retryOptions = defaults({}, url.retry, retryDefaults);
        url = buildRequestOptions(url, retryOptions);
    }

    return [url, options, retryOptions];
}

function buildRequestOptions(requestOptions, retryOptions) {
    retryOptions.simple = requestOptions.simple || retryOptions.simple;
    requestOptions.simple = false;
    requestOptions.resolveWithFullResponse = true;
    return requestOptions;
}

function handleResponse(retryOptions, request, response, errorCount) {
    var {retryOn5xx, retryStrategyFn, successFn} = retryOptions;

    if (retryOn5xx && response.statusCode >= 500) {
        throw new StatusCodeError(response);
    } else if (typeof retryStrategyFn === 'function' && retryStrategyFn(response)) {
        throw new RequestError(response);
    } else if (typeof successFn === 'function') {
        successFn(request, response, errorCount);
    }
    return response;
}

function handleError(retryOptions, request, error, errorCount) {
    if (retryOptions.errorFn) {
        retryOptions.errorFn(request, error, errorCount);
    }
    throw error;
}

function buildResponse(retryOptions, response, errorCount) {
    if ((retryOptions.simple === true || retryOptions.simple === undefined) && response.statusCode >= 300) {
        throw new StatusCodeError(response);
    }
    response.errorCount = errorCount;
    return response;
}
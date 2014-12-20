(function() {
    'use strict';

    var module = angular.module('billett.common');

    module.service('ResponseData', function() {
        this.get = function(name) {
            if (window.response_data && name in window.response_data) {
                return window.response_data[name];
            }
        };
        this.set = function(name, value) {
            if (!window.response_data) window.response_data = {};
            window.response_data[name] = value;
        };
    });
})();

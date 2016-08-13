const angular = require('angular');

module.exports = 'billett.common';

(function() {
    angular.module('billett.common', [
        require('../auth'),
        require('angular-animate'),
        require('ngtoast')
    ]);

    require('./bootstrap.scss');
    require('./CsrfInceptorService');
    require('./directives');
    require('./events.scss');
    require('./filters');
    require('./HeaderController');
    require('./index');
    require('./PageController');
    require('./PageService');
    require('./template.scss');
})();

const angular = require('angular');

module.exports = 'billett.guest';

(function() {
    angular.module('billett.guest', [
        require('../common'),
        require('angular-marked'),
        require('ui.router'),
        require('angular-animate'),
    ]);

    require('./infopages/HjelpController');
    require('./infopages/SalgsBetController');
    require('./event/event.scss');
    require('./event/filters');
    require('./event/EventController');
    require('./event/EventReservation');
    require('./index/IndexController');
    require('./order/OrderController');
    require('./eventgroup/EventgroupController');
    require('./eventgroup/eventgroup.scss');
})();

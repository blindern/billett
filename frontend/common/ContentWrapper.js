import angular from 'angular';
let module = angular.module('billett.common');

module.directive('contentWrapper', () => {
    return {
        restrict: 'A',
        template: require('!!html!./content.html')
    };
});

import angular from 'angular';

import auth from "../auth";

angular.module('billett.common', [
    auth,
    'ngAnimate',
    'ngToast'
]);

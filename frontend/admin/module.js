(function() {
    var module = angular.module('billett.admin', [
        'angularFileUpload',
        'billett.auth',
        'billett.common',
        'ngResource',
        'ui.router',
        'ui.bootstrap.modal',
        'ui.bootstrap.tpls',
        'ui.unique',
        'ng-sortable',
        'focusOn'
    ]);

    module.run(function ($modalStack, $rootScope) {
        // make sure modals close on state change
        $rootScope.$on('$stateChangeSuccess', function () {
            var topModal = $modalStack.getTop();
            while (topModal) {
                $modalStack.dismiss(topModal.key, '$locationChangeSuccess');
                topModal = $modalStack.getTop();
            }
        });
    });
})();

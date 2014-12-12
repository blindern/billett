(function() {
    'use strict';

    var module = angular.module('billett.admin.event');

    module.config(function($routeProvider) {
        $routeProvider.when('/a/event/:id', {
            templateUrl: 'assets/views/admin/event/index.html',
            controller: 'AdminEventController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminEventController', function(Page, $routeParams, AdminEvent, $location, $scope, FileUploader) {
        Page.setTitle("Arrangement");

        var loader = Page.setLoading();
        AdminEvent.get({id:$routeParams['id']}, function(ret) {
            loader();
            $scope.event = ret;
        }, function(err) {
            loader();
            Page.set404();
        });

        $scope.deleteEvent = function() {
            if ($scope.event.ticketgroups.length > 0) {
                Page.toast("Du må først slette billettgruppene som er tilegnet.", { class: 'danger' });
                return;
            }

            var group = $scope.event.eventgroup.id;
            $scope.event.$delete(function() {
                $location.path('/a/eventgroup/'+group);
            }, function(err) {
                alert(err);
            });
        };

        // uploading of image
        $scope.uploader = new FileUploader({
            url: 'event/'+$routeParams['id']+'/image',
            removeAfterUpload: true
        });
        $scope.uploader.onAfterAddingFile = function(fileItem) {
            $scope.uploadprogress = true;
            fileItem.onSuccess = function(res) {
                $scope.uploadprogress = null;
                $scope.image_version = (new Date()).getTime();
            };
            fileItem.onError = function() {
                alert("Ukjent feil ved opplasting!");
            };
            fileItem.upload();
        };
    })
})();

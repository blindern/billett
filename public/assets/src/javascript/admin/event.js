'use strict';

angular.module('billett.admin.event', [
    'ngRoute',
    'billett.helper.page',
    'angularFileUpload'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/event/:id', {
        templateUrl: 'views/admin/event/index.html',
        controller: 'AdminEventController'
    }).

    when('/a/event/:id/edit', {
        templateUrl: 'views/admin/event/edit.html',
        controller: 'AdminEventEditController'
    }).

    when('/a/eventgroup/:id/new_event', {
        templateUrl: 'views/admin/event/new.html',
        controller: 'AdminEventNewController'
    }).

    // checkin handling
    when('/a/event/:id/checkin', {
        templateUrl: 'views/admin/event/checkin.html',
        controller: 'AdminCheckinController'
    });
})

.controller('AdminEventController', function(Page, $routeParams, AdminEvent, $location, $scope, FileUploader) {
    Page.setTitle("Arrangement");

    AdminEvent.get({id:$routeParams['id']}, function(ret) {
        $scope.event = ret;
    }, function(err) {
        $location.path('/a');
    });

    $scope.deleteEvent = function() {
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

.controller('AdminEventEditController', function(Page, $routeParams, $scope, AdminEvent, $location) {
    Page.setTitle('Arrangement');

    AdminEvent.get({id:$routeParams['id']}, function(ret) {
        $scope.event = ret;

        var parseTime = function(t) {
            if (!t) return;
            return moment.unix(t).format('DD.MM.YYYY HH:mm');
        };

        $scope.time_start_text = parseTime($scope.event.time_start);
        $scope.time_end_text = parseTime($scope.event.time_end);
    }, function(err) {
        $location.path('/a');
    });

    $scope.updateTime = function(which) {
        $scope.event[which == 'start' ? 'time_start' : 'time_end'] =
                moment(
                    $scope[which == 'start' ? 'time_start_text' : 'time_end_text'],
                    'DD.MM.YYYY HH:mm'
                ).unix();
    };

    $scope.saveEvent = function() {
        if (isNaN($scope.event.time_start)) return;

        $scope.event.$update(function(res) {
            $location.path('/a/event/'+res.id);
        }, function(err) {
            alert(err.data);
        });
    };
})

.controller('AdminEventNewController', function(Page, $routeParams, $scope, AdminEventgroup, AdminEvent, $location) {
    Page.setTitle('Nytt arrangement');
    $scope.eventgroup_id = $routeParams['id'];
    $scope.event = {
        max_sales: 100,
        max_each_person: 10
    };

    AdminEventgroup.get({id:$routeParams['id']}, function(ret) {
        $scope.group = ret;
    }, function(err) {
        $location.path('/a');
    });

    $scope.updateTime = function(which) {
        $scope.event[which == 'start' ? 'time_start' : 'time_end'] =
                moment(
                    $scope[which == 'start' ? 'time_start_text' : 'time_end_text'],
                    'DD.MM.YYYY HH:mm'
                ).unix();
    };

    $scope.addEvent = function() {
        if (isNaN($scope.event.time_start)) return;

        var e = new AdminEvent($scope.event);
        e.group_id = $scope.eventgroup_id;
        e.$save(function(res) {
            $location.path('/a/event/'+res.id);
        }, function(err) {
            alert(err.data);
        });
    };
})

.controller('AdminCheckinController', function(Page, $routeParams) {
    // TODO
})

.factory('AdminEvent', function($resource, $http) {
    var r = $resource('api/event/:id', {
        'id': '@id'
    }, {
        update: { method: 'PUT' }
    });

    r.prototype.setPublish = function(state) {
        return $http.patch('api/event/'+this.id, {
            'is_published': state
        });
    };

    r.prototype.setSelling = function(state) {
        return $http.patch('api/event/'+this.id, {
            'is_selling': state
        });
    };

    return r;
});

'use strict';

angular.module('billett.admin.event', [
    'ngRoute',
    'billett.auth',
    'billett.helper.page',
    'angularFileUpload'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/event/:id', {
        templateUrl: 'views/admin/event/index.html',
        controller: 'AdminEventController',
        resolve: {auth: 'AuthRequireResolver'}
    }).

    when('/a/event/:id/edit', {
        templateUrl: 'views/admin/event/edit.html',
        controller: 'AdminEventEditNewController',
        resolve: {auth: 'AuthRequireResolver'}
    }).

    when('/a/eventgroup/:group_id/new_event', {
        templateUrl: 'views/admin/event/edit.html',
        controller: 'AdminEventEditNewController',
        resolve: {auth: 'AuthRequireResolver'}
    }).

    // checkin handling
    when('/a/event/:id/checkin', {
        templateUrl: 'views/admin/event/checkin.html',
        controller: 'AdminCheckinController',
        resolve: {auth: 'AuthRequireResolver'}
    });
})

.controller('AdminEventController', function(Page, $routeParams, AdminEvent, $location, $scope, FileUploader) {
    Page.setTitle("Arrangement");

    var loader = Page.setLoading();
    AdminEvent.get({id:$routeParams['id']}, function(ret) {
        loader();
        $scope.event = ret;
    }, function(err) {
        $location.path('/a');
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

.controller('AdminEventEditNewController', function(Page, AdminEventgroup, $routeParams, $rootScope, $scope, AdminEvent, $location, $window, $timeout) {
    var is_new = $scope.is_new = !('id' in $routeParams);

    var loader = Page.setLoading();
    if (is_new)
    {
        Page.setTitle('Nytt arrangement');
        $scope.eventgroup_id = $routeParams['group_id'];
        $scope.event = {
            max_sales: 0,
            max_each_person: 10
        };

        AdminEventgroup.get({id:$routeParams['group_id']}, function(ret) {
            $scope.group = ret;
            loader();
        }, function(err) {
            $location.path('/a');
        });
    }

    else {
        Page.setTitle('Rediger arrangement');

        AdminEvent.get({id:$routeParams['id']}, function(ret) {
            loader();
            $scope.event = ret;
            $scope.group = ret.eventgroup;

            var parseTime = function(t) {
                if (!t) return;
                return moment.unix(t).format('DD.MM.YYYY HH:mm');
            };

            $scope.time_start_text = parseTime($scope.event.time_start);
            $scope.time_end_text = parseTime($scope.event.time_end);
        }, function(err) {
            $location.path('/a');
        });
    }

    $scope.updateTime = function(which) {
        var x =
                moment(
                    $scope[which == 'start' ? 'time_start_text' : 'time_end_text'],
                    'DD.MM.YYYY HH:mm'
                ).unix();
        if (x < 0) x = 0;
        $scope.event[which == 'start' ? 'time_start' : 'time_end'] = x;
    };

    $scope.storeEvent = function() {
        if (isNaN($scope.event.time_start)) return;

        if (is_new) {
            var e = new AdminEvent($scope.event);
            e.group_id = $scope.eventgroup_id;
            e.$save(function(res) {
                $location.path('/a/event/'+res.id);
            }, function(err) {
                alert(err.data);
            });
        } else {
            $scope.event.$update(function(res) {
                // go to previous page or redirect to event admin page
                var timer = $timeout(function() { $location.path('/a/event/'+res.id); }, 100);
                var ev = $rootScope.$on('$routeChangeStart', function(event, next, current) {
                    ev();
                    $timeout.cancel(timer);
                });
                $window.history.back();
            }, function(err) {
                alert(err.data);
            });
        }
    };
})

.controller('AdminCheckinController', function(Page, $routeParams) {
    // TODO
})

.factory('AdminEvent', function($resource, $http) {
    var r = $resource('api/event/:id', {
        'id': '@id',
        'admin': 1
    }, {
        update: { method: 'PUT' }
    });

    r.prototype.setPublish = function(state) {
        return $http.patch('api/event/'+this.id, {
            'is_published': state,
            'admin': 1
        });
    };

    r.prototype.setSelling = function(state) {
        return $http.patch('api/event/'+this.id, {
            'is_selling': state,
            'admin': 1
        });
    };

    return r;
});

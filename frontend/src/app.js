import moment from "moment"
import "moment/dist/locale/nb.js"

import "./jquery"
import "angular"
import "angular-ui-router"
import "angular-animate"
import "angular-resource"
import "angular-sanitize"
import "angular-bootstrap/ui-bootstrap.js"
import "angular-bootstrap/ui-bootstrap-tpls.js"
import "angular-file-upload"
import { marked } from "marked"
import "angular-marked"
import "ng-toast"
import "ng-focus-on"
import "angular-google-analytics"
import "@opengovsg/angular-legacy-sortablejs-maintained"

import "bootstrap-sass/assets/javascripts/bootstrap.js"

import AuthService from "./auth/AuthService"

import angularGoogleAnalytics from "angular-google-analytics"
import auth from "./auth"
import common from "./common"
import admin from "./admin"
import guest from "./guest"
import angular from "angular"

import "./app.scss"

import template404 from "./guest/infopages/404.html?raw"

window.marked = marked

moment.locale("nb")

let module = angular.module("billett", [
  "ui.router",
  angularGoogleAnalytics,
  auth,
  common,
  admin,
  guest,
])

module.config(function (
  $locationProvider,
  $httpProvider,
  $stateProvider,
  $urlRouterProvider,
  AnalyticsProvider,
  ngToastProvider,
) {
  $stateProvider.state("404", {
    template: template404,
  })

  $urlRouterProvider.otherwise(function ($injector, $location) {
    console.log("404 found")
    $injector.invoke([
      "$state",
      function ($state) {
        $state.go("404")
      },
    ])
  })

  // use HTML5 history API for nice urls
  $locationProvider.html5Mode(true)

  $httpProvider.defaults.withCredentials = true

  AnalyticsProvider.setAccount("UA-19030223-1")
  AnalyticsProvider.trackPages(false)
  AnalyticsProvider.trackPrefix("billett")
  AnalyticsProvider.useAnalytics(true)
  AnalyticsProvider.useECommerce(true, false)

  ngToastProvider.configure({
    horizontalPosition: "center",
  })
})

module.run(function ($rootScope, $timeout, Analytics, Page) {
  $rootScope.$on("$stateChangeSuccess", function () {
    // let it finish page setup
    $timeout(function () {
      var loaded = function () {
        // let the digest run so all states are updated
        $timeout(function () {
          AuthService.isDevPage().then((isDevPage) => {
            if (!isDevPage) {
              console.log("tracking page view")
              Analytics.trackPage()
            }
          })
        }, 0)
      }
      var p = Page.getPageLoaderPromise()
      if (p) p.then(loaded)
      else loaded()
    }, 0)
  })

  // iframe state
  $rootScope.isInIframe = window.top != window.self
})

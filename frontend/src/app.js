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
import "@opengovsg/angular-legacy-sortablejs-maintained"

import "bootstrap-sass/assets/javascripts/bootstrap.js"

import auth from "./auth"
import common from "./common"
import admin from "./admin"
import guest from "./guest"
import angular from "angular"

window.marked = marked

moment.locale("nb")

let module = angular.module("billett", [
  "ui.router",
  auth,
  common,
  admin,
  guest,
])

module.config(
  function (
    $locationProvider,
    $httpProvider,
    $stateProvider,
    $urlRouterProvider,
    ngToastProvider,
  ) {
    $httpProvider.defaults.withCredentials = true

    ngToastProvider.configure({
      horizontalPosition: "center",
    })
  },
)

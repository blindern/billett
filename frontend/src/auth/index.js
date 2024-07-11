import { api } from "../api"
import AuthService from "./AuthService"
import angular from "angular"

export default "billett.auth"

var module = angular.module("billett.auth", ["ui.router"])

module.config(function ($stateProvider) {
  $stateProvider
    .state("login", {
      url: "/login",
      template: "Går til logg inn side",
      controller: function ($location) {
        window.location.href = api("saml2/login?returnTo=a")
      },
    })
    .state("logout", {
      url: "/logout",
      template: "Logger ut",
      controller: function (AuthService) {
        AuthService.getCsrfToken().then((csrfToken) => {
          const form = document.createElement("form")
          form.method = "post"
          form.action = api(
            `saml2/logout?_token=${encodeURIComponent(
              csrfToken,
            )}&returnTo=${encodeURIComponent(window.location.origin + "/")}`,
          )
          document.body.append(form)
          form.submit()
        })
      },
    })
})

module.factory("AuthService", function ($location, $q) {
  return AuthService
})

module.factory("AuthRequireResolver", function ($location, $q, AuthService) {
  return $q(function (resolve, reject) {
    AuthService.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        AuthService.hasRole("billett.admin").then((hasRole) => {
          if (hasRole) {
            resolve()
          } else {
            $location.path("/")
            reject()
          }
        }, reject)
      } else {
        window.location.href = api(
          `saml2/login?returnTo=${encodeURIComponent($location.path())}`,
        )
      }
    }, reject)
  })
})

// helper directive to mark a form input with has-error class
// usage: <div form-input-check="form-name,input-name">
module.directive("formInputCheck", () => {
  return {
    restrict: "A",
    link: (_scope, _element, _attrs) => {
      var t = _attrs["formInputCheck"].split(","),
        form = _scope[t[0]],
        input = _scope[t[0]][t[1]]

      function recheck() {
        if (input.$invalid && (input.$dirty || form.$submitted))
          _element.addClass("has-error")
        else _element.removeClass("has-error")
      }

      _scope.$watch(form.$name + "." + input.$name + ".$invalid", recheck)
      _scope.$watch(form.$name + ".$submitted", recheck)
    },
  }
})

// add 'autofocus' as an attribute to a tag
// source: https://stackoverflow.com/a/20865048
module.directive("autofocus", ($timeout) => {
  return {
    restrict: "AC",
    link: (_scope, _element) => {
      $timeout(() => {
        _element[0].focus()
      }, 100)
    },
  }
})

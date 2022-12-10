var module = angular.module("billett.guest")

module.filter("range", function () {
  return function (count) {
    count = parseInt(count)
    var ret = []
    for (var i = 0; i < count; i++) ret.push(i)
    return ret
  }
})

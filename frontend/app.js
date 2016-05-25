var app = angular.module("sampleApp", ["firebase"]);

app.controller("SampleCtrl", function($scope, $firebaseArray) {
  var ref = new Firebase("https://verifier.firebaseio.com/messages");
  var ref2 = new Firebase("https://verifier.firebaseio.com/logs/profileUpdates");

  // create a synchronized array
  // click on `index.html` above to see it used in the DOM!
  $scope.messages = $firebaseArray(ref);
  $scope.logs = $firebaseArray(ref2);
  
    $scope.addMessage = function() {
    $scope.messages.$add({
      text: $scope.newMessageText
    });
  };
  
});
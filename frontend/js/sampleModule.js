
angular.module('sampleModule', []);

// The controller can eventually be moved to another file. 
// Add the controller to the module. 
angular.module('sampleModule').controller('SampleController', SampleController);

// Define the controller.
function SampleController($scope) {
  $scope.z = 0;
  $scope.sum = function () {
    $scope.z = $scope.x + $scope.y;
  };
};

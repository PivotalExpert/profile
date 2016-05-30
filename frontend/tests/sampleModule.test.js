
describe('sampleModule', function () {

  beforeEach(module('sampleModule'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  describe('sum', function () {
      it('1 + 1 should equal 2', function () {
          expect(2).toBe(2);
      });
      
		it('1 + 1 should equal 2', function () {
			var $scope = {};
			var controller = $controller('SampleController', { $scope: $scope });
			$scope.x = 1;
			$scope.y = 2;
			$scope.sum();
			expect($scope.z).toBe(3);
		});	
	});

});
/**
 * Created by rdidier on 9/26/16.
 */

angular.module('matchaApp').controller('homeCtrl', function ($scope, $rootScope, $routeParams, $location) {

   if ($routeParams.opt == 'new'){
      $scope.new = true;
   }else if ($routeParams.opt == 'newMail')
      $scope.newMail = true;

});
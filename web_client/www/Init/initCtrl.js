/**
 * Created by Mathiisss on 01/10/2016.
 */
angular.module('matchaApp').controller('initCtrl', function($scope, sender){


    $scope.finish = false;
    $scope.loading = false;
    $scope.reset = function() {
        $scope.loading = true;
        sender.get('/admin/reset', {password: $scope.password, nb: $scope.nb}, function(success){
            $scope.loading = false;
            $scope.finish = true;
        })
    }

});

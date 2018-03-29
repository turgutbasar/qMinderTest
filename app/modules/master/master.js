angular.module('master', []).controller('masterController', function($scope, $timeout) {
    $scope.search = function() {
        // Broadcast to child
        $scope.$broadcast('username_changed', $scope.username);
    }

    // profile_loaded event handler (From Child Controller)
    $scope.$on('profile_loaded', function(events, data) {
		var user = data.data.graphql.user;
        $timeout(function() {
            $scope.$apply(function() {
                $scope.bio = user.biography;
                $scope.followed = user.edge_followed_by.count;
                $scope.follows = user.edge_follow.count;
                $scope.name = user.full_name;
                $scope.pic = user.profile_pic_url;
                $scope.external = user.external_url;
            });
        });
    });
});
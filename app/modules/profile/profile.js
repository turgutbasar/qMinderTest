angular.module('master.profile', [])
.controller('profileController', function($scope, $q, ProfileService) {
	
	function callback(d) {
		// Emit to parent
		$scope.$emit('profile_loaded', d);
	}

	$scope.profile = new ProfileService("justinbieber", callback);

	// username_changed event handler (From Parent Controller)
	$scope.$on('username_changed', function(events, data) {
		$scope.profile = new ProfileService(data, callback);
	});

})
.factory('ProfileService', function($http) {
	
	// Profile Service Object for AJAX call encapsulation
	function Profile(username, initCallback, moreCallback) {
		
		this.username = username;
		this.userid = 0;
		this.items = [];
		this.busy = true;
		this.next = {};
		this.moreCallback = moreCallback;

		// Old API did not worked with given /?__a=1 trick. It gives first pile of images
		// Hovewer, to get more we needed to use https://instagram.com/graphql/query/?query_id=17888483320059182 API
		// We got first pile of images and some meta information from first API.
		// After first API call, we used user id we received from first call to make second API call.
		$http.get("https://www.instagram.com/" + this.username + "/?__a=1").then(successCallback);

		var me = this;

		function successCallback(data) {
			me.next = data.data.graphql.user.edge_owner_to_timeline_media.page_info;
			_.each(data.data.graphql.user.edge_owner_to_timeline_media.edges, function(item) {
				me.items.push(item)
			});
			me.userid = data.data.graphql.user.id;
			me.busy = false;
			initCallback(data);
			me.loadMore();
		}
	}
	// Load more method to load next chuck of images from profile
	Profile.prototype.loadMore = function() {
		if (this.busy) return;
		
		this.busy = true;

		if (!this.next.has_next_page) return;

		// This API call works for more feed calls.
		// https://stackoverflow.com/questions/49265013/instagram-a-1max-id-end-cursor-isnt-working-for-public-user-feeds
		$http.get("https://instagram.com/graphql/query/?query_id=17888483320059182&id=" + this.userid + "&first=12&after=" + this.next.end_cursor).then(successCallback);

		var me = this;

		function successCallback(data) {
			me.next = data.data.data.user.edge_owner_to_timeline_media.page_info;
			_.each(data.data.data.user.edge_owner_to_timeline_media.edges, function(item) {
				me.items.push(item)
			});
			me.busy = false;
			if (me.moreCallback == undefined || me.moreCallback == null) return;
			me.moreCallback(data);
		}
	}

	return Profile;
})
.directive('infiniteScroll', function($window, $timeout) {
	// Our implementation of infiniteScroll directive.
	// We took element and bind scroll event. If scroll event
	// passes threshold we defined, we triggered setted event handler
	// In our case we set loadMore method of Profile as event handler
	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			var apply, disabled, needMore, rawElement;
			rawElement = element[0];
			disabled = false;
			scope.$watch(attr.infiniteScrollDisabled, function(value) {
				return disabled = value;
			});
			needMore = function() {
				var elementBottom, remaining, windowBottom, windowHeight;
				if (disabled) {
					return false;
				}
				windowHeight = $window.innerHeight;
				windowBottom = $window.pageYOffset + windowHeight;
				elementBottom = rawElement.scrollTop + rawElement.offsetHeight;
				remaining = elementBottom - windowBottom;
				return remaining <= windowHeight * 0.5;
			};
			apply = function() {
				if (needMore()) {
					return $timeout(function() {
						scope.$apply(attr.infiniteScroll);
						return apply();
					});
				}
			};
			angular.element($window).on('scroll', apply);
			scope.$on('$destroy', function() {
				return angular.element($window).off('scroll', apply);
			});
			return apply();
		}
	};
});
define(["app", "mam"], function (app) {

    var spaceController = function ($rootScope, $scope, $location, $state, $http, $stateParams, downloadService, userService, yunpanService, mamService, $uibModal, shareService) {

        $scope.model = $scope.params;
        var items = JSON.parse($scope.model.param);
        function init() {
         if ($scope.model.type === 'down') {
             down();
         } else if ($scope.model.type === 'export') {
             outstore();
         }else if ($scope.model.type === "share") {
             share();
         }

        }

        function down() {
            var contentIds = [];
            for (var i = 0; i < items.length; i++)
                contentIds.push(items[i]);
                downloadService.download(contentIds);
           
        }

        function outstore() {
                mamService.outstore(items); 
        }

        function share() {
            shareService.share(items);
        }

        init();
    };



    spaceController.$inject = ["$rootScope", "$scope", "$location", "$state", "$http", "$stateParams", "downloadService", "userService", "yunpanService", "mamService", "$uibModal", "shareService"];

    return spaceController;
});
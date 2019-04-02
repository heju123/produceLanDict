define([

], function () {
    /**
     * MAH、MCH联合检索，目前只是针对南京台做的
     */
    var unionSearchCtrl = function ($rootScope, $scope, $http, $location, $state, $timeout, $interval, $uibModal, $sce) {

        $rootScope.pageTitle = '媒资库检索 - ' + nxt.config.siteName;

        $scope.keyword = '';
        $scope.currentIndex = 0;
        $scope.tabs = [];
        $scope.iframes = ['', ''];
        var originalUrls = ['', ''];

        $scope.query = function () {
            $scope.changeSiteTab($scope.currentIndex);
        }

        $scope.changeSiteTab = function (index) {
            $scope.currentIndex = index;
            var url = getUrl();
            if (url != originalUrls[index]) {
                originalUrls[index] = url;
                $scope.iframes[index] = $sce.trustAsResourceUrl(url);
            }
        }

        function getUrl() {
            var site = $scope.tabs[$scope.currentIndex];
            var url = site.url;
            if ($scope.keyword) {
                if (site.name === 'MAH') {
                    url += '&keyword=' + encodeURIComponent(JSON.stringify([$scope.keyword]));
                }
                if (site.name === 'MCH') {
                    url += '&keywords=' + $scope.keyword;
                }
            }
            return url;
        }

        function init() {
            if (!nxt.user.current)
            {
                window.location.href = nxt.config.loginUrl + '?login_backUrl=' + escape(window.location.href);
                return;
            }
            var sites = _.get(nxt, 'config.unionSearch.sites', []);
            if (sites.length == 0) {
                mam.message.error('请先在系统配置中配置联合检索站点后再使用。', { closeDelay : 0});
                return;
            }
            _.forEach(sites, function (item) {
                item.url = _.template(item.url)({ config: nxt.config, user: nxt.user });
            })
            $scope.tabs = sites;

            $scope.changeSiteTab(0);
        }

        init();

        $interval(function () { $http.get('~/user/beat', { errorHandle: false }); }, 1000 * 60 * 10);

    };
    unionSearchCtrl.$inject = ['$rootScope', '$scope', '$http', '$location', '$state', '$timeout', '$interval', '$uibModal', '$sce'];
    return unionSearchCtrl;
});
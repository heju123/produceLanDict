define([
    'moment',
    'mam',
    'metadata',
    'filters/searchFilter',
    'directives/searchDirective',
    'directives/seniorSearchConDirective',
], function (moment) {

    var searchController = function ($rootScope, $scope, $http, $location, $state, $timeout, $interval, $uibModal, $compile, downloadService, mamService, chooseBasketService, favoriteService, shareService) {

        $rootScope.pageTitle = '媒资库检索'.l('search.title') + ' - ' + nxt.config.siteName;

        $scope.config = nxt.config;
        $scope.other = new Other();
        $scope.senior = new Senior();
        $scope.facet = new Facet();
        $scope.operate = new Operate();
        $scope.template = new Template();
        $scope.chooseBasket = new ChooseBasket();
        $scope.search = new Search();

        // 检测是不是部门文秘这个角色--zb
        if (nxt.user && nxt.user.current) {
            if (nxt.config.theme.name === 'zb') {
                $scope.isSecretary = nxt.user.current.roles.some(ele => {
                    return ele.roleName === '部门文秘'
                })
            }
        } else {
            if (location.href.split('?login_backUrl=').length < 2) {
                location.href = nxt.config.loginUrl || '/login'
            }
        }

        // todo：进入页面后从url地址中解析参数（未解析完）
        // todo：检索模板（）
        // todo：检索片段（后台接口报错）

        // 检索相关
        function Search() {
            var self = this;
            this.result = {};
            this.entityTypes = [];
            this.request = {};
            this.viewMode = localStorage.getItem('search_view_mode') || nxt.config.searchBase.defaultViewMode || 0;
            this.sort = { // 这块是配置的
                items: nxt.config.searchSortFields,
                current: null
            };
            this.sort.current = this.sort.items[0];

            this.sizes = [
                {
                    name: '每页20条'.l('search.054', {page: 20}),
                    size: '20'
                }, {
                    name: '每页40条'.l('search.054', {page: 40}),
                    size: '40'
                }, {
                    name: '每页60条'.l('search.054', {page: 60}),
                    size: '60'
                }];
            this.time = {
                items: [{
                    name: '全部'.l('search.055'),
                    value: '0'
                },
                {
                    name: '最近一年'.l('search.056'),
                    value: '-1,y'
                },
                {
                    name: '最近半年'.l('search.057'),
                    value: '-6,M'
                },
                {
                    name: '最近一个月'.l('search.058'),
                    value: '-1,M'
                },
                {
                    name: '最近一周'.l('search.059'),
                    value: '-7,d'
                },
                {
                    name: '最近24小时'.l('search.060'),
                    value: '-24,h'
                }, // 这里应该为最近24小时，而不是最头一天
                {
                    name: '自定义'.l('search.061'),
                    value: '-1'
                }
                ],
                current: '0',
                start: '',
                end: '',
                minDate: new Date(1899, 12, 1),
                maxDate: new Date(),
                showRange: false
            };
            this.recoveryWords = [];
            this.hotKeywords = [];

            this.currentEntityType = 'all';

            function getEntityTypes() {
                if (self.request.resourceName == 'entity') {
                    if (nxt.config.filter.programeType) {
                        var types = _.get(nxt, 'config.entity.types', []);
                        var programeTypes = _.get(nxt, 'config.programeTypes', {});
                        var all = []
                        _.forEach(types, function (x) {
                            if (programeTypes[x.code] == null) {
                                all.push(x)
                            } else {
                                _.forEach(programeTypes[x.code], function (y) {
                                    all.push({ code: y.key, name: y.value, parent: x.code })
                                })
                            }
                        })
                        self.entityTypes = all
                    } else {
                        self.entityTypes = _.get(nxt, 'config.entity.types', []);
                        self.entityTypes = self.entityTypes.filter(item => {
                            return item.enableSearchTab
                        })
                    }
                } else {
                    self.entityTypes = _.get(nxt, 'config.catalogueLayerTypes', []);
                }
            }

            function getPictureCount(result) {
                var ids = _.map(_.filter(_.get(result, 'data', []), {
                    type: 'picture'
                }), 'contentId');
                if (ids.length > 0) {
                    $timeout(function () {
                        $http.post('~/search/get-picture-count', ids, {
                            showLoader: false
                        }).then(function (res) {
                            if (res.data != null) {
                                _.forEach(self.result.data, function (item) {
                                    if (res.data[item.contentId]) {
                                        item.pictureCount = res.data[item.contentId];
                                    }
                                });
                            }
                        });
                    }, 1500);
                }
            }

            function getHotKeyword() {
                $http.get('~/search/hot/keyword?top=6').then(function (res) {
                    if (res.data && res.data.length > 0) {
                        self.hotKeywords = res.data;
                    }
                });
            }

            function keywordCheck() {
                // todo:需要增加判断，是否有特殊字符
                return true;
            }

            function setCondition(field, value, query) {
                _.remove(self.request.conditions, { 'field': field });
                if (value != null) {
                    self.request.conditions.push({ field: field, value: value });
                }
                if (query !== false) {
                    self.query();
                }
            }

            this.entityTypeFilter = function (item) {
                setCondition('type_', null, false);
                setCondition('programe', null, false);
                if (self.currentEntityType == 'all') {
                    self.query();
                } else {
                    setCondition(item.parent == null ? 'type_' : 'programe', [self.currentEntityType]);
                }
            };

            this.refresh = function () {
                self.query();
            };

            this.keywordQuery = function (type, e) {
                if (type != null) {
                    if (self.request.resourceName != type) {
                        self.currentEntityType = 'all';
                        self.request.resourceName = type;
                    }
                }
                if (e != null) {
                    var keyCode = window.event ? e.keyCode : e.which;
                    if (keyCode != 13) {
                        return;
                    }
                }
                var keywords = self.request.keyword;
                _.remove(keywords, function (item) {
                    return item == null || item.length == 0;
                });
                // //主搜索框是否为空
                // var condition1 = keywords[0] || keywords[0] == '';
                // //二次检索框是否不为空
                // var condition2 = keywords[1] != null && keywords[1] != '';
                // if (condition1 && condition2) {
                //     keywords[0] = keywords[1];
                //     keywords.length--;
                // } else if (!condition2 && keywords.length > 1) {
                //     keywords.pop();
                // }
                if (keywordCheck(keywords)) {
                    self.request.keyword = keywords;
                    self.query();
                }
            };

            this.showRangeDatepicker = function (item) {
                if (item == 0) {
                    $('#start').datetimepicker('show');
                    $('#end').datetimepicker('hide');
                } else {
                    $('#end').datetimepicker('show');
                    $('#start').datetimepicker('hide');
                }
            }

            this.dateRangeQuery = function () {
                var start = self.time.start;
                var end = self.time.end;
                if (start) {
                    start = new Date(start).format('yyyy-MM-dd') + ' 00:00:00';
                } else {
                    return mam.message.error('起始时间不能为空！'.l('search.062'));
                }
                if (end) {
                    end = new Date(end).format('yyyy-MM-dd') + ' 23:59:59';
                } else {
                    return mam.message.error('结束时间不能为空！'.l('search.063'));
                }
                if (Date.parse(new Date(start)) - Date.parse(new Date(end)) > 0) {
                    return mam.message.error('起始时间不能大于结束时间！'.l('search.064'));
                }
                setCondition('createDate_', ['[' + start + ' TO ' + end + ']']);
            };

            this.changeMode = function (mode) {
                self.viewMode = mode;
                localStorage.setItem('search_view_mode', mode);
            };

            this.changePageSize = function () {
                localStorage.setItem('search_page_size', self.request.size);
                self.query();
            };

            this.changeTime = function () {
                var val = self.time.current;
                if (val == '-1') {
                    $scope.search.time.showRange = true;
                    return;
                }
                $scope.search.time.showRange = false;
                if (val == '0') {
                    setCondition('createDate_', null);
                    return;
                }
                var number = val.split(',')[0];
                var unit = val.split(',')[1];
                var start = moment().add(number, unit);
                var end = moment();
                if (unit == 'h') {
                    start = start.format('YYYY-MM-DD HH:mm:ss');
                    end = end.format('YYYY-MM-DD HH:mm:ss');
                } else {
                    start = start.format('YYYY-MM-DD') + ' 00:00:00';
                    end = end.format('YYYY-MM-DD') + ' 23:59:59';
                }
                setCondition('createDate_', ['[' + start + ' TO ' + end + ']']);
            };

            this.changeSort = function () {
                localStorage.setItem('search_sort_current', JSON.stringify(self.sort.current));
                self.query();
            };

            this.pageChanged = function (index) {
                if (index == null) {
                    index = self.request.page;
                }
                index = _.toInteger(index);
                if (index < 1) {
                    index = 1;
                }
                if (index > self.result.pageTotal) {
                    index = self.result.pageTotal;
                }
                self.request.page = index;
                self.query();
            };

            // todo：不应该用方法，而是在检索后已添加属性的方式实现。
            this.getBarcodes = function (item) {
                return (item.barcodes && item.barcodes.length > 0) ? item.barcodes.join(',') : '未在介质'.l('search.065');
            };

            this.query = function () {
                self.loaded = false;
                self.error = false;
                self.isEmptyData = false;
                $('.mam-back-top').click();

                self.request.sortBys = [{
                    fieldName: self.sort.current.field,
                    isDesc: self.sort.current.desc
                }];
                getEntityTypes();
                if (self.currentEntityType == 'all') {
                    setCondition('type_', null, false);
                    setCondition('programe', null, false);
                }

                // 针对zb的特殊的search地址
                let searchUrl = ''
                if (nxt.config.theme.name === 'zb') {
                    searchUrl = '~/search/fullSearch/zb'
                } else {
                    searchUrl = '~/search/full-search'
                }
                // 发版本的时候注释这句话
                // searchUrl = '~/search/full-search'
                var searchReq = angular.copy(self.request);
                if (searchReq.keywords && searchReq.keywords.length > 0)//删除keywords并赋值给keyword
                {
                    _.forEach(searchReq.keywords, function (item) {
                        searchReq.keyword.push(item);
                    });
                    delete searchReq.keywords;
                }
                return $http.post(searchUrl, searchReq, {
                    errorHandle: false
                }).then(function (res) {
                    _.forEach(res.data.queryResult.data, function (item) {
                        item.nameText = mam.utils.removeHtmlTag(item.name);
                        if (item.description != null) {
                            item.description = mam.utils.removeHtmlTag(item.description);
                        }
                    });
                    self.result = res.data.queryResult;
                    if (res.data.sameMeaningList) {
                        self.recoveryWords = res.data.sameMeaningList;
                    }
                    $scope.facet.init(res.data.facets);

                    getPictureCount(res.data.queryResult);
                }, function () {
                    $scope.facet.items = [];
                    self.error = true;
                    mam.message.error('检索失败，请稍后再试！'.l('search.066'));
                }).finally(function () {
                    self.loaded = true;
                    self.isEmptyData = self.result == null || self.result.data == null || self.result.data.length === 0;
                });
            };

            this.getUrlParams = function () {
                var p = $state.params;
                self.request = {
                    resourceName: p.resourceName,
                    page: p.page,
                    size: p.size,
                    keyword: [],
                    keywords: [],
                    sortBys: [],
                    conditions: [],
                    advancedSearch: {},
                    highLight: true,
                };
                // 获取类型
                var conditions = decodeURIComponent(p.facetvalues);
                if (conditions) {
                    try {
                        conditions = JSON.parse(conditions);
                        _.forEach(conditions, function (item) {
                            _.forEach(item.items, function (it) {
                                $scope.facet.selectItems.push({
                                    field: item.field,
                                    name: item.field,
                                    values: [
                                        {
                                            showValue: it.field,
                                            value: it.value
                                        }
                                    ]
                                });

                                self.request.conditions.push({
                                    field: it.field,
                                    value: it.value
                                });
                            });
                            if (item.field == 'type_' || item.field == 'programe') {
                                self.currentEntityType = item.values[0].value;
                            }
                            if ($scope.facet.excludes.indexOf(item.field) == -1) {
                                $scope.facet.selectItems.push(item);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                // 获取高级搜索
                var advancedSearch = decodeURIComponent(p.advancedSearch);
                if (advancedSearch) {
                    try {
                        advancedSearch = JSON.parse(advancedSearch);
                    } catch (e) {
                        console.error(e);
                        advancedSearch = [];
                    }
                    self.defaultSeniorValue = advancedSearch;
                    self.request.advancedSearch = advancedSearch;
                }
                getEntityTypes();
                // 获取排序
                var localSortConfig;
                try {
                    localSortConfig = JSON.parse(localStorage.getItem('search_sort_current'));
                } catch (error) {
                    console.info(error);
                }
                if (localSortConfig && _.find(self.sort.items, { field: localSortConfig.field, desc: localSortConfig.desc })) {
                    self.sort.current = localSortConfig;
                }
                // 获取关键词
                var keyword = decodeURIComponent(p.keyword);
                if (keyword) {
                    keyword = JSON.parse(keyword)
                    _.forEach(keyword, function (item) {
                        self.request.keyword.push(item)
                    })
                } else {
                }
                //获取关键词数组
                if (p.keywords) {
                    var keywords = decodeURIComponent(p.keywords);
                    keywords = JSON.parse(keywords);
                    _.forEach(keywords, function (item) {
                        self.request.keywords.push(item)
                    })
                }
                //获取分类
                var type = p.entityType;
                if (type) {
                    setCondition('type_', [type], false);
                    self.currentEntityType = type;
                }
            }

            this.onImageSearch = function (keywords) {
                self.request.keyword = [keywords];
                self.keywordQuery('entity')
            }

            function setCustomStyle(css) {
                var style_node = document.createElement("STYLE");
                style_node.type = "text/css";
                if (style_node.styleSheet) {
                    //ie下
                    style_node.styleSheet.cssText = css;
                } else {
                    style_node.innerHTML = css;
                }
                document.getElementsByTagName("head")[0].appendChild(style_node);
            }

            function init() {

                self.getUrlParams()
                setCustomStyle(nxt.config.customCss);
                self.query().then(function () {
                    if (nxt.config.searchBase.subfunctions.hotKeywordEnable)
                        getHotKeyword();
                });
            }

            // $scope.$on('$viewContentLoaded', function(){
            //     debugger
            //     $('.table-wrap').html(nxt.config.searchTableTemplate);
            // });

            init();
        }

        // 高级检索相关
        function Senior() {
            var self = this;
            this.fields = [];

            this.query = function (obj) {
                _.remove($scope.search.request.conditions, function (item) {
                    return item.field != 'type_';
                });
                $scope.facet.selectItems = [];//清空层面已选择项
                $scope.search.request.advancedSearch = obj;
                $scope.search.query();
            };
        }

        // 层面相关
        function Facet() {
            var self = this;
            this.excludes = ['type_', 'createDate_'];
            this.items = [];
            this.selectItems = [];
            this.current = null; // 当前显示了层面面板的 层面

            function handle(facets) {
                var res = facets;
                var isShow = nxt.config.searchBase.facetOpenType == 1;
                var localConfig;
                try {
                    localConfig = JSON.parse(localStorage.getItem('search_facet_open')) || {};
                } catch (error) {
                    localConfig = {};
                }
                _.forEach(facets, function (item) {
                    if (localConfig[item.facetFieldName] != undefined) {
                        item.showSection = localConfig[item.facetFieldName]
                    }
                    else {
                        item.showSection = isShow;
                    }
                });
                // url地址传过来的参数中 获取选中的值
                return res;
            }

            this.showSection = function (item) {
                item.showSection = !item.showSection;
                var localConfig;
                try {
                    localConfig = JSON.parse(localStorage.getItem('search_facet_open')) || {};
                } catch (error) {
                    localConfig = {};
                }
                localConfig[item.facetFieldName] = item.showSection;
                localStorage.setItem('search_facet_open', JSON.stringify(localConfig));
            }

            this.init = function (facets) {
                self.items = handle(facets);
            };

            this.select = function (item, valObjs) {
                _.remove(self.selectItems, { field: item.facetFieldName });
                self.selectItems.push({
                    field: item.facetFieldName,
                    name: item.facetShowName,
                    values: _.isArray(valObjs) ? valObjs : [valObjs]
                });
                _.remove($scope.search.request.conditions, { field: item.facetFieldName });
                $scope.search.request.conditions.push({
                    field: item.facetFieldName,
                    value: _.isArray(valObjs) ? _.map(valObjs, 'value') : [valObjs.value]
                });
                $scope.search.query();
            };

            this.multipleSelect = function (item, val, $event) {
                $event.stopPropagation();
                var valObj = _.find(item.facetValue, { 'value': val });
                if (valObj != null) {
                    valObj.selected = !valObj.selected;
                }
            };

            this.submitMultipleSelect = function () {
                var values = _.filter(self.current.facetValue, { 'selected': true });
                self.select(self.current, values);
            };

            this.remove = function (field, value) {
                var facet = _.find(self.selectItems, { field: field });
                if (facet != null) {
                    if (_.isArray(facet.values)) {
                        _.remove(facet.values, { 'value': value });
                        if (facet.values.length == 0) {
                            _.remove(self.selectItems, facet);
                        }
                    }
                }
                var condition = _.find($scope.search.request.conditions, { field: field });
                if (condition != null) {
                    if (_.isArray(condition.value)) {
                        if (condition.value.length <= 1) {
                            _.remove($scope.search.request.conditions, { field: field });
                        } else {
                            condition.value.remove(value);
                        }
                        $scope.search.query();
                    }
                }
            };

            this.clear = function () {
                self.selectItems = [];
                _.remove($scope.search.request.conditions, function (item) {
                    return self.excludes.indexOf(item.field) == -1;
                });
                $scope.search.query();
            };

            this.showPanel = function (item) {
                self.current = item;
            };

            this.hidePanel = function () {
                if (self.current != null) {
                    _.forEach(self.current.facetValue, function (val) { val.selected = false; });
                }
                self.current = null;
            };

        }

        // 素材操作相关
        function Operate() {
            var self = this;
            var isDeleting = false;

            // 获取勾选的素材
            this.getSelectedItems = function () {
                if ($scope.search.result == null || $scope.search.result.data == null) {
                    return [];
                }
                return _.filter($scope.search.result.data, { selected: true });
            };

            // 取消对素材的勾选
            this.cancelSelect = function () {
                _.forEach($scope.search.result.data, function (item) {
                    if (item.selected) {
                        item.selected = false;
                    }
                });
            };

            // 按钮是否禁用
            this.isDisabledByBtnName = function (name) {
                switch (name) {
                    case '编目'.l('com.catalog'):
                        return !self.getSelectedItems().length >= 1;
                    case '下载'.l('com.download'): // 可选多个
                        return _.filter(self.getSelectedItems(), function (n) {
                            return n.type != 'dataset';
                        }).length === 0;
                    case '收藏'.l('com.store'):
                        return self.getSelectedItems().length === 0;
                    case '分享'.l('com.share'):
                        return _.filter(self.getSelectedItems(), function (n) {
                            return n.type != 'dataset';
                        }).length === 0;
                    case '删除'.l('com.del'):
                        return self.getSelectedItems().length === 0 || isDeleting;
                    case '挑选'.l('search.021'):
                        return self.getSelectedItems().length === 0;
                    case '内容发布'.l('search.067'):
                        return self.getSelectedItems().length === 0;
                    case '归档'.l('search.068'):
                        var items = self.getSelectedItems();
                        return items.length === 0 || _.filter(items, function (o) {
                            return self.isArchiveStatus(o);
                        }).length === 0;
                    case '回迁'.l('search.069'):
                        var items = self.getSelectedItems();
                        return items.length === 0 || _.filter(items, function (o) {
                            return self.isRestoreStatus(o);
                        }).length === 0;
                    case '复制素材到用户个人'.l('search.070'):
                        return self.getSelectedItems().length === 0;
                    default:
                        return true;
                }
            };

            // 归档状态，此状态应该在检索后进行处理，而不是一个方法，每次调用
            this.isArchiveStatus = function (item) {
                return item.archiveList && item.archiveList.length > 0 && _.find(item.archiveList, function (o) {
                    return o === 'HDD';
                }) !== undefined;
            };

            // 是否为需回迁状态，此状态应该在检索后进行处理，而不是一个方法，每次调用
            this.isRestoreStatus = function (item) {
                return item.archiveList && item.archiveList.length > 0 &&
                    _.find(item.archiveList, function (o) { return o === 'HDD'; }) === undefined &&
                    _.find(item.archiveList, function (o) { return o !== 'HDD'; }) !== undefined;
            };

            // 是否显示归档制S3素材
            this.isOssState = function (item) {
                return item.archiveList && item.archiveList.length > 0 && _.find(item.archiveList, function (o) {
                    return o === 'OSS';
                }) !== undefined;
            };

            // 下载
            this.download = function (contentId) {
                var contentIds = [];
                if (contentId) {
                    contentIds.push(contentId);
                } else {
                    var items = self.getSelectedItems();
                    if (items.length > 0) {
                        angular.forEach(items, function (data) {
                            contentIds.push(data.contentId_);
                        });
                    }
                }
                downloadService.download(contentIds);
            };

            // 收藏
            this.favorite = function () {
                var items = self.getSelectedItems();
                var contentIds = [];
                if (items.length > 0) {
                    angular.forEach(items, function (data) {
                        if (!data.isCollected && data.contentId_ != undefined && data.contentId_ != null) // 素材必须有唯一标识zxy
                            contentIds.push(data.contentId_);
                    });
                }
                if (contentIds.length === 0) {
                    mam.message.ok(l('search.71', '已收藏文件！'));
                    return;
                }
                favoriteService.favorite(false, contentIds).then(function () {
                    mam.message.ok(l('search.71', '已收藏文件！'));
                    angular.forEach(items, function (data) {
                        data.isCollected = true;
                    });
                });
            };

            // 收藏或取消收藏
            this.favoriteOrCancel = function (item) {
                if (!item.hasOwnProperty('contentId_') || item.contentId_ == null) {
                    mam.message.error('收藏的素材无唯一标识！'.l('search.072'));
                    return;
                }
                var data = {
                    favorite: item.isCollected,
                    contentIds: [item.contentId_]
                };
                $http.post('~/favorite/favorite', data, {
                    showLoader: false
                }).then(function (res) {
                    console.debug(res);
                    if (item.isCollected) {
                        mam.message.ok('已取消对 ' + item.nameText + ' 的收藏！'.l('search.073', {name: item.nameText}));
                    } else {
                        mam.message.ok('收藏 ' + item.nameText + ' 成功！'.l('search.074', {name: item.nameText}));
                    }
                    item.isCollected = !item.isCollected;
                });
            };

            // 发起编目任务
            this.createCatalogueTask = function () {
                var contentIds = _.map(self.getSelectedItems(), 'contentId_');
                var names = {};
                _.forEach(self.getSelectedItems(), function (item) {
                    names[item.contentId_] = item.name_;
                });
                $http.post('~/catalog/task/add', contentIds).then(function (res) {
                    if (res.data.length > 0) {
                        var datas = [];
                        _.forEach(res.data, function (item) {
                            var obj = {
                                'name': names[item.key],
                                'reason': item.value
                            };
                            datas.push(obj);
                        });
                        var opts = {
                            'title': '以下素材无法进行编目：'.l('search.075'),
                            'datas': datas
                        };
                        var errorInfos = {
                            'title': '编目提示'.l('search.076'),
                            'data': [opts]
                        };
                        mamService.confirmTable(errorInfos).then(function () {
                            var length = contentIds.length - res.data.length;
                            if (length > 0)
                                mam.message.ok('成功添加了' + length + '条素材'.l('search.077', {count: length}));
                        });
                    } else
                        mam.message.ok('成功添加了' + contentIds.length + '条素材'.l('search.077', {count: contentIds.length}));
                    self.cancelSelect();
                }, function (res) {
                    mam.message.error(res.error.title);
                });
            };

            // 分享
            this.share = function (contentId) {
                var contentIds = [];
                if (contentId) {
                    contentIds.push(contentId);
                } else {
                    var items = self.getSelectedItems();
                    if (items.length > 0) {
                        angular.forEach(items, function (data) {
                            contentIds.push(data.contentId_);
                        });
                    }
                }
                shareService.share(contentIds, ['2'], 'mams');
                self.cancelSelect();
            };

            // 出库
            this.outstore = function (item) {
                var contentIds = [];
                if (item == null || item == '') {
                    contentIds = _.map(self.getSelectedItems(), 'contentId_');
                } else {
                    contentIds = [item.contentId_];
                }

                if ($scope.search.request.resourceName === 'entity') {
                    mamService.outstore(contentIds);
                } else if ($scope.search.request.resourceName === 'do_catalogue') {
                    if (item == null || item == '') {
                        var clips = self.getSelectedItems();
                        mamService.outstore(contentIds, clips);
                    } else {
                        mamService.outstore(contentIds, [item]);
                    }
                }
            };

            // [萧山云定制]创建选题任务 zhanghui@sobey.com[QQ310213220] add at 2017-03-09
            this.newTask = function () {
                var selectedEntity = self.getSelectedItems();
                if (selectedEntity.length > 0) {
                    if (selectedEntity.length > 10) {
                        mam.message.error('最多只能选择10条数据！'.l('search.078'));
                        return;
                    }
                    mamService.newTask(selectedEntity, nxt.user.current);
                }
            };
            this.redactZB = function ($event, contentId, site, catalogstate) {
                // 是zb的部门文秘角色
                if ($scope.isSecretary && (nxt.config.theme.name === 'zb')) {
                    mam.message.error('权限不足，无法浏览！'.l('search.079'));
                    $event.preventDefault();
                    return false;
                }
            }

            this.redact = function (contentId, site, catalogstate) {
                // zb
                if ($scope.isSecretary && (nxt.config.theme.name === 'zb')) {
                    mam.message.error('权限不足，无法浏览！'.l('search.079'));
                    return false;
                }
                if (catalogstate == '编目中') {
                    mam.message.ok('编目中，请稍后编辑！'.l('search.080'));
                    return false;
                }
                var urlPrefix = '/entity/#/edit/';
                if (nxt.config.theme.name === 'standard') {
                    urlPrefix = '/entity/#/main/';
                }
                if (contentId) {
                    var url = urlPrefix + contentId + '?queryAdress=' + site;
                    if ($scope.search.request.resourceName == 'do_catalogue') {
                        var item = _.find($scope.search.result.data, {
                            contentId_: contentId
                        });
                        url += '&opDetail=9&trimin=' + item.inpoint / 10000000 + '&trimout=' + item.outpoint / 10000000;
                    }
                    window.open(url);
                } else {
                    var items = self.getSelectedItems();
                    window.open(urlPrefix + items[0].contentId_ + '?queryAdress=' + items[0].site_);
                }
            };

            this.outputByExcel = function () {
                var data = self.getSelectedItems();
                if (data.length > 0) {
                    var contentIds = _.map(self.getSelectedItems(), 'contentId_');
                    $http.post('~/search/exportCsvForPart', contentIds).then(function (res) {
                        window.location.href = res.data;
                    });
                } else {
                    var size = nxt.config.searchBase.exportToExcelMaxLimit || 1000;
                    var req = angular.copy($scope.search.request);
                    req.page = 1;
                    req.size = size;
                    if ($scope.search.result.recordTotal < size) {
                        mam.confirm('<p>确定导出' + $scope.search.result.recordTotal + '条记录？</p>'.l('search.081', {total: $scope.search.result.recordTotal})).then(function () {
                            $http.post('~/search/exportCsvForAll', req).then(function (res) {
                                window.location.href = res.data;
                            }).finally(function () {
                                $scope.search.query();
                            });
                        });
                    } else {
                        require(['modal/export.js'], function () {
                            $uibModal.open({
                                templateUrl: 'modal/export.html',
                                controller: 'searchExportModalCtrl',
                                windowClass: 'modal-search-export',
                                resolve: {
                                    params: function () {
                                        return {
                                            req: req,
                                            recordTotal: $scope.search.result.recordTotal
                                        };
                                    }
                                }
                            }).result.then(function (e) { });
                        });
                    }
                }
            };


            // 删除素材
            this.delete = function (model) {
                isDeleting = true;
                var models = [];
                if (model == undefined) {
                    checkDeleteModel();
                    return;
                } else {
                    models.push(model);
                    if (model.type === 'dataset') {
                        checkDeleteDatasetModel(models).then(function (res) {
                            if (res.data != undefined && res.data.length > 0) {
                                mam.prompt('该资料集因包含素材不能删除'.l('search.082'));
                            } else {
                                mam.confirm('选中资料集将会彻底删除，您确定要删除选中项吗？'.l('search.083')).then(function () {
                                    deleteRequest(models);
                                });
                            }
                        }).finally(function () {
                            isDeleting = false;
                        });
                    } else {
                        mam.confirm('删除文件将会保存在回收站，您确定要删除选中项吗？'.l('search.084')).then(function () {
                        });
                        isDeleting = false;
                    }
                }
            };

            //归档到s3素材删除
            this.deleteFromOSS = function (item) {
                let contentId = item.contentId;
                mam.confirm('归档至OSS的素材文件，删除后无法恢复，您确定要删除？'.l('search.085')).then(function () {
                    $.ajax({
                        url: window.location.origin + '/search/delete-oss?contentid=' + contentId + '&token=' + nxt.user.current.userToken,
                        success: function (data) {
                            if (data) {
                                mam.message.ok('删除成功'.l('com.deleteSuccessful'));
                            } else {
                                mam.message.error('删除失败'.l('com.deleteFailure'))
                            }
                        },
                        error: function (data) {
                            if (data) {
                                mam.message.ok('删除成功'.l('com.deleteSuccess'));
                            } else {
                                mam.message.error('删除失败'.l('com.deleteFailed'))
                            }
                        }
                    })
                })
            }

            function deleteRequest(models) {
                var request = [];
                _.forEach(models, function (item) {
                    request.push({
                        contentId: item.contentId_,
                        name: item.name_,
                        type: item.type_,
                        treePath: item.tree_path_,
                        catalogState: item.catalogstate
                    });
                });
                $http.post('~/search/delete', request).then(function (res) {
                    if (res.data) {
                        setTimeout(function () {
                            if (res.data.successCount == request.length)
                                mam.message.ok('删除成功！'.l('com.deleteSuccessful'));
                            else {
                                var names = {};
                                _.forEach(request, function (item) {
                                    names[item.contentId] = item.name;
                                });
                                var datas = [];
                                _.forEach(res.data.errorList, function (item) {
                                    var obj = {
                                        'name': names[item.contentId],
                                        'reason': item.message
                                    };
                                    datas.push(obj);
                                });
                                var errorInfos = {
                                    'title': '删除提示'.l('search.086'),
                                    'data': [{
                                        'title': '以下素材无法删除：'.l('search.087'),
                                        'datas': datas
                                    }]
                                };
                                if (datas.length > 0)
                                    mamService.confirmTable(errorInfos).then(function () {
                                        if (res.data.successCount > 0)
                                            mam.message.ok('成功删除了' + res.data.successCount + '条素材'.l('search.088', {count: res.data.successCount}));
                                    });
                            }
                            $scope.params.page = 1;
                            $scope.search.query();
                            $scope.chooseBasket.query();
                        }, 700); // 延迟更新，避免hive索引还未更新
                    } else
                        mam.message.error('删除失败！'.l('com.deleteFailed'));
                }, function (res) {
                    mam.message.error('删除失败！'.l('com.deleteFailed'));
                    console.error(res);
                }).finally(function () {
                    isDeleting = false;
                });
            }

            function checkDeleteDatasetModel(models) {
                var datasets = [];
                if (models != undefined)
                    datasets = models;
                else
                    datasets = _.filter(self.getSelectedItems(), {
                        type: 'dataset'
                    });
                var req = _.map(datasets, function (m) {
                    return {
                        contentId: m.contentId_,
                        type: m.type,
                        name: m.name_
                    };
                });
                return $http.post('~/dataset/check-can-delete-dataset', req);
            }

            function getDeleteTip(models) {
                var haveEntity = _.find(models, function (o) {
                    return o.type !== 'dataset';
                }) != undefined;
                var haveDataset = _.find(models, {
                    type: 'dataset'
                }) != undefined;
                if (haveDataset && haveEntity) {
                    return {
                        tip: '将删除其他素材到回收站并彻底删除选中资料集'.l('search.089'),
                        type: 'all'
                    };
                }
                if (haveDataset && !haveEntity) {
                    return {
                        tip: '将彻底删除选中资料集'.l('search.090'),
                        type: 'd'
                    };
                }
                if (!haveDataset && haveEntity) {
                    return {
                        tip: '将删除其他素材到回收站'.l('search.091'),
                        type: 'e'
                    };
                }
                return {
                    tip: '删除文件会保存在回收站(资料集除外)'.l('search.092'),
                    type: 'default'
                };
            }

            function checkDeleteModel() {
                var model = _.filter(self.getSelectedItems(), function (o) {
                    return !o.permissionInfo.canDelete;
                });
                var questionDataset = [];
                checkDeleteDatasetModel().then(function (res) { // todo:这里必须进检查是否有不能删的资料集方法，不太好待改进
                    questionDataset = res.data;
                    _.forEach(res.data, function (d) {
                        if (_.find(model, { contentId_: d.contentId }) == undefined) {
                            model.push({
                                name_: d.name,
                                type: d.type,
                                permissionInfo: {
                                    canDelete: true
                                }
                            });
                        }
                    });
                }).finally(function () {
                    if (model.length > 0) {
                        if (model.length === self.getSelectedItems().length) {
                            mam.prompt('选中素材您都无法删除！'.l('search.093'));
                            isDeleting = false;
                        } else {
                            var entitys = '<div style=\'max-height:222px;overflow:auto;\'>';
                            _.forEach(model, function (item, i) {
                                var title = item.name_ + (item.type === 'dataset' && item.permissionInfo.canDelete ? '('+'包含素材的'.l('search.094')+mam.entity.getTypeByCode('dataset').name+')' : '(权限不足)'.l('search.095'));
                                entitys += '<div style=\'color: #464646;margin-left:6px;padding-top:10px;white-space: nowrap; text-overflow: ellipsis;overflow: hidden;' +
                                    '\' title=\'' + title + '\'>' + (i + 1) + '、' + title + '</div>';
                            });
                            entitys += '</div>';
                            var models = _.filter(self.getSelectedItems(), function (o) {
                                return o.permissionInfo.canDelete;
                            });
                            _.forEach(questionDataset, function (r) {
                                _.remove(models, { contentId_: r.contentId });
                            });
                            var tip1 = getDeleteTip(models);
                            mam.confirm(
                                '<p style=\'margin-bottom:10px\'>'+'下列素材您无法删除，点击继续将删除其他素材。'.l('search.096')+'</p>' + entitys, {
                                    btns: {
                                        ok: {
                                            text: '继续'
                                        }
                                    }
                                }
                            ).then(function () {
                                deleteRequest(models);
                            });
                        }
                    } else {
                        var hasCatalogItem = false;
                        var m = _.filter(self.getSelectedItems(), function (o) {
                            if (o.catalogstate == 10 || o.catalogstate == '编目中') {
                                hasCatalogItem = true;
                            }
                            return o.permissionInfo.canDelete;
                        });
                        if (hasCatalogItem) {
                            mam.message.error('编目中的素材不能删除！'.l('search.097'));
                            isDeleting = false;
                            return;
                        }
                        mam.confirm('素材被删除后将无法被使用，您确定要删除？'.l('search.098')).then(function () {
                            deleteRequest(m);
                        });
                    }
                    isDeleting = false;
                });
            }


            // 发起归档
            self.archive = function (item) {
                var items = [];
                let archivings = [];
                const allItems = self.getSelectedItems() || [];
                let check_items = []
                if (allItems.length > 0) {
                    check_items = _.map(allItems, function (o) {
                        return { 'contentid': o.contentId, 'EntityName': o.name }
                    })

                }
                $http.post('~/archivemanager/api/entity/CheckEntityArchived', check_items).then((res) => {
                    if (res.data.length > 0) {
                        archivings = res.data
                    }
                    if (!item) {
                        items = _.filter(self.getSelectedItems(), function (o) {
                            return self.isArchiveStatus(o);
                        });
                    } else {
                        if (!self.isArchiveStatus(item))
                            return '';
                        items = [item];
                    }
                    if (items.length === 0) {
                        return mam.message.info('请选择已存储素材'.l('search.099'));
                    }
                    if ($scope.search.request.resourceName === 'entity') {
                        var archived = _.filter(items, function (o) {
                            return o.barcodes && o.barcodes.length > 0;
                        });
                        if (archived.length > 0 || archivings.length > 0) {
                            var opts = {
                                'title': '以下素材已发起过归档，确定要再次归档吗？'.l('search.100')
                            };
                            opts.data = _.map(archived, function (o) {
                                return {
                                    name: o.name_,
                                    id: o.contentId_
                                };
                            });
                            let tempArchivings = _.map(archivings, function (o) {
                                return {
                                    name: o.entityName,
                                    id: o.contentID
                                };
                            });
                            opts.data = opts.data.concat(tempArchivings)
                            mamService.confirmList([opts]).then(function () {
                                archivedPost(items, archived); // 包含已归档方法
                            });
                        } else {
                            archivePost(items);
                        }
                    }
                }).catch((err) => {
                    console.error(err.error);
                });
            };

            function archivePost(items) {
                var contentIds = _.map(items, 'contentId_');
                $http.post('~/archivemanager/api/flow/manual-archive', {
                    'usercode': nxt.user.current.userCode,
                    'site': nxt.user.current.siteCode,
                    'contentids': contentIds,
                    'appPermission': nxt.user.current.appPermission
                }).then(function () {
                    mam.message.ok('发起归档成功'.l('search.101'));
                    $scope.search.refresh();
                }, function () {
                    mam.message.error('发起归档失败'.l('search.102'));
                });
            }

            function archivedPost(items, archived) {
                var saved = _.filter(items, function (o) {
                    return !o.barcodes || o.barcodes.length <= 0;
                });
                var archivedIds = _.map(archived, 'contentId_');
                $http.post('~/archivemanager/api/flow/manual-archive', {
                    'usercode': nxt.user.current.userCode,
                    'site': nxt.user.current.siteCode,
                    'contentids': archivedIds,
                    'appPermission': nxt.user.current.appPermission
                }).then(function () {
                    if (saved.length <= 0) {
                        mam.message.ok('发起归档成功'.l('search.101'));
                        $scope.search.refresh();
                    }
                }, function () {
                    mam.message.error('已归档素材发起归档失败'.l('search.103'));
                }).finally(function () {
                    if (saved.length > 0) {
                        archivePost(saved);
                    }
                });
            }

            // 发起回迁
            self.retrieve = function (item) {
                var items = [];
                if (!item) {
                    items = _.filter(self.getSelectedItems(), function (o) {
                        return self.isRestoreStatus(o);
                    });
                } else {
                    if (!self.isRestoreStatus(item))
                        return '';
                    items = [item];
                }
                if (items.length === 0) {
                    return mam.message.info('请选择已归档且离线的素材'.l('search.104'));
                }
                if ($scope.search.request.resourceName === 'entity') {
                    var archivedIds = _.map(items, 'contentId_');
                    $http.post('~/megateway/api/entity/restore', {
                        'userCode': nxt.user.current.userCode,
                        'siteCode': nxt.user.current.siteCode,
                        'listContent': archivedIds
                    }).then(function () {
                        mam.message.ok('发起回迁成功'.l('search.101'));
                        $scope.search.refresh();
                    }, function () {
                        mam.message.error('发起回迁失败'.l('search.102'));
                    });
                }
            }
        }

        // 检索模板
        function Template() {
            // 未改造
        }
        // 挑选篮
        function ChooseBasket() {
            var self = this;
            this.total = 0;

            this.add = function () {
                var items = $scope.operate.getSelectedItems();
                if (items.length === 0) {
                    return false;
                }
                var chooseModels = [];
                var datasetModel = [];
                var modelNames = {};
                _.forEach(items, function (item) {
                    if (item.type !== 'dataset')
                        chooseModels.push({
                            'relateId': item.contentId_,
                            'entityType': item.type,
                            'desc': ''
                        });
                    else {
                        datasetModel.push(item);
                    }
                    modelNames[item.contentId_] = item.name_;
                });
                if (datasetModel.length > 0 && chooseModels.length > 0) {
                    var opts = {
                        'title': '以下素材为资料集，无法添加到挑选篮。'.l('search.105'),
                        'reason': '(资料集)'.l('search.106')
                    };
                    opts.data = _.map(datasetModel, function (o) {
                        return {
                            name: o.name_,
                            id: o.id
                        };
                    });
                    mamService.confirmList([opts]).then(function () {
                        addInner(chooseModels, items);
                    });
                } else if (chooseModels.length == 0) {
                    $scope.operate.cancelSelect();
                    mam.prompt('您选中素材均为资料集，无法添加到挑选篮！'.l('search.107'));
                } else {
                    addInner(chooseModels, items, modelNames);
                }
            };

            this.show = function () {
                chooseBasketService.chooseBasket(query).then(function () {
                    query();
                });
            };

            function addInner(chooseModels, selectItem, modelNames) {
                if (chooseModels.length > 0) {
                    chooseBasketService.addChoose(chooseModels).then(function (res) {
                        if (modelNames != null && res.data.length == chooseModels.length) {
                            mam.message.info(' 素材已存在'.l('search.108'));
                        } else {
                            mam.message.ok(' 添加成功'.l('com.addSuccess'));
                        }
                        $scope.operate.cancelSelect();
                        query();
                    });
                }
            }

            function query() {
                $http.post('~/search_pickedup/query', { pageSize: 1, pageIndex: 1 }, { errorHandle: false }).then(function (res) {
                    self.total = res.data.recordTotal;
                }, function () {
                    mam.message.error('获取挑选列表出现错误。'.l('search.109'));
                });
            }
            //外部使用
            this.query = query;

            $timeout(function () { query(); }, 4000);
        }

        function Other() {
            var self = this;
            self.hideHeader = mam.utils.getUrlQueryParam('hideHeader') == 1;
        }

        $interval(function () { $http.get('~/user/beat', { errorHandle: false }); }, 1000 * 60 * 10);
    };
    searchController.$inject = ['$rootScope', '$scope', '$http', '$location', '$state', '$timeout', '$interval', '$uibModal', '$compile', 'downloadService', 'mamService', 'chooseBasketService', 'favoriteService', 'shareService'];
    return searchController;
});

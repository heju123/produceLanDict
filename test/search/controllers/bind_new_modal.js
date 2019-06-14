define(['datetimepicker'], function () {

    var bindNewModalController = function ($scope, $uibModal, $uibModalInstance, $http, url, entityName, params, callback, timeCode, frameRate, isCloseBindProgramCode) {
        $scope.lists = [];
        $scope.tableList = [];
        $scope.index = '';
        //定义一个变量来切换绑定和解绑按钮
        $scope.bind = '';
        //定义一个变量来存节目代码的一条数据
        $scope.listdata = null;
        function getLm() {
            $http.get("~/programcode/get-column").then(function (res) {
                if (res.status == 200) {
                    $scope.lists = angular.fromJson(res.data);

                } else {
                }
            })
        }
        getLm();
        $scope.value = "";
        $scope.programCode = "";
        $scope.isCloseBindProgramCode = isCloseBindProgramCode;
        $scope.close = function () {
            $uibModalInstance.close(true);
        }
        // $scope.confirm = function (flag) { 
        //     console.log('$scope.value',$scope.value);
        // }
        $scope.$watch('value', function (newValue, oldValue) {
            if (newValue != oldValue) {
                $scope.value = newValue;
                params.requestTime = newValue;
            }
        })
        $scope.lookFor = function () {
            if (!$scope.programCode) {
                mam.message.error(l('bindNewModal.plzSelectColumn', '请选择栏目！'));
                return;
            }
            params.columnCode = $scope.programCode;
            $http.post("~/programcode/get", params, {
                timeout: 300000,
            }).then(function (res) {
                if (res.status == 200) {
                    $scope.tableList = angular.fromJson(res.data);
                    console.log('$scope.tableList', $scope.tableList);
                } else {

                }
            })
        }
        $scope.selectItem = function (listdata, $index) {
            var { LockUser } = listdata;
            $scope.bind = LockUser.length == 0 ? true : false;
            $scope.index = $index;
            $scope.listdata = listdata;
        }
        //绑定解绑
        $scope.confirm = function (bind, listdata) {
            var ProgramLength = listdata.ProgramLength;
            var obj = { ...params };

            // 将节目时间格式进行转换
            String.prototype.replaceAll = function (f, e) {//吧f替换成e
                var reg = new RegExp(f, "g"); //创建正则RegExp对象   
                return this.replace(reg, e);
            }
            var ProgramLengths = ProgramLength.replaceAll('\\.', ':');
            var timeCodes = timeCode.replaceAll("\\.", ":");
            if (bind == true) {

                //convert 2 seconds for compare
                var programLengthsSec = TimeCodeConvert.frame2Second(TimeCodeConvert.timeCode2Frame(ProgramLengths, frameRate || 25));
                var timeCodesSec = TimeCodeConvert.frame2Second(TimeCodeConvert.timeCode2Frame(timeCodes, frameRate || 25));
                //素材时长不能比节目代码短，可以长5秒
                if (timeCodesSec >= programLengthsSec && timeCodesSec - programLengthsSec <= 5) {
                    require(['/modal/bind_modal.js'], function () {
                        $uibModal.open({
                            templateUrl: '/modal/bind-modal.html',
                            controller: 'bindModalController',
                            windowClass: 'bind-modal-outstore',
                            resolve: {
                                bind: function () {
                                    return bind;
                                },
                                submit_data: function () {
                                    return obj;
                                },
                                ProgramCode: function () {
                                    return listdata.ProgramCode;
                                },
                                entityName: function () {
                                    return entityName;
                                },
                                callback: function () {
                                    return callback;
                                }
                            }
                        }).result.then(function (e) {

                            $scope.close();
                        });

                    });
                }
                else {
                    mam.message.info("与素材时长不一致，绑定失败");
                }
            } else {

                require(['/modal/bind_modal.js'], function () {
                    $uibModal.open({
                        templateUrl: '/modal/bind-modal.html',
                        controller: 'bindModalController',
                        windowClass: 'bind-modal-outstore',
                        resolve: {
                            bind: function () {
                                return bind;
                            },
                            submit_data: function () {
                                return obj;
                            },
                            ProgramCode: function () {
                                return listdata.ProgramCode;
                            },
                            entityName: function () {
                                return entityName;
                            },
                            callback: function () {
                                return callback;
                            }
                        }
                    }).result.then(function (e) {

                        $scope.close();
                    });

                });

            }

        };

        $scope.ok = function(bind, listdata){
            callback(params.contentId, listdata.ProgramCode);
            $scope.close();
        };
    }
    nxt.app.registerController("bindNewModalController", bindNewModalController);
});

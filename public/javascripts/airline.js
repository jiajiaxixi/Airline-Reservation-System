var app = angular.module('Airline', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'templates/index.html',
            controller: 'indexController'
        })

        .when('/register', {
        	templateUrl: 'templates/register.html',
        	controller: 'registerController'
        })
        .when('/login', {
        	templateUrl: 'templates/login.html',
        	controller: 'loginController'
        })
		.when('/flights', {
            templateUrl: 'templates/flights.html',
            controller: 'showFlightsController'
		})
		.when('/flights/form', {
            templateUrl: 'templates/flight-form.html',
            controller: 'addFlightController'
		})
		.when('/flights/edit/:id', {
            templateUrl: 'templates/flight-edit.html',
            controller: 'editFlightController'
		})
		.when('/flights/delete/:id', {
            templateUrl: 'templates/flight-delete.html',
            controller: 'deleteFlightController'
		})
        .when('/search', {
            templateUrl: 'templates/search.html',
            controller: 'searchController'
        })
        .when('/reservations', {
            templateUrl: 'templates/reservations.html',
            controller: 'showReservationController'
        })
        .when('/reservations/:username', {
            templateUrl: 'templates/reservations.html',
            controller: 'showUserReservationController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('indexController',['$location','$scope',
    function($location, $scope) {
        if (sessionStorage.getItem('user') != null) {
            $scope.signout = true;
            $scope.accountHref = '#/reserves/' + sessionStorage.getItem('user');
            $scope.loginName = 'Welcome! ' + sessionStorage.getItem('user');
            if (sessionStorage.getItem('auth') == 0) {
                $scope.admin = true;
                $scope.accountHref = '#/reserves';
            }
        } else {
            $scope.signout = false;
            $scope.accountHref = '/#/login';
            $scope.loginName = 'Log In';
        }
        $scope.signOut = function () {
            sessionStorage.clear();
            location.reload();
        }
    }]);

app.controller('registerController', ['$scope', '$resource', '$location',
    function($scope, $resource) {
        if (sessionStorage.getItem('user') != null) {
            self.location = '#/';
            return ;
        }

        $scope.usernameValidation = function() {
            const reg = /^[0-9a-zA-Z]+$/;
            const usedUsername = $resource('users/username/:username');
            let available = false;

            usedUsername.get({username: $scope.username}, function(user) {
                if (user.existed) {
                    available = false;
                } else {
                    available = true;
                }
                if (reg.test($scope.username) && available){
                    $scope.usernameMessage = false
                } else {
                    $scope.usernameMessage = true
                }
            });
        };

        $scope.passwordValidation = function() {
            const reg = /^[0-9a-zA-Z]{6,}$/;
            if (reg.test($scope.password)){
                $scope.passwordMessage = false
            } else {
                $scope.passwordMessage = true
            }
        };

        $scope.emailValidation = function() {
            const reg = /^[0-9a-zA-Z]+@[0-9a-zA-Z]+\.[0-9a-zA-Z]{3}$/;
            if (reg.test($scope.email)){
                $scope.emailMessage = false
            } else {
                $scope.emailMessage = true
            }
        };

        $scope.phoneValidation = function() {
            const reg = /^[0-9]{10}$/;
            if (reg.test($scope.phone)){
                $scope.phoneMessage = false
            } else {
                $scope.phoneMessage = true
            }
        };

        $scope.registerUser = function () {
            if (!($scope.username == null || $scope.password == null
                || $scope.email == null || $scope.usernameMessage
                || $scope.passwordMessage || $scope.emailMessage)) {
                const registerUser = $resource('/users');
                registerUser.save({
                    username: $scope.username,
                    password: $scope.password,
                    email: $scope.email,
                    fullname: $scope.fullname,
                    address: $scope.address,
                    phone: $scope.phone,
                    auth: 1
                }, function (user) {
                    if (user._id != null){
                        window.alert('Register successful');
                        self.location = '#/login';
                    }
                });
            }
        }

        $scope.back = function () {
            self.location = '#/login';
        }
    }]);

app.controller('loginController',['$location', '$scope', '$resource',
    function($location, $scope, $resource) {
        if (sessionStorage.getItem('user') != null) {
            self.location = '#/';
            return;
        }

        $scope.loginUser = function() {
            const userSignIn = $resource('/users/signIn');
            userSignIn.save({username: $scope.username, password: $scope.password}, function(response) {
                if (response.status) {
                    sessionStorage.setItem('user', $scope.username);
                    sessionStorage.setItem('auth', response.auth);
                    self.location='#/';
                } else {
                    $scope.failureLogin = true;
                }
            });
        };

        $scope.register = function() {
            self.location = '#/register';
        };
    }]);

app.controller('showFlightsController',
    function($scope, $resource, $location){
        if(sessionStorage.getItem('auth') != 0){
            $location.path('/');
            return;
        }
        const Rooms = $resource('/flights', {});
        Rooms.query(function(flights){
            $scope.flights = flights;
        });
    });

app.controller('addFlightController', ['$scope', '$resource', '$location',
    function($scope, $resource, $location) {
        if(sessionStorage.getItem('auth') != 0) {
            $location.path('/');
            return;
        }
        $scope.save = function() {
            const Flight = $resource('/flights');
            Flight.save($scope.flight, function() {
                $location.path('/flights');
            });
        };
    }]);

app.controller('editFlightController', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
        if(sessionStorage.getItem('auth') != 0) {
            $location.path('/');
            return;
        }
        const Flights = $resource('/flights/:id', {id: '@_id'}, {
            update: {method: 'PUT'}
        });

        Flights.get({id: $routeParams.id}, function(flight) {
            $scope.flight = flight;
        });

        $scope.save = function(){
            Flights.update($scope.flight, function() {
                $location.path('/flights');
            });
        }
    }]);

app.controller('deleteFlightController', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams){
        if(sessionStorage.getItem('auth') != 0){
            $location.path('/')
        }

        const Flights = $resource('/flights/:id');

        Flights.get({id: $routeParams.id}, function(flight) {
            $scope.flight = flight;
        });

        $scope.delete = function() {
            Flights.delete({id: $routeParams.id}, function(status) {
                $location.path('/flights');
            });
        }
    }]);

app.controller('searchController',['$location','$scope','$resource','$filter',
    function($location, $scope,$resource,$filter) {
        if(sessionStorage.getItem('user') == null) {
            window.alert("Log In Please!")
            $location.path('/login');
        }

        $scope.st=new Date();
        $scope.et=new Date();
        var Type = $resource('/rooms/type', {});
        Type.query(function(roomType){
            $scope.allType = roomType;
            $scope.allType.push("Any");
            $scope.selectedType=$scope.allType[$scope.allType.length-1];
            console.log($scope.selectedType)
        });

        // $scope.selectedCapacity=[{type:"Any"}];  //for load capacity in db, but not needed
        // var Rooms = $resource('/rooms/capacity', {});
        // Rooms.query(function(roomCapacity){
        //     $scope.allCapacity = roomCapacity;
        // });
        //para: numberOfPeople  startDate endDate roomType
        var roomList;
        $scope.searchRooms=function()
        {
            console.log($scope.selectedType);
            var roomType=$scope.selectedType;
            console.log($scope.numberOfPeople==undefined);
            var peopleNumber=$scope.numberOfPeople==undefined?'':$scope.numberOfPeople;
            console.log(peopleNumber);
            var start=$filter("date")($scope.startDate.valueOf(), "MM/dd/yyyy");
            var end=$filter("date")($scope.endDate.valueOf(), "MM/dd/yyyy");
            var Rooms=$resource('/rooms/search');
            var priceSum = 0;

            Rooms.save({},{roomType:roomType,peopleNumber:peopleNumber,start:start,end:end},function(result){
                roomList=result.result;
                if(roomList.length==0)
                {
                    $scope.suggestion='Sorry, we can\'t find a plan for you for now. Try Any to find more available rooms!';
                    $scope.suggestionMessage=true;
                    $scope.orderPanel = false;
                    $scope.rooms = [];
                }
                else
                {
                    $scope.suggestionMessage=false;
                    $scope.orderPanel = true;
                    $scope.rooms=roomList;
                }
                for ( var i = 0; i <roomList.length; i++) {
                    console.log(priceSum);
                    priceSum += parseInt(roomList[i].price);
                }
                $scope.priceSum = priceSum;
                $scope.priceSumTotal = priceSum*result.diffDay;
            });

        }

        $scope.checkOut = function () {
            var start=$filter("date")($scope.startDate.valueOf(), "MM/dd/yyyy");
            var end=$filter("date")($scope.endDate.valueOf(), "MM/dd/yyyy");
            var timePair = {};
            timePair['start']=start;
            timePair['end']=end;
            for ( var i = 0; i <roomList.length; i++) {
                if(roomList[i].reserved_time==null){
                    roomList[i].reserved_time=[];
                    roomList[i].reserved_time.push(timePair);
                }
                else{
                    roomList[i].reserved_time.push(timePair);
                }
                var Room = $resource('/rooms/:id', {id: '@_id' }, {
                    update: { method: 'PUT' }
                });
                Room.update(roomList[i]);

                var reserves=$resource('/reserves');
                reserves.save({},{
                    username:sessionStorage.getItem('user'),
                    room_number:roomList[i].room_number,
                    room_id:roomList[i]._id,
                    date:timePair})
            }
            window.alert("Reservation success！");
            location.reload();
        }
    }]);

app.controller('showReservationController',
    function($scope, $resource, $location){
        var Reserves = $resource('/reservations', {});
        Reserves.query(function(reserves){
            $scope.reserves = reserves;
        });
        $scope.cancel = function (_id, room_id, date) {
            var Reserves = $resource('/reserves/:id', {});
            Reserves.delete({id:_id}, function (result) {
                var Room = $resource('/rooms/:id');
                Room.get({id:room_id}, function (room) {

                    for (var i=0; i<room.reserved_time.length; i++){
                        console.log(room.reserved_time[i].start);
                        if (room.reserved_time[i].start==date.start){
                            room.reserved_time.splice(i,1);
                            break;
                        }
                    }

                    var RoomUpdate = $resource('/rooms/:id', {id: room_id }, {
                        update: { method: 'PUT' }
                    });
                    RoomUpdate.update(room, function (result) {
                        location.reload();
                    });
                });
            });
        }
    });

app.controller('showUserReservationController',
    function($scope, $resource, $location, $routeParams){
        var Reserves = $resource('/reserves/:username', {});
        var reservesList;
        Reserves.query({ username: $routeParams.username },function(reserves){
            reservesList=reserves;
            $scope.reserves = reserves;
        });
        $scope.cancel = function (_id, room_id, date) {
            var Reserves = $resource('/reserves/:id', {});
            Reserves.delete({id:_id}, function (result) {
                var Room = $resource('/rooms/:id');
                Room.get({id:room_id}, function (room) {

                    for (var i=0; i<room.reserved_time.length; i++){
                        console.log(room.reserved_time[i].start);
                        if (room.reserved_time[i].start==date.start){
                            room.reserved_time.splice(i,1);
                            break;
                        }
                    }

                    var RoomUpdate = $resource('/rooms/:id', {id: room_id }, {
                        update: { method: 'PUT' }
                    });
                    RoomUpdate.update(room, function (result) {
                        location.reload();
                    });

                });


            });


        }
    });




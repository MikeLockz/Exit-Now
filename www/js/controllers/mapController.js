angular.module('starter').controller('MapController',
  ['$scope', '$cordovaGeolocation', '$stateParams', '$ionicModal', '$ionicPopup', '$http', '$interval','$ionicPopup', '$timeout', 'LocationsService', 'InstructionsService',
    function( $scope, $cordovaGeolocation, $stateParams, $ionicModal, $ionicPopup, $http, $interval, $ionicPopup, $timeout, LocationsService, InstructionsService) {

      $scope.currentLocationParams = {
        'traffic':'1',
        'distance':'1',
        'roadConditions':'11',
        'meters':''
      }

      $scope.validDeals = [];

      $scope.distanceCodeToMeters = function(distanceCode) {
        switch (distanceCode) {
          case "0":
            $scope.currentLocationParams.meters = 1*1609.344;
            break;
          case "1":
            $scope.currentLocationParams.meters = 2*1609.344;
            break;
          case "2":
            $scope.currentLocationParams.meters = 5*1609.344;
            break;
          case "3":
            $scope.currentLocationParams.meters = 10*1609.344;
            break;
        }
      };

      $scope.showAlert = function(deal) {
        if (!deal.alertAcknowledged && !deal.alertVisible) {
          deal.alertVisible = true;
          var alertPopup = $ionicPopup.alert({
            title: deal.message,
            template: 'Exit now! There is a ' + deal.message + ". Traffic will be good for the next few miles."
          });
          alertPopup.then(function(res) {
            // user acknowledged coupon
            deal.alertAcknowledged = true;
          });
        }
      };

      $scope.pointInCircle = function(user, deal) {
        var myLat = $scope.map.markers.now.lat;
        var myLon = $scope.map.markers.now.lng;

        var dealLat;
        var dealLon;

        for (var key in $scope.map.allMarkers) {
          var marker = $scope.map.allMarkers[key];
          dealLat = marker.lat;
          dealLon = marker.lng;

          var distance = L.latLng(myLat, myLon).distanceTo(L.latLng(dealLat, dealLon));
          if (distance <= $scope.currentLocationParams.meters) {
            // add all matches to array
            marker.alertAcknowledged = false;
            marker.alertVisible = false;
            // make sure its a new deal
            var flag = false;
            for (var i = 0; i < $scope.validDeals.length; i++) {
              if ($scope.validDeals[i].unique == marker.unique) {
                flag = true;
              }
            }
            if (flag == false) {
              $scope.validDeals.push(marker);
              $scope.showAlert(marker);
            }
          }
        }
      };

      $http.get('http://exit-now.herokuapp.com/api/deals/current')
      .success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        //var matchingDeals = _.filter(data, {'traffic', '1'});
        // var matchingDeals = _.forEach(function(x) {
        //   console.log(_.filter(x.dealData.triggers, {'traffic': '1'}));
        // });

        console.log(data);
        var matchingDeals = _.filter(data, function(deal) {
          var match = deal.dealData.triggers.traffic == $scope.currentLocationParams.traffic && deal.dealData.triggers.roadConditions == $scope.currentLocationParams.roadConditions;
          if (match) {
            $scope.addDealToMap(deal);  
          }
            
          return deal;
        });        
      })
      .error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log(data);
      });

      $scope.addDealToMap = function(deal) {
        // Add Deal marker to map
        $scope.map.allMarkers['a'+Date.now()] = {
          lat:deal.dealData.lat,
          lng:deal.dealData.lon,
          message: deal.dealData.name,
          template: deal.dealData.description,
          business: deal.dealData.business,
          focus: false,
          draggable: false,
          unique: deal._id
        };

        $scope.map.markers['a'+Date.now()] = {
          lat:deal.dealData.lat,
          lng:deal.dealData.lon,
          focus: false,
          draggable: false,
        };

        // Normalize data
        $scope.distanceCodeToMeters(deal.dealData.triggers.distance);

        // Draw circle
        $scope.map.paths['circle'] = {
          type: "circle",
          radius: $scope.currentLocationParams.meters,
          latlngs: {
            lat: deal.dealData.lat, 
            lng: deal.dealData.lon
          }
        };

        
      };

      /**
       * Once state loaded, get put map on scope.
       */
      $scope.$on("$stateChangeSuccess", function() {

        $scope.locations = LocationsService.savedLocations;
        $scope.newLocation;

        // if(!InstructionsService.instructions.newLocations.seen) {

        //   var instructionsPopup = $ionicPopup.alert({
        //     title: 'Add Locations',
        //     template: InstructionsService.instructions.newLocations.text
        //   });
        //   instructionsPopup.then(function(res) {
        //     InstructionsService.instructions.newLocations.seen = true;
        //     });

        // }

        $scope.map = {
          defaults: {
            tileLayer: 'http://{s}.tiles.mapbox.com/v3/craftedhere.map-ra9dh20d/{z}/{x}/{y}.png',
            maxZoom: 18,
            zoomControlPosition: 'bottomleft'
          },
          markers : {},
          paths: {},
          events: {
            map: {
              enable: ['context'],
              logic: 'emit'
            }
          },
          allMarkers: {},
          layers: {
            baselayers: {
                mapbox_light: {
                    name: 'ExitNowBase',
                    url: 'http://api.tiles.mapbox.com/v4/mikelockz.lpk1nf8l/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWlrZWxvY2t6IiwiYSI6IldWdXVFVWcifQ.x4XEU5uIc92VLBNNzQMvNg',
                    type: 'xyz'
                }
            }
          }
        };

        $scope.goTo(0);

      });

      var Location = function() {
        if ( !(this instanceof Location) ) return new Location();
        this.lat  = "";
        this.lng  = "";
        this.name = "";
      };

      $ionicModal.fromTemplateUrl('templates/addLocation.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.modal = modal;
        });

      /**
       * Detect user long-pressing on map to add new location
       */
      // $scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent){
      //   $scope.newLocation = new Location();
      //   $scope.newLocation.lat = locationEvent.leafletEvent.latlng.lat;
      //   $scope.newLocation.lng = locationEvent.leafletEvent.latlng.lng;
      //   $scope.modal.show();
      // });

      $scope.saveLocation = function() {
        LocationsService.savedLocations.push($scope.newLocation);
        $scope.modal.hide();
        $scope.goTo(LocationsService.savedLocations.length - 1);
      };

      /**
       * Center map on specific saved location
       * @param locationKey
       */
      $scope.goTo = function(locationKey) {

        var location = LocationsService.savedLocations[locationKey];

        $scope.map.center  = {
          lat : location.lat,
          lng : location.lng,
          zoom : 12
        };

        // $scope.map.markers[locationKey] = {
        //   lat:location.lat,
        //   lng:location.lng,
        //   message: location.name,
        //   focus: true,
        //   draggable: false
        // };

      };

      /**
       * Center map on user's current position
       */
      $scope.locate = function(){

        $cordovaGeolocation
          .getCurrentPosition()
          .then(function (position) {
            console.log(position);
            $scope.map.center.lat  = position.coords.latitude;
            $scope.map.center.lng = position.coords.longitude;
            $scope.map.center.zoom = 15;

            $scope.map.markers.now = {
              lat:position.coords.latitude,
              lng:position.coords.longitude,
              message: "You Are Here",
              focus: true,
              draggable: false
            };

            $scope.pointInCircle();

          }, function(err) {
            // error
            console.log("Location error!");
            console.log(err);
          });
      };

      // $scope.watchLocation = function() {
      //   console.log('watching');
      //   $cordovaGeolocation
      //     .watchPosition(function (position) {
      //       console.log(position);
      //       $scope.map.center.lat  = position.coords.latitude;
      //       $scope.map.center.lng = position.coords.longitude;
      //       $scope.map.center.zoom = 15;

      //       $scope.map.markers.now = {
      //         lat:position.coords.latitude,
      //         lng:position.coords.longitude,
      //         message: "You",
      //         focus: true,
      //         draggable: false
      //       };

      //       $scope.checkDeals();
      //     }, function (positionError) {
      //       console.log(positionError);
      //     },{ maximumAge: 300, timeout: 500, enableHighAccuracy: true });
      // };
      // $scope.watchLocation();


      $interval($scope.locate, 1000);


      
      
    }]);
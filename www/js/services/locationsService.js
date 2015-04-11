angular.module('starter').factory('LocationsService', [ function() {

  var locationsObj = {};

  locationsObj.savedLocations = [
    {
      name : "Denver, CO",
      lat : 38.8951100,
      lng : -77.0363700,
      travelTimek: 
    },
    {
      name : "Idaho Springs, CO",
      lat : 38.8951100,
      lng : -77.0363700
    },
    {
      name : "Georgetown, CO",
      lat : 38.8951100,
      lng : -77.0363700
    },
    {
      name : "Silverthorne/Dillon, CO",
      lat : 38.8951100,
      lng : -77.0363700
    },
    {
      name : "Vail, CO",
      lat : 38.8951100,
      lng : -77.0363700
    }
  ];

  return locationsObj;

}]);
angular.module('starter').factory('LocationsService', [ function() {

  var locationsObj = {};

  locationsObj.savedLocations = [
    {
      name : "Denver, CO",
      lat : 39.7392,
      lng : -104.9903
    },
    {
      name : "Idaho Springs, CO",
      lat : 39.7425,
      lng : -105.5144
    },
    {
      name : "Georgetown, CO",
      lat : 39.7125,
      lng : -105.6958
    },
    {
      name : "Silverthorne/Dillon, CO",
      lat : 39.6383,
      lng : -106.0764
    },
    {
      name : "Vail, CO",
      lat : 39.6358,
      lng : -106.3631
    }
  ];

  return locationsObj;

}]);
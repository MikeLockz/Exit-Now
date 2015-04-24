define([
  'aeris/util',
  'mocks/mockfactory',
  'mocks/mapobject'
], function(_, MockFactory, MockMapObject) {
  /**
   * @class MockMap
   *
   * @constructor
   */
  var MockMap = MockFactory({
    methods: [
      'getBounds',
      'getView',
      'setCenter',
      'getCenter',
      'setZoom',
      'setBaseLayer',
      'fitToBounds'
    ],
    name: 'Mock_Map',
    constructor: function(el, opt_attrs, opt_options) {
      var attrs = _.defaults(opt_attrs || {}, {
        el: el
      });

      MockMapObject.call(this, attrs, opt_options);
    }
  });
  _.defaults(MockMap.prototype, MockMapObject.prototype);

  return MockMap;
});

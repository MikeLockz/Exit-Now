define([
  'aeris/util',
  'aeris/api/collections/pointdatacollection',
  'aeris/api/collections/aerisapiclientcollection',
  'aeris/api/models/lightning'
], function(_, PointDataCollection, AerisApiClientCollection, LightningModel) {
  /**
   * A representation of lighting data from the
   * Aeris API 'lightning' endpoint.
   *
   * @publicApi
   * @class aeris.api.collections.Lightning
   * @extends aeris.api.collections.PointDataCollection
   *
   * @constructor
   * @override
   */
  var Lightning = function(opt_models, opt_options) {
    var options = _.defaults(opt_options || {}, {
      params: {},
      model: LightningModel,
      endpoint: 'lightning',
      action: 'within',
      SourceCollectionType: PointDataCollection
    });

    _.defaults(options.params, {
      limit: 250,

      // Sort to show newest lightning strikes first
      sort: 'dt:-1'
    });

    AerisApiClientCollection.call(this, opt_models, options);
  };
  _.inherits(Lightning, AerisApiClientCollection);


  return _.expose(Lightning, 'aeris.api.collections.Lightning');
});

define([
  'aeris/util',
  'aeris/model',
  'aeris/promise',
  'aeris/api/params/models/params',
  'aeris/errors/invalidargumenterror',
  'aeris/errors/apiresponseerror'
], function(_, Model, Promise,  Params, InvalidArgumentError, ApiResponseError) {
  /**
   * @class AerisApiBehavior
   * @namespace aeris.api.mixins
   */
  return {
    /**
     * A request has been made to fetch
     * data from the Aeris API.
     *
     * @event 'request'
     * @param {aeris.api.mixins.AerisApiBehavior} object Data object making the request.
     * @param {aeris.Promise} promise Promise to fetch data. Resolves with raw data.
     * @param {Object} requestOptions
     */

    /**
     * The AerisAPI has responsed to a request,
     * and the data object has updated with fetched data.
     *
     * @event 'sync'
     * @param {aeris.api.mixins.AerisApiBehavior} object Data object which made the request.
     * @param {Object} resp Raw response data from the AerisAPI.
     * @param {Object} requestOptions
     */

    /**
     * @protected
     * @param {Object|Model} opt_params
     * @return {aeris.api.params.models.Params}
     * @method createParams_
     */
    createParams_: function(opt_params) {
      return (opt_params instanceof Model) ?
        opt_params : new Params(opt_params, { validate: true });
    },

    /**
     * Returns the params object
     * used to fetch collection data.
     *
     * @return {aeris.api.params.models.Params}
     * @method getParams
     */
    getParams: function() {
      return this.params_;
    },

    /**
     * Updates the requests params
     * included with API requests.
     *
     * @param {string|Object} key Param name. First argument can also.
     *                    be a key: value hash.
     * @param {*} value Param value.
     * @method setParams
     */
    setParams: function(key, value) {
      // Delegate to AerisApiParams#set
      var args = Array.prototype.slice.call(arguments, 0);
      args.push({ validate: true });

      this.params_.set.apply(this.params_, args);
    },

    /**
     * @method setFrom
     * @param {Date} from
     */
    setFrom: function(from) {
      this.setParams('from', from);
    },

    /**
     * @method setTo
     * @param {Date} to
     */
    setTo: function(to) {
      this.setParams('to', to);
    },

    /**
     * @method setLimit
     * @param {number} limit
     */
    setLimit: function(limit) {
      this.setParams('limit', limit);
    },

    /**
     * @method setBounds
     * @param {aeris.maps.Bounds} bounds
     */
    setBounds: function(bounds) {
      this.params_.setBounds(bounds);
    },


    /**
     * Add a filter to the Aeris API request.
     *
     * @method addFilter
     * @param {string|Array.<string>|aeris.api.params.models.Filter|aeris.api.params.collections.FilterCollection} filter
     * @param {Object=} opt_options
     * @param {aeris.api.Operator} opt_options.operator
     */
    addFilter: function(filter, opt_options) {
      this.params_.addFilter(filter, opt_options);
    },

    /**
     * Remove a filter from the Aeris API request.
     *
     * @method removeFilter
     * @param {string|Array.<string>|aeris.api.params.models.Filter|aeris.api.params.collections.FilterCollection} filter
     * @param {Object=} opt_options
     */
    removeFilter: function(filter, opt_options) {
      this.params_.removeFilter(filter, opt_options);
    },

    /**
     * Reset a filter from the Aeris API request.
     *
     * @method resetFilter
     * @param {string|Array.<string>|aeris.api.params.models.Filter|aeris.api.params.collections.FilterCollection} opt_filter
     * @param {Object=} opt_options
     * @param {aeris.api.Operator} opt_options.operator
     */
    resetFilter: function(opt_filter, opt_options) {
      this.params_.resetFilter(opt_filter, opt_options);
    },

    /**
     * Add a query term to Aeris API request.
     *
     * @method addQuery
     * @param {aeris.api.params.models.Query|Array.<aeris.api.params.models.Query>} query
     * @param {Object=} opt_options
     */
    addQuery: function(query, opt_options) {
      this.params_.addQuery(query, opt_options);
    },

    /**
     * Remove a query from the Aeris API request
     *
     * @method removeQuery
     * @param {aeris.api.params.models.Query|Array.<aeris.api.params.models.Query>|string|Array.<string>} query model(s), or property (key).
     * @param {Object=} opt_options
     */
    removeQuery: function(query, opt_options) {
      this.params_.removeQuery(query, opt_options);
    },

    /**
     * Resets the query for the Aeris API request.
     *
     * @method resetQuery
     * @param {aeris.api.params.models.Query|Array.<aeris.api.params.models.Query>=} opt_query
     * @param {Object=} opt_options
     */
    resetQuery: function(opt_query, opt_options) {
      this.params_.resetQuery(opt_query, opt_options);
    },


    /**
     * Returns the query for the Aeris API request.
     *
     * @method getQuery
     * @return {aeris.api.params.collections.ChainedQueries}
     */
    getQuery: function() {
      return this.params_.getQuery();
    },

    /**
     * Overrides Backbone.sync
     * to introduce logic for fetching
     * data from the Aeris API
     *
     * Note that the AerisAPI is read-only.
     *
     * @throws {aeris.errors.InvalidArgumentError} If a non-read request is made.
     * @return {aeris.Promise} Resolves with response data.
     *
     * @override
     * @protected
     * @method sync
     */
    sync: function(method, model, opt_options) {
      var data;
      var noop = function() {};
      var promiseToSync = new Promise();
      var options = _.defaults(opt_options || {}, {
        success: noop,
        error: noop,
        complete: noop
      });

      // Restrict requests to be read-only
      if (method !== 'read') {
        throw new InvalidArgumentError('Unable to send a ' + method + ' request ' +
          'to the Aeris API. The Aeris API is read-only');
      }

      // Trigger start of request,
      // as specified in Backbone docs,
      // and implemented by original sync method.
      this.trigger('request', this, promiseToSync, options);

      data = this.serializeParams_(this.params_);


      this.jsonp_.get(this.getEndpointUrl_(), data, _.bind(function(res) {
        if (!this.isSuccessResponse_(res)) {
          promiseToSync.reject(this.createErrorFromResponse_(res));
        }
        else {
          promiseToSync.resolve(res);
          this.trigger('sync', this, res, options);
        }
      }, this));


      return promiseToSync.
        done(options.success).
        fail(options.error).
        always(options.complete);
    },


    /**
     * Does the response object signal
     * a succesful API response?
     *
     * @param {Object} res Raw response data
     * @protected
     * @return {Boolean}
     */
    isSuccessResponse_: function(res) {
      return res && res.success;
    },


    /**
     * @method createErrorFromResponse_
     * @protected
     * @param {Object} response
     * @return {Error}
     */
    createErrorFromResponse_: function(response) {
      var error;
      try {
        error = new ApiResponseError(response.error.description);
        error.code = response.error.code;
        error.responseObject = response;
      }
      catch (e) {
        error = new ApiResponseError(e.message);
      }

      return error;
    },


    /**
     * Convert the model's Params object
     * into a JSON data object.
     *
     * @method serializeParams_
     * @protected
     * @param {aeris.api.params.models.Params} params
     * @return {Object}
     */
    serializeParams_: function(params) {
      return params.toJSON();
    },


    /**
     * Fetch data from the Aeris API.
     *
     * @method fetch
     * @override
     * @return {aeris.Promise} Resolves with API response.
     */

    /**
     * @protected
     * @return {string}
     * @method getEndpointUrl_
     */
    getEndpointUrl_: function() {
      return _.compact([
        this.server_,
        this.endpoint_,
        this.action_
      ]).join('/') + '/';
    },

    /**
     * @method getEndpoint
     * @return {string}
     */
    getEndpoint: function() {
      return this.endpoint_;
    },


    /**
     * @method getAction
     * @return {string}
     */
    getAction: function() {
      return this.action_;
    },

    /**
     * @method parse
     * @protected
     */
    parse: function(res) {
      return res.response ? res.response : res;
    }
  };
});

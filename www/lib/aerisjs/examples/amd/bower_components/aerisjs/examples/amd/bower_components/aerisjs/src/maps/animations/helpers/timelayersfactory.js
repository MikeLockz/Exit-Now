define([
  'aeris/util'
], function(_) {
  /**
   * Helper class for creating a collection of layers
   * from an array of timestamps
   *
   * @class TimeLayersFactory
   * @namespace aeris.maps.animations.helpers
   *
   * @constructor
   * @override
   *
   * @param {aeris.maps.layers.AerisTile} baseLayer
   * @param {Array.<number>} times Timestamps.
   *
   * @param {aeris.maps.animations.options.AnimationOptions=} opt_options
   */
  var TimeLayersFactory = function(baseLayer, times, opt_options) {
    var options = _.defaults(opt_options || {}, {
      from: null,
      to: null,
      limit: null
    });


    /**
     * @type {?Date}
     * @private
     * @property from_
     */
    this.from_ = options.from;


    /**
     * @type {?Date}
     * @private
     * @property to_
     */
    this.to_ = options.to;


    /**
     * @type {number}
     * @private
     * @property limit_
     */
    this.limit_ = options.limit;


    /**
     * @type {aeris.maps.layers.AerisTile}
     * @private
     * @property baseLayer_
     */
    this.baseLayer_ = baseLayer;


    /**
     * A hash of layers for times.
     * @type {Object.<number,aeris.maps.layers.AerisTile>}
     * @private
     */
    this.timeLayers_ = {};


    /**
     * @type {Array.<number>}
     * @private
     * @property times_
     */
    this.times_ = [];

    if (times) {
      this.setTimes(times);
    }
  };


  /**
   * @param {Array.<number>} times
   * @method setTimes
   */
  TimeLayersFactory.prototype.setTimes = function(times) {
    var removedTimes = _.difference(this.times_, times);

    // Clean up removed times
    removedTimes.forEach(this.removeTime_, this);

    this.times_ = times;
  };


  /**
   * @method removeTime_
   * @private
   */
  TimeLayersFactory.prototype.removeTime_ = function(time) {
    this.times_ = _.without(this.times_, time);

    // Clean the layer we made for this time
    if (this.timeLayers_[time]) {
      this.timeLayers_[time].destroy();
      delete this.timeLayers_[time];
    }
  };


  /**
   * @method setFrom
   * @param {number} from Timestamp.
   */
  TimeLayersFactory.prototype.setFrom = function(from) {
    this.from_ = from;
  };


  /**
   * @method setTo
   * @param {number} to Timestamp.
   */
  TimeLayersFactory.prototype.setTo = function(to) {
    this.to_ = to;
  };


  /**
   * @return {Array.<number>} Timestamps in chronological order.
   * @method getOrderedTimes
   */
  TimeLayersFactory.prototype.getOrderedTimes = function() {
    return _.sortBy(this.times_, _.identity);
  };


  /**
   * @return {Object.<number,aeris.maps.layer.AerisTile>} A hash of timestamps to layers.
   * @method createTimeLayers
   */
  TimeLayersFactory.prototype.createTimeLayers = function() {
    this.prepareTimes_();

    // Make sure we have at least one time layer.
    if (!this.times_.length) {
      this.timeLayers_[Date.now()] = this.createLayerForTime_(this.baseLayer_.get('time').getTime());
      return this.timeLayers_;
    }

    // We want random times for layer creation
    // So our layers are not loaded in sequential
    // chronological order (faster perceived load time).
    this.shuffleTimes_();

    _.each(this.times_, function(time) {
      if (!this.timeLayers_[time]) {
        this.timeLayers_[time] = this.createLayerForTime_(time);
      }
    }, this);

    // Make sure times are sorted
    this.sortTimes_();

    return this.timeLayers_;
  };


  /**
   * @private
   * @method prepareTimes_
   */
  TimeLayersFactory.prototype.prepareTimes_ = function() {
    this.ensureTimeBoundsOptions_();
    this.constrainTimes_(this.from_, this.to_, true);

    if (this.limit_) {
      this.thinTimes_(this.limit_);
    }
  };


  /**
   * @param {number} time
   * @return {aeris.maps.layers.AerisTile}
   * @private
   * @method createLayerForTime_
   */
  TimeLayersFactory.prototype.createLayerForTime_ = function(time) {
    return this.baseLayer_.clone({
      time: new Date(time),
      map: null,
      autoUpdate: false
    });
  };


  /**
   * @private
   * @method ensureTimeBoundsOptions_
   */
  TimeLayersFactory.prototype.ensureTimeBoundsOptions_ = function() {
    this.from_ || (this.from_ = Math.min.apply(null, this.times_));
    this.to_ || (this.to_ = Math.max.apply(null, this.times_));
  };


  /**
   * @param {number} minTime
   * @param {number} maxTime
   * @private
   * @method constrainTimes_
   */
  TimeLayersFactory.prototype.constrainTimes_ = function(minTime, maxTime) {
    this.times_.forEach(function(time) {
      var isOutOfBounds = time < minTime || time > maxTime;

      if (isOutOfBounds) {
        this.removeTime_(time);
      }
    }, this);
  };


  /**
   * @param {number} limit
   * @private
   * @method thinTimes_
   */
  TimeLayersFactory.prototype.thinTimes_ = function(limit) {
    var step, limitedTimes;
    var overage = this.times_.length - limit;

    // We are already within the limit
    if (overage <= 0) {
      return;
    }


    this.sortTimes_();

    // Start out with first and last times
    limitedTimes = [_.first(this.times_), _.last(this.times_)];

    // Add some of the original times back to the array.
    step = Math.floor(this.times_.length / limit);
    for (var i = step; i < this.times_.length; i += step) {
      if (limitedTimes.length < limit) {
        limitedTimes.push(this.times_[i]);
      }
    }

    this.setTimes(limitedTimes);
  };


  /**
   * @private
   * @method shuffleTimes_
   */
  TimeLayersFactory.prototype.shuffleTimes_ = function() {
    this.times_ = _.sample(this.times_, this.times_.length);
  };


  /**
   * @private
   * @method sortTimes_
   */
  TimeLayersFactory.prototype.sortTimes_ = function() {
    this.times_ = _.sortBy(this.times_, _.identity);
  };


  /**
   * @method destroy
   */
  TimeLayersFactory.prototype.destroy = function() {
    this.times_.length = 0;
  };


  return TimeLayersFactory;
});

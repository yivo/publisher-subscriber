(function() {
  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['lodash', 'yess'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
      return module.exports = factory(require('lodash'), require('yess'));
    } else {
      return root.PublisherSubscriber = factory(root._, root.yess);
    }
  })(this, function(_, yess) {
    var apply, exports, filterSubscriptions, fireCallbacks, generateId, isObject, isString, mapMethod, slice;
    exports = {};
    exports.on = function(events, callback, subscriber) {
      var i, j, len, name, subscriptions;
      subscriptions = (this._events || (this._events = {}));
      subscriber || (subscriber = this);
      len = events.length;
      i = -1;
      j = 0;
      while (++i <= len) {
        if (i === len || events[i] === ' ') {
          if (j > 0) {
            (subscriptions[name = events.slice(i - j, i)] || (subscriptions[name] = [])).push(subscriber, mapMethod(subscriber, callback));
          }
          j = 0;
        } else {
          ++j;
        }
      }
      (subscriber._subscribedTo || (subscriber._subscribedTo = {}))[this.oid || (this.oid = generateId())] = this;
      return this;
    };
    exports.once = function(events, callback, subscriber) {
      var self, wrapper;
      self = this;
      wrapper = function() {
        var multipleEvents;
        callback.apply(this, arguments);
        multipleEvents = events.indexOf(' ') > -1;
        if (multipleEvents) {
          return self.off(subscriber, null, wrapper);
        } else {
          return self.off(subscriber, events, wrapper);
        }
      };
      return this.on(events, wrapper, subscriber);
    };
    exports.bind = function(events, callback, subscriber) {
      var cb, event;
      if (isObject(events)) {
        for (event in events) {
          cb = events[event];
          this.on(event, cb, callback);
        }
      } else {
        this.on(events, cb, subscriber);
      }
      return this;
    };
    exports.off = exports.unbind = function(arg1, arg2, arg3) {
      var callback, deleted, event, k, l, len1, len2, oid, ref, ref1, ref2, subscriber, subscriptions;
      if (!this._events) {
        return this;
      }
      oid = this.oid || (this.oid = generateId());
      if (arguments.length === 0) {
        ref = this._events;
        for (event in ref) {
          subscriptions = ref[event];
          for (k = 0, len1 = subscriptions.length; k < len1; k += 2) {
            subscriber = subscriptions[k];
            delete subscriber._subscribedTo[oid];
          }
        }
        this._events = null;
      } else if (isString(arg1)) {
        event = arg1;
        ref1 = this._events[event];
        for (l = 0, len2 = ref1.length; l < len2; l += 2) {
          subscriber = ref1[l];
          delete subscriber._subscribedTo[oid];
        }
        delete this._events[event];
      } else {
        subscriber = arg1;
        event = arg2;
        callback = arg3;
        deleted = !subscriber || delete subscriber._subscribedTo[oid];
        if (deleted) {
          if (event) {
            filterSubscriptions(subscriber, callback, this._events[event]);
          } else {
            ref2 = this._events;
            for (event in ref2) {
              subscriptions = ref2[event];
              filterSubscriptions(subscriber, callback, subscriptions);
            }
          }
        }
      }
      return this;
    };
    exports.subscribe = function(publisher, events, callback) {
      return publisher.on(events, callback, this);
    };
    exports.unsubscribe = function() {
      var oid, publisher, ref;
      if (this._subscribedTo) {
        ref = this._subscribedTo;
        for (oid in ref) {
          publisher = ref[oid];
          publisher.off(this);
        }
      }
      return this;
    };
    exports.notify = function(event) {
      var allEvents, args, callback, givenEvent, omitted;
      callback = this['on' + event[0].toUpperCase() + event.slice(1)];
      if (callback) {
        args = slice.call(arguments, 1);
        if (args[0] === this) {
          args.shift();
          omitted = true;
        }
        apply(callback, this, args);
      }
      if (this._events) {
        givenEvent = this._events[event];
        allEvents = this._events.all;
        if (givenEvent && givenEvent.length) {
          args || (args = slice.call(arguments, 1));
          if (omitted) {
            args.unshift(this);
            omitted = false;
          }
          fireCallbacks(givenEvent, args);
        }
        if (allEvents && allEvents.length) {
          if (args) {
            if (omitted) {
              args.unshift(this);
            }
            args.unshift(event);
          } else {
            args = slice.call(arguments);
          }
          fireCallbacks(allEvents, args);
        }
      }
      return this;
    };
    isObject = _.isObject, isString = _.isString;
    mapMethod = yess.mapMethod, generateId = yess.generateId, apply = yess.apply, slice = yess.slice;
    filterSubscriptions = function(subscriber, callback, data) {
      var i, len;
      i = -2;
      len = data.length;
      if (!subscriber && !data) {
        data.splice(0, len);
      } else {
        while ((i += 2) < len) {
          if ((!subscriber || data[i] === subscriber) && (!callback || data[i + 1] === callback)) {
            data.splice(i, 2);
            i -= 2;
            len -= 2;
          }
        }
      }
    };
    fireCallbacks = function(data, args) {
      var arg1, arg2, arg3, ctx, i, k, l, len1, len2, len3, len4, len5, m, n, o;
      arg1 = args[0];
      arg2 = args[1];
      arg3 = args[2];
      switch (args.length) {
        case 0:
          for (i = k = 0, len1 = data.length; k < len1; i = k += 2) {
            ctx = data[i];
            data[i + 1].call(ctx);
          }
          break;
        case 1:
          for (i = l = 0, len2 = data.length; l < len2; i = l += 2) {
            ctx = data[i];
            data[i + 1].call(ctx, arg1);
          }
          break;
        case 2:
          for (i = m = 0, len3 = data.length; m < len3; i = m += 2) {
            ctx = data[i];
            data[i + 1].call(ctx, arg1, arg2);
          }
          break;
        case 3:
          for (i = n = 0, len4 = data.length; n < len4; i = n += 2) {
            ctx = data[i];
            data[i + 1].call(ctx, arg1, arg2, arg3);
          }
          break;
        default:
          for (i = o = 0, len5 = data.length; o < len5; i = o += 2) {
            ctx = data[i];
            data[i + 1].apply(ctx, args);
          }
      }
    };
    return exports;
  });

}).call(this);

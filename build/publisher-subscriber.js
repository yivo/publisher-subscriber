(function() {
  var hasProp = {}.hasOwnProperty;

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      root.PublisherSubscriber = factory(root);
      define(function() {
        return root.PublisherSubscriber;
      });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = factory(root);
    } else {
      root.PublisherSubscriber = factory(root);
    }
  })(this, function(__root__) {
    var PB, decrementListeningCount, fastProperty, generateOID, getOID, increaseListeningCount, isEventable, isNoisy, resolveCallback;
    PB = {};
    generateOID = (function() {
      var counter;
      counter = 0;
      return function() {
        return ++counter;
      };
    })();
    getOID = function(object) {
      return object.oid || (object.oid = generateOID());
    };
    resolveCallback = function(object, callback) {
      if (typeof callback === 'string') {
        return object[callback];
      } else {
        return callback;
      }
    };
    increaseListeningCount = function(pub, sub, n) {
      var listening, name, record;
      listening = (sub._pbTo || (sub._pbTo = {}));
      record = (listening[name = getOID(pub)] || (listening[name] = [pub, 0]));
      record[1] += n || 1;
    };
    decrementListeningCount = function(pub, sub, n) {
      var oid, record;
      oid = getOID(pub);
      record = sub._pbTo[oid];
      if (record && (record[1] -= n || 1) < 1) {
        delete sub._pbTo[oid];
      }
    };
    fastProperty = function(prop) {
      return prop;
    };
    isNoisy = function(options) {
      return options !== false && (options && options.silent) !== true;
    };
    isEventable = function(obj) {
      return obj && obj.on === PB.on;
    };
    (function() {
      var bind__Base, bind__EventMap, bind__EventString, fn, k, onceWrap, ref, v;
      onceWrap = function(pub, event, callback, context) {
        var run, wrapper;
        run = false;
        wrapper = function() {
          if (!run) {
            run = true;
            pub.off(event, wrapper, context);
            callback.apply(context, arguments);
          }
        };
        wrapper._cb = callback;
        return wrapper;
      };
      bind__Base = function(object, event, callback, context, once) {
        var base, cb;
        cb = once ? onceWrap(object, event, callback, context) : callback;
        return ((base = (object._pb || (object._pb = {})))[event] || (base[event] = [])).push(void 0, cb, context);
      };
      bind__EventString = function(object, events, callback, context, once) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              bind__Base(object, events.slice(i - j, i), callback, context, once);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      bind__EventMap = function(object, hash, context, once) {
        var events;
        for (events in hash) {
          bind__EventString(object, events, resolveCallback(object, hash[events]), context, once);
        }
      };
      ref = {
        bind: false,
        bindOnce: true
      };
      fn = function(method, once) {
        return PB[method] = function(events, callback, context) {
          if (typeof events === 'string') {
            if (callback) {
              bind__EventString(this, events, resolveCallback(this, callback), context || this, once);
            }
          } else {
            bind__EventMap(this, events, context || callback || this, once);
          }
          return this;
        };
      };
      for (k in ref) {
        if (!hasProp.call(ref, k)) continue;
        v = ref[k];
        fn(k, v);
      }
      PB.on = PB.bind;
      PB.once = PB.bindOnce;
    })();
    (function() {
      var fn, k, listenTo__Base, listenTo__EventMap, listenTo__EventString, onceWrap, ref, v;
      onceWrap = function(pub, sub, event, callback) {
        var run, wrapper;
        run = false;
        wrapper = function() {
          if (!run) {
            run = true;
            sub.stopListening(pub, event, wrapper);
            callback.apply(sub, arguments);
          }
        };
        wrapper._cb = callback;
        return wrapper;
      };
      listenTo__Base = function(pub, sub, event, callback, once) {
        var base, cb;
        cb = once ? onceWrap(pub, sub, event, callback) : callback;
        ((base = (pub._pb || (pub._pb = {})))[event] || (base[event] = [])).push(sub, cb, sub);
        increaseListeningCount(pub, sub);
      };
      listenTo__EventString = function(pub, sub, events, callback, once) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              listenTo__Base(pub, sub, events.slice(i - j, i), callback, once);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      listenTo__EventMap = function(pub, sub, hash, once) {
        var events;
        for (events in hash) {
          listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once);
        }
      };
      ref = {
        listenTo: false,
        listenToOnce: true
      };
      fn = function(method, once) {
        return PB[method] = function(object, events, callback) {
          if (typeof events === 'string') {
            if (callback) {
              listenTo__EventString(object, this, events, resolveCallback(this, callback), once);
            }
          } else {
            listenTo__EventMap(object, this, events, once);
          }
          return this;
        };
      };
      for (k in ref) {
        if (!hasProp.call(ref, k)) continue;
        v = ref[k];
        fn(k, v);
      }
    })();
    (function() {
      var filterEntries, stopListening__AnyEvent, stopListening__Base, stopListening__EventMap, stopListening__EventString, stopListening__Everything;
      filterEntries = function(e, sub, cb) {
        var k, l, r;
        if ((l = e.length) < 3) {
          return;
        }
        r = null;
        k = -1;
        while ((k += 3) < l) {
          if ((sub !== e[k - 2]) || (cb && (cb !== e[k - 1] && cb !== e[k - 1]._cb))) {
            (r || (r = [])).push(e[k - 2], e[k - 1], e[k]);
          }
        }
        return r;
      };
      stopListening__Base = function(pub, sub, event, callback) {
        var entries, filtered, n, pb;
        n = 0;
        pb = pub._pb;
        if (pb && (entries = pb[event])) {
          filtered = filterEntries(entries, sub, callback);
          n += entries.length - ((filtered != null ? filtered.length : void 0) | 0);
          pb[event] = filtered;
          if (n > 0) {
            decrementListeningCount(pub, sub, n / 3);
          }
        }
      };
      stopListening__Everything = function(object) {
        var entries, event, filtered, n, oid, pair, pb, pub, ref;
        ref = object._pbTo;
        for (oid in ref) {
          pair = ref[oid];
          pub = pair[0];
          pb = pub._pb;
          n = 0;
          for (event in pb) {
            entries = pb[event];
            if (!(entries)) {
              continue;
            }
            filtered = filterEntries(entries, object);
            n += entries.length - ((filtered != null ? filtered.length : void 0) | 0);
            pb[event] = filtered;
          }
          if (n > 0) {
            decrementListeningCount(pub, object, n / 3);
          }
        }
      };
      stopListening__EventString = function(pub, sub, events, callback) {
        var i, j, l, oid, pair, ref;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              ref = sub._pbTo;
              for (oid in ref) {
                pair = ref[oid];
                if (!pub || pair[0] === pub) {
                  stopListening__Base(pair[0], sub, events.slice(i - j, i), callback);
                }
              }
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      stopListening__EventMap = function(pub, sub, hash) {
        var callback, events;
        for (events in hash) {
          if (!hasProp.call(hash, events)) continue;
          callback = hash[events];
          stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]));
        }
      };
      stopListening__AnyEvent = function(pub, sub, callback) {
        var event, ipub, oid, pair, ref;
        ref = sub._pbTo;
        for (oid in ref) {
          pair = ref[oid];
          if (!pub || (ipub = pair[0]) === pub) {
            for (event in ipub._pb) {
              stopListening__Base(ipub, sub, event, callback);
            }
          }
        }
      };
      PB.stopListening = function(object, events, callback) {
        if (this._pbTo) {
          if (!object && !events && !callback) {
            stopListening__Everything(this);
          } else if (events) {
            if (typeof events === 'string') {
              stopListening__EventString(object, this, events, resolveCallback(this, callback));
            } else {
              stopListening__EventMap(object, this, events);
            }
          } else {
            stopListening__AnyEvent(object, this, resolveCallback(this, callback));
          }
        }
        return this;
      };
    })();
    (function() {
      var runCallbacks, triggerEachEvent, triggerEvent;
      runCallbacks = function(array, args) {
        var arg1, arg2, arg3, i, len;
        if (array.length === 0) {
          return;
        }
        i = -1;
        len = array.length;
        arg1 = len > 0 && args[0];
        arg2 = len > 1 && args[1];
        arg3 = len > 2 && args[2];
        switch (args.length) {
          case 0:
            while ((i += 3) < len) {
              array[i - 1].call(array[i]);
            }
            break;
          case 1:
            while ((i += 3) < len) {
              array[i - 1].call(array[i], arg1);
            }
            break;
          case 2:
            while ((i += 3) < len) {
              array[i - 1].call(array[i], arg1, arg2);
            }
            break;
          case 3:
            while ((i += 3) < len) {
              array[i - 1].call(array[i], arg1, arg2, arg3);
            }
            break;
          default:
            while ((i += 3) < len) {
              array[i - 1].apply(array[i], args);
            }
        }
      };
      triggerEvent = function(pb, event, args) {
        var allList, list;
        list = pb[event];
        allList = pb.all;
        if (list) {
          if (allList) {
            allList = allList.slice();
          }
          runCallbacks(list, args);
        }
        if (allList) {
          args.unshift(event);
          runCallbacks(allList, args);
          args.shift();
        }
      };
      triggerEachEvent = function(pb, events, args) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              triggerEvent(pb, events.slice(i - j, i), args);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      PB.trigger = PB.notify = function(events) {
        var args, k, l, pb;
        if ((pb = this._pb) && (l = arguments.length) > 0) {
          k = 0;
          args = new Array(l - 1);
          while (++k < l) {
            args[k - 1] = arguments[k];
          }
          triggerEachEvent(pb, events, args);
        }
        return this;
      };
    })();
    (function() {
      var unbind__AnyEvent, unbind__Base, unbind__EventMap, unbind__EventString, unbind__Everything;
      unbind__Base = function(object, event, cb, ctx) {
        var e, k, len, r;
        if (!(e = object._pb[event])) {
          return;
        }
        if ((len = e.length) < 3) {
          return;
        }
        r = null;
        k = -1;
        while ((k += 3) < len) {
          if ((!cb || (cb === e[k - 1] || cb === e[k - 1]._cb)) && (!ctx || ctx === e[k])) {
            if (e[k - 2]) {
              decrementListeningCount(object, e[k - 2]);
            }
          } else {
            (r || (r = [])).push(e[k - 2], e[k - 1], e[k]);
          }
        }
        object._pb[event] = r;
      };
      unbind__EventString = function(object, events, callback, context) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              unbind__Base(object, events.slice(i - j, i), callback, context);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      unbind__EventMap = function(object, hash, context) {
        var events;
        for (events in hash) {
          unbind__EventString(object, events, resolveCallback(object, hash[events]), context);
        }
      };
      unbind__Everything = function(object) {
        var entries, event, len1, m, ref, sub;
        ref = object._pb;
        for (event in ref) {
          entries = ref[event];
          if (entries) {
            for (m = 0, len1 = entries.length; m < len1; m += 3) {
              sub = entries[m];
              if (sub) {
                decrementListeningCount(object, sub);
              }
            }
          }
        }
        object._pb = null;
      };
      unbind__AnyEvent = function(object, callback, context) {
        var event;
        for (event in object._pb) {
          unbind__Base(object, event, callback, context);
        }
      };
      PB.unbind = PB.off = function(events, callback, context) {
        if (this._pb) {
          if (!events && !callback && !context) {
            unbind__Everything(this);
          } else if (events) {
            if (typeof events === 'string') {
              unbind__EventString(this, events, resolveCallback(this, callback), context);
            } else {
              unbind__EventMap(this, events, context || callback);
            }
          } else {
            unbind__AnyEvent(this, callback, context);
          }
        }
        return this;
      };
    })();
    return {
      InstanceMembers: PB,
      ClassMembers: {
        isNoisy: isNoisy,
        isEventable: isEventable
      }
    };
  });

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  (function(factory) {
    var root;
    root = typeof self === 'object' && (typeof self !== "undefined" && self !== null ? self.self : void 0) === self ? self : typeof global === 'object' && (typeof global !== "undefined" && global !== null ? global.global : void 0) === global ? global : void 0;
    if (typeof define === 'function' && define.amd) {
      root.PublisherSubscriber = factory(root);
      define(function() {
        return root.PublisherSubscriber;
      });
    } else if (typeof module === 'object' && module !== null && (module.exports != null) && typeof module.exports === 'object') {
      module.exports = factory(root);
    } else {
      root.PublisherSubscriber = factory(root);
    }
  })(function(__root__) {
    var PS, decrementListeningCount, fastProperty, generateOID, getOID, increaseListeningCount, isArrayLike, isEventable, isNoisy, resolveCallback;
    PS = {};
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
      listening = (sub._psTo || (sub._psTo = {}));
      record = (listening[name = pub.oid || (pub.oid = generateOID())] || (listening[name] = [pub, 0]));
      record[1] += n || 1;
    };
    decrementListeningCount = function(pub, sub, n) {
      var oid, record;
      oid = pub.oid || (pub.oid = generateOID());
      record = sub._psTo[oid];
      if (record && (record[1] -= n || 1) < 1) {
        delete sub._psTo[oid];
      }
    };
    fastProperty = function(prop) {
      if (prop.indexOf(':') > -1) {
        return prop.replace(/:/g, '_');
      } else {
        return prop;
      }
    };
    isArrayLike = function(obj) {
      return (obj != null) && typeof obj.length === 'number';
    };
    isNoisy = function(options) {
      return options !== false && (options && options.silent) !== true;
    };
    isEventable = function(obj) {
      return obj && obj.on === PS.on;
    };
    (function() {
      var bind__Base, bind__EventList, bind__EventMap, bind__EventString, fn, k, onceWrap, ref, v;
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
        var base, cb, name;
        cb = once ? onceWrap(object, event, callback, context) : callback;
        return ((base = (object._ps || (object._ps = {})))[name = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event] || (base[name] = [])).push(void 0, cb, context);
      };
      bind__EventString = function(object, events, callback, context, once) {
        var i, j, l;
        if (events.indexOf(' ') === -1) {
          bind__Base(object, events, callback, context, once);
        } else {
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
        }
      };
      bind__EventList = function(object, events, callback, context, once) {
        var event, len1, m;
        for (m = 0, len1 = events.length; m < len1; m++) {
          event = events[m];
          bind__Base(object, event, callback, context, once);
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
        return PS[method] = function(events, callback, context) {
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
      PS.on = PS.bind;
      PS.once = PS.bindOnce;
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
        var base, cb, name;
        cb = once ? onceWrap(pub, sub, event, callback) : callback;
        ((base = (pub._ps || (pub._ps = {})))[name = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event] || (base[name] = [])).push(sub, cb, sub);
        increaseListeningCount(pub, sub);
      };
      listenTo__EventString = function(pub, sub, events, callback, once) {
        var i, j, l;
        if (events.indexOf(' ') === -1) {
          listenTo__Base(pub, sub, events, callback, once);
        } else {
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
        return PS[method] = function(object, events, callback) {
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
        var entries, fevent, filtered, n, ps;
        n = 0;
        ps = pub._ps;
        fevent = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event;
        if (ps && (entries = ps[fevent])) {
          filtered = filterEntries(entries, sub, callback);
          n += entries.length - ((filtered != null ? filtered.length : void 0) | 0);
          ps[fevent] = filtered;
          if (n > 0) {
            decrementListeningCount(pub, sub, n / 3);
          }
        }
      };
      stopListening__Everything = function(object) {
        var entries, event, filtered, n, oid, pair, ps, pub, ref;
        ref = object._psTo;
        for (oid in ref) {
          pair = ref[oid];
          pub = pair[0];
          ps = pub._ps;
          n = 0;
          for (event in ps) {
            entries = ps[event];
            if (!(entries)) {
              continue;
            }
            filtered = filterEntries(entries, object);
            n += entries.length - ((filtered != null ? filtered.length : void 0) | 0);
            ps[event] = filtered;
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
              ref = sub._psTo;
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
        ref = sub._psTo;
        for (oid in ref) {
          pair = ref[oid];
          if (!pub || (ipub = pair[0]) === pub) {
            for (event in ipub._ps) {
              stopListening__Base(ipub, sub, event, callback);
            }
          }
        }
      };
      PS.stopListening = function(object, events, callback) {
        if (this._psTo) {
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
      triggerEvent = function(ps, event, args) {
        var allList, list;
        list = ps[event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event];
        allList = ps.all;
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
      triggerEachEvent = function(ps, events, args) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              triggerEvent(ps, events.slice(i - j, i), args);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      PS.trigger = PS.notify = function(events) {
        var args, k, l, ps, space;
        if ((ps = this._ps) && (l = arguments.length) > 0) {
          if (space = (events.indexOf(' ') > -1) || ps[events.indexOf(':') > -1 ? events.replace(/:/g, '_') : events] || ps.all) {
            k = 0;
            args = new Array(l - 1);
            while (++k < l) {
              args[k - 1] = arguments[k];
            }
            if (space) {
              triggerEachEvent(ps, events, args);
            } else {
              triggerEvent(ps, events, args);
            }
          }
        }
        return this;
      };
    })();
    (function() {
      var unbind__AnyEvent, unbind__Base, unbind__EventMap, unbind__EventString, unbind__Everything;
      unbind__Base = function(object, event, cb, ctx) {
        var e, fevent, k, len, r;
        fevent = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event;
        if (!(e = object._ps[fevent])) {
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
        object._ps[fevent] = r;
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
        ref = object._ps;
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
        object._ps = null;
      };
      unbind__AnyEvent = function(object, callback, context) {
        var event;
        for (event in object._ps) {
          unbind__Base(object, event, callback, context);
        }
      };
      PS.unbind = PS.off = function(events, callback, context) {
        if (this._ps) {
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
      VERSION: '1.0.3',
      isNoisy: isNoisy,
      isEventable: isEventable,
      InstanceMembers: PS
    };
  });

}).call(this);

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
    var PS, decrementListeningCount, fastProperty, generateOID, getOID, increaseListeningCount, isArrayLike, isEventable, isNoisy, ref1, resolveCallback;
    PS = {};
    generateOID = ((ref1 = __root__._) != null ? ref1.generateID : void 0) || (function() {
      var n;
      n = 0;
      return function() {
        return ++n;
      };
    })();
    getOID = function(object) {
      return object.oid != null ? object.oid : object.oid = generateOID();
    };
    resolveCallback = function(object, callback) {
      if (typeof callback === 'string') {
        return object[callback];
      } else {
        return callback;
      }
    };
    increaseListeningCount = function(pub, sub) {
      var listening, name, record;
      listening = (sub._psTo != null ? sub._psTo : sub._psTo = {});
      record = (listening[name = pub.oid != null ? pub.oid : pub.oid = generateOID()] != null ? listening[name] : listening[name] = [pub, 0]);
      record[1] += 1;
    };
    decrementListeningCount = function(pub, sub, n) {
      var oid, record;
      oid = pub.oid != null ? pub.oid : pub.oid = generateOID();
      record = sub._psTo[oid];
      if ((record != null) && (record[1] -= n | 0) < 1) {
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
      var bind__Base, bind__EventList, bind__EventMap, bind__EventString, fn, k, onceWrap, ref2, v;
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
        cb = once === true ? onceWrap(object, event, callback, context) : callback;
        return ((base = (object._ps != null ? object._ps : object._ps = {}))[name = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event] != null ? base[name] : base[name] = []).push(void 0, cb, context);
      };
      bind__EventString = function(object, events, callback, context, once) {
        var base, base1, cb, event, i, j, l, name, name1;
        if (events.indexOf(' ') === -1) {
          cb = (once === true ? onceWrap(object, events, callback, context) : callback);
          ((base = (object._ps != null ? object._ps : object._ps = {}))[name = events.indexOf(':') > -1 ? events.replace(/:/g, '_') : events] != null ? base[name] : base[name] = []).push(void 0, cb, context);
        } else {
          l = events.length;
          i = -1;
          j = 0;
          while (++i <= l) {
            if (i === l || events[i] === ' ') {
              if (j > 0) {
                event = events.slice(i - j, i);
                cb = (once === true ? onceWrap(object, event, callback, context) : callback);
                ((base1 = (object._ps != null ? object._ps : object._ps = {}))[name1 = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event] != null ? base1[name1] : base1[name1] = []).push(void 0, cb, context);
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
          bind__EventString(object, events, (typeof hash[events] === 'string' ? object[hash[events]] : hash[events]), context, once);
        }
      };
      ref2 = {
        bind: false,
        bindOnce: true
      };
      fn = function(method, once) {
        return PS[method] = function(events, callback, context) {
          if (typeof events === 'string') {
            if (callback) {
              bind__EventString(this, events, (typeof callback === 'string' ? this[callback] : callback), context || this, once);
            }
          } else {
            bind__EventMap(this, events, context || callback || this, once);
          }
          return this;
        };
      };
      for (k in ref2) {
        if (!hasProp.call(ref2, k)) continue;
        v = ref2[k];
        fn(k, v);
      }
      PS.on = PS.bind;
      PS.once = PS.bindOnce;
    })();
    (function() {
      var fn, k, listenTo__Base, listenTo__EventMap, listenTo__EventString, onceWrap, ref2, v;
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
        var base, cb, listening, name, name1, record;
        cb = once === true ? onceWrap(pub, sub, event, callback) : callback;
        ((base = (pub._ps != null ? pub._ps : pub._ps = {}))[name = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event] != null ? base[name] : base[name] = []).push(sub, cb, sub);
        listening = (sub._psTo != null ? sub._psTo : sub._psTo = {});
        record = (listening[name1 = pub.oid != null ? pub.oid : pub.oid = generateOID()] != null ? listening[name1] : listening[name1] = [pub, 0]);
        record[1] += 1;
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
          listenTo__EventString(pub, sub, events, (typeof hash[events] === 'string' ? sub[hash[events]] : hash[events]), once);
        }
      };
      ref2 = {
        listenTo: false,
        listenToOnce: true
      };
      fn = function(method, once) {
        return PS[method] = function(object, events, callback) {
          if (typeof events === 'string') {
            if (callback) {
              listenTo__EventString(object, this, events, (typeof callback === 'string' ? this[callback] : callback), once);
            }
          } else {
            listenTo__EventMap(object, this, events, once);
          }
          return this;
        };
      };
      for (k in ref2) {
        if (!hasProp.call(ref2, k)) continue;
        v = ref2[k];
        fn(k, v);
      }
    })();
    (function() {
      var filterEntries, stopListening__AnyEvent, stopListening__Base, stopListening__EventMap, stopListening__EventString, stopListening__EventString__Iteration, stopListening__Everything, stopListening__Everything__Iteration;
      filterEntries = function(e, sub, cb) {
        var k, l, r;
        l = e.length;
        r = [];
        k = -1;
        while ((k += 3) < l) {
          if ((sub !== e[k - 2]) || (cb && (cb !== e[k - 1] && cb !== e[k - 1]._cb))) {
            r.push(e[k - 2], e[k - 1], e[k]);
          }
        }
        return r;
      };
      stopListening__Base = function(pub, sub, event, callback) {
        var entries, fevent, filtered, l, n, ps;
        n = 0;
        ps = pub._ps;
        fevent = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event;
        if ((ps != null) && ((entries = ps[fevent]) != null)) {
          l = entries.length;
          n += l;
          if (l > 2) {
            filtered = filterEntries(entries, sub, callback);
            n -= filtered.length;
          }
          ps[fevent] = filtered;
          if (n > 0) {
            decrementListeningCount(pub, sub, n / 3);
          }
        }
      };
      stopListening__Everything__Iteration = function(pub, sub) {
        var entries, event, filtered, l, n, ps;
        ps = pub._ps;
        n = 0;
        for (event in ps) {
          entries = ps[event];
          if (!(entries != null)) {
            continue;
          }
          l = entries.length;
          n += l;
          if (l > 2) {
            filtered = filterEntries(entries, sub);
            n -= filtered.length;
          }
          ps[event] = filtered;
        }
        if (n > 0) {
          decrementListeningCount(pub, sub, n / 3);
        }
      };
      stopListening__Everything = function(sub) {
        var oid, pair, ref2;
        ref2 = sub._psTo;
        for (oid in ref2) {
          pair = ref2[oid];
          stopListening__Everything__Iteration(pair[0], sub);
        }
      };
      stopListening__EventString = function(pub, sub, events, callback) {
        var i, j, l;
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              stopListening__EventString__Iteration(pub, sub, events.slice(i - j, i), callback);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      stopListening__EventString__Iteration = function(pub, sub, event, callback) {
        var oid, pair, ref2;
        ref2 = sub._psTo;
        for (oid in ref2) {
          pair = ref2[oid];
          if ((pub == null) || pair[0] === pub) {
            stopListening__Base(pair[0], sub, event, callback);
          }
        }
      };
      stopListening__EventMap = function(pub, sub, hash) {
        var callback, events;
        for (events in hash) {
          if (!hasProp.call(hash, events)) continue;
          callback = hash[events];
          stopListening__EventString(pub, sub, events, (typeof hash[events] === 'string' ? sub[hash[events]] : hash[events]));
        }
      };
      stopListening__AnyEvent = function(pub, sub, callback) {
        var event, ipub, oid, pair, ref2;
        ref2 = sub._psTo;
        for (oid in ref2) {
          pair = ref2[oid];
          if ((pub == null) || (ipub = pair[0]) === pub) {
            for (event in ipub._ps) {
              stopListening__Base(ipub, sub, event, callback);
            }
          }
        }
      };
      PS.stopListening = function(object, events, callback) {
        if (this._psTo != null) {
          if ((object == null) && (events == null) && (callback == null)) {
            stopListening__Everything(this);
          } else if (events != null) {
            if (typeof events === 'string') {
              stopListening__EventString(object, this, events, (typeof callback === 'string' ? this[callback] : callback));
            } else {
              stopListening__EventMap(object, this, events);
            }
          } else {
            stopListening__AnyEvent(object, this, (typeof callback === 'string' ? this[callback] : callback));
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
        var allList, el, len1, list, m, ref;
        list = ps[event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event];
        allList = ps.all;
        if (list != null) {
          if (allList != null) {
            ref = allList;
            allList = [];
            for (m = 0, len1 = ref.length; m < len1; m++) {
              el = ref[m];
              allList.push(el);
            }
          }
          runCallbacks(list, args);
        }
        if (allList != null) {
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
        if (((ps = this._ps) != null) && (l = arguments.length) > 0) {
          if (space = (events.indexOf(' ') > -1) || (ps[events.indexOf(':') > -1 ? events.replace(/:/g, '_') : events] != null) || (ps.all != null)) {
            k = 0;
            args = [];
            while (++k < l) {
              args.push(arguments[k]);
            }
            if (space === true) {
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
        var e, fevent, k, len, r, sub;
        fevent = event.indexOf(':') > -1 ? event.replace(/:/g, '_') : event;
        if ((e = object._ps[fevent]) == null) {
          return;
        }
        if ((len = e.length) < 3) {
          return;
        }
        r = null;
        k = -1;
        while ((k += 3) < len) {
          if (((cb == null) || (cb === e[k - 1] || cb === e[k - 1]._cb)) && ((ctx == null) || ctx === e[k])) {
            if ((sub = e[k - 2]) != null) {
              decrementListeningCount(object, sub, 1);
            }
          } else {
            (r != null ? r : r = []).push(e[k - 2], e[k - 1], e[k]);
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
          unbind__EventString(object, events, (typeof hash[events] === 'string' ? object[hash[events]] : hash[events]), context);
        }
      };
      unbind__Everything = function(object) {
        var entries, event, len1, m, ref2, sub;
        ref2 = object._ps;
        for (event in ref2) {
          entries = ref2[event];
          if (entries != null) {
            for (m = 0, len1 = entries.length; m < len1; m += 3) {
              sub = entries[m];
              if (sub != null) {
                decrementListeningCount(object, sub, 1);
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
          if ((events == null) && (callback == null) && (context == null)) {
            unbind__Everything(this);
          } else if (events != null) {
            if (typeof events === 'string') {
              unbind__EventString(this, events, (typeof callback === 'string' ? this[callback] : callback), context);
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
      InstanceMembers: PS,
      included: function(Class) {
        return typeof Class.initializer === "function" ? Class.initializer(function() {
          this._ps = {};
          this._psTo = {};
        }) : void 0;
      }
    };
  });

}).call(this);

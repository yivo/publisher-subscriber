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
    var PS, decrementListeningCount, fastProperty, generateOID, getOID, increaseListeningCount, isArrayLike, isEventable, isNoisy, ref3, ref4, resolveCallback;
    PS = {};
    generateOID = (ref3 = (ref4 = __root__._) != null ? ref4.generateID : void 0) != null ? ref3 : (function() {
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
      listening = (sub._3 != null ? sub._3 : sub._3 = {});
      record = (listening[name = pub.oid != null ? pub.oid : pub.oid = generateOID()] != null ? listening[name] : listening[name] = [pub, 0]);
      record[1] += 1;
    };
    decrementListeningCount = function(pub, sub, n) {
      var oid, record;
      oid = pub.oid != null ? pub.oid : pub.oid = generateOID();
      record = sub._3[oid];
      if ((record != null) && (record[1] -= n | 0) < 1) {
        delete sub._3[oid];
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
      var bind__Base, bind__EventList, bind__EventMap, bind__EventString, fn, k, onceWrap, ref5, v;
      onceWrap = function(pub, event, callback, context) {
        var run, wrapper;
        run = false;
        wrapper = function() {
          if (run === false) {
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
        cb = once === true ? onceWrap(object, event, callback, context) : callback;
        ((base = (object._2 != null ? object._2 : object._2 = {}))[event] != null ? base[event] : base[event] = []).push(void 0, cb, context);
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
          bind__EventString(object, events, (typeof hash[events] === 'string' ? object[hash[events]] : hash[events]), context, once);
        }
      };
      ref5 = {
        bind: false,
        bindOnce: true
      };
      fn = function(method, once) {
        return PS[method] = function(events, callback, context) {
          var ref6;
          if (typeof events === 'string') {
            if (callback) {
              bind__EventString(this, events, (typeof callback === 'string' ? this[callback] : callback), context != null ? context : this, once);
            }
          } else {
            bind__EventMap(this, events, (ref6 = context != null ? context : callback) != null ? ref6 : this, once);
          }
          return this;
        };
      };
      for (k in ref5) {
        if (!hasProp.call(ref5, k)) continue;
        v = ref5[k];
        fn(k, v);
      }
      PS.on = PS.bind;
      PS.once = PS.bindOnce;
    })();
    (function() {
      var fn, k, listenTo__Base, listenTo__EventMap, listenTo__EventString, onceWrap, ref5, v;
      onceWrap = function(pub, sub, event, callback) {
        var run, wrapper;
        run = false;
        wrapper = function() {
          if (run === false) {
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
        cb = once === true ? onceWrap(pub, sub, event, callback) : callback;
        ((base = (pub._2 != null ? pub._2 : pub._2 = {}))[event] != null ? base[event] : base[event] = []).push(sub, cb, sub);
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
          listenTo__EventString(pub, sub, events, (typeof hash[events] === 'string' ? sub[hash[events]] : hash[events]), once);
        }
      };
      ref5 = {
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
      for (k in ref5) {
        if (!hasProp.call(ref5, k)) continue;
        v = ref5[k];
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
        var entries, filtered, l, n, ps;
        n = 0;
        ps = pub._2;
        if ((ps != null) && ((entries = ps[event]) != null)) {
          l = entries.length;
          n += l;
          if (l > 2) {
            filtered = filterEntries(entries, sub, callback);
            n -= filtered.length;
          }
          ps[event] = filtered;
          if (n > 0) {
            decrementListeningCount(pub, sub, n / 3);
          }
        }
      };
      stopListening__Everything__Iteration = function(pub, sub) {
        var entries, event, filtered, l, n, ps;
        ps = pub._2;
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
        var oid, pair, ref5;
        ref5 = sub._3;
        for (oid in ref5) {
          pair = ref5[oid];
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
        var oid, pair, ref5;
        ref5 = sub._3;
        for (oid in ref5) {
          pair = ref5[oid];
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
        var event, ipub, oid, pair, ref5;
        ref5 = sub._3;
        for (oid in ref5) {
          pair = ref5[oid];
          if ((pub == null) || (ipub = pair[0]) === pub) {
            for (event in ipub._2) {
              stopListening__Base(ipub, sub, event, callback);
            }
          }
        }
      };
      PS.stopListening = function(object, events, callback) {
        if (this._3 != null) {
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
        i = -1;
        len = array.length;
        if (len > 0) {
          arg1 = args[0];
        }
        if (len > 1) {
          arg2 = args[1];
        }
        if (len > 2) {
          arg3 = args[2];
        }
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
        list = ps[event];
        allList = ps.all;
        if ((list != null) && list.length > 0) {
          if ((allList != null) && allList.length > 0) {
            ref = allList;
            allList = [];
            for (m = 0, len1 = ref.length; m < len1; m++) {
              el = ref[m];
              allList.push(el);
            }
          }
          runCallbacks(list, args);
        }
        if ((allList != null) && allList.length > 0) {
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
        var args, idx, k, l, ps, ref1, ref2;
        if (((ps = this._2) != null) && (l = arguments.length) > 0) {
          if ((idx = events.indexOf(' ')) > -1 || (((ref1 = ps[events]) != null) && ref1.length > 0) || (((ref2 = ps.all) != null) && ref2.length > 0)) {
            k = 0;
            args = [];
            while (++k < l) {
              args.push(arguments[k]);
            }
            if (idx > -1) {
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
        var e, k, len, r, sub;
        if ((e = object._2[event]) == null) {
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
        object._2[event] = r;
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
        var entries, event, len1, m, ref5, sub;
        ref5 = object._2;
        for (event in ref5) {
          entries = ref5[event];
          if (entries != null) {
            for (m = 0, len1 = entries.length; m < len1; m += 3) {
              sub = entries[m];
              if (sub != null) {
                decrementListeningCount(object, sub, 1);
              }
            }
          }
        }
        object._2 = null;
      };
      unbind__AnyEvent = function(object, callback, context) {
        var event;
        for (event in object._2) {
          unbind__Base(object, event, callback, context);
        }
      };
      PS.unbind = PS.off = function(events, callback, context) {
        if (this._2) {
          if ((events == null) && (callback == null) && (context == null)) {
            unbind__Everything(this);
          } else if (events != null) {
            if (typeof events === 'string') {
              unbind__EventString(this, events, (typeof callback === 'string' ? this[callback] : callback), context);
            } else {
              unbind__EventMap(this, events, context != null ? context : callback);
            }
          } else {
            unbind__AnyEvent(this, callback, context);
          }
        }
        return this;
      };
    })();
    return {
      VERSION: '1.0.8',
      isNoisy: isNoisy,
      isEventable: isEventable,
      InstanceMembers: PS,
      included: function(Class) {
        if (typeof Class.initializer === "function") {
          Class.initializer('publisher-subscriber', function() {
            if (this.oid == null) {
              this.oid = generateOID();
            }
            if (this._2 == null) {
              this._2 = {};
            }
            if (this._3 == null) {
              this._3 = {};
            }
          });
        }
      }
    };
  });

}).call(this);

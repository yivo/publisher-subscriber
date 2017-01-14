(function() {
  (function(factory) {
    var root;
    root = typeof self === 'object' && self !== null && self.self === self ? self : typeof global === 'object' && global !== null && global.global === global ? global : void 0;
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd !== null) {
      root.PublisherSubscriber = factory(root, Object);
      define(function() {
        return root.PublisherSubscriber;
      });
    } else if (typeof module === 'object' && module !== null && typeof module.exports === 'object' && module.exports !== null) {
      module.exports = factory(root, Object);
    } else {
      root.PublisherSubscriber = factory(root, Object);
    }
  })(function(__root__, Object) {
    var PS, decrementListeningCount, generateOID, increaseListeningCount, isEventable, isNoisy, objectCreate, objectKeys, ref, ref1, ref2, ref3, resolveCallback, safeAccessListeners, safeGetListeners, safeGetListening, safeGetOID;
    PS = {};
    generateOID = (ref = (ref1 = __root__._) != null ? ref1.generateID : void 0) != null ? ref : (function() {
      var n;
      n = 0;
      return function() {
        return ++n;
      };
    })();
    objectKeys = (ref2 = (ref3 = __root__._) != null ? ref3.keys : void 0) != null ? ref2 : Object.keys;
    objectCreate = Object.create != null ? function() {
      return Object.create(null);
    } : function() {
      return {};
    };
    safeGetOID = function(object) {
      return object.oid != null ? object.oid : object.oid = generateOID();
    };
    safeGetListeners = function(object) {
      return object.__listeners__ != null ? object.__listeners__ : object.__listeners__ = objectCreate();
    };
    safeAccessListeners = function(object, event) {
      var base;
      return (base = safeGetListeners(object))[event] != null ? base[event] : base[event] = [];
    };
    safeGetListening = function(object) {
      return object.__listening__ != null ? object.__listening__ : object.__listening__ = objectCreate();
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
      listening = safeGetListening(sub);
      record = (listening[name = safeGetOID(pub)] != null ? listening[name] : listening[name] = [pub, 0]);
      record[1] += 1;
    };
    decrementListeningCount = function(pub, sub, n) {
      var oid, record;
      oid = safeGetOID(pub);
      record = sub.__listening__[oid];
      if ((record != null) && (record[1] -= n | 0) < 1) {
        delete sub.__listening__[oid];
      }
    };
    isNoisy = function(options) {
      return options !== false && (options != null ? options.silent : void 0) !== true;
    };
    isEventable = function(obj) {
      return (obj != null ? obj.on : void 0) === PS.on;
    };
    (function() {
      var bind__Base, bind__EventMap, bind__EventString, fn, i, len1, m, method, onceWrap, ref4;
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
        var cb;
        cb = once === true ? onceWrap(object, event, callback, context) : callback;
        safeAccessListeners(object, event).push(void 0, cb, context);
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
      bind__EventMap = function(object, hash, context, once) {
        var events, len1, m, ref4;
        ref4 = objectKeys(hash);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          events = ref4[m];
          bind__EventString(object, events, resolveCallback(object, hash[events]), context, once);
        }
      };
      ref4 = ['on', 'once'];
      fn = function(method, once) {
        return PS[method] = function(events, callback, context) {
          var ref5;
          if (events != null) {
            if (typeof events === 'string') {
              if (callback != null) {
                bind__EventString(this, events, resolveCallback(this, callback), context != null ? context : this, once);
              }
            } else {
              bind__EventMap(this, events, (ref5 = context != null ? context : callback) != null ? ref5 : this, once);
            }
          }
          return this;
        };
      };
      for (i = m = 0, len1 = ref4.length; m < len1; i = ++m) {
        method = ref4[i];
        fn(method, i === 1);
      }
      PS.bind = PS.on;
    })();
    (function() {
      var fn, i, len1, listenTo__Base, listenTo__EventMap, listenTo__EventString, m, method, onceWrap, ref4;
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
        var cb;
        cb = once === true ? onceWrap(pub, sub, event, callback) : callback;
        safeAccessListeners(pub, event).push(sub, cb, sub);
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
        var events, len1, m, ref4;
        ref4 = objectKeys(hash);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          events = ref4[m];
          listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once);
        }
      };
      ref4 = ['listenTo', 'listenToOnce'];
      fn = function(method, once) {
        return PS[method] = function(object, events, callback) {
          if (events != null) {
            if (typeof events === 'string') {
              if (callback != null) {
                listenTo__EventString(object, this, events, resolveCallback(this, callback), once);
              }
            } else {
              listenTo__EventMap(object, this, events, once);
            }
          }
          return this;
        };
      };
      for (i = m = 0, len1 = ref4.length; m < len1; i = ++m) {
        method = ref4[i];
        fn(method, i === 1);
      }
    })();
    (function() {
      var filterEntries, stopListening__AnyEvent, stopListening__Base, stopListening__EventMap, stopListening__EventString, stopListening__EventString__Iteratee, stopListening__Everything, stopListening__Everything__Iteratee;
      filterEntries = function(e, sub, cb) {
        var k, l, r;
        l = e.length;
        r = [];
        k = -1;
        while ((k += 3) < l) {
          if ((sub !== e[k - 2]) || ((cb != null) && (cb !== e[k - 1] && cb !== e[k - 1]._cb))) {
            r.push(e[k - 2], e[k - 1], e[k]);
          }
        }
        return r;
      };
      stopListening__Base = function(pub, sub, event, callback) {
        var entries, filtered, l, listeners, n;
        n = 0;
        listeners = pub.__listeners__;
        if ((listeners != null) && ((entries = listeners[event]) != null)) {
          l = entries.length;
          n += l;
          if (l > 2) {
            filtered = filterEntries(entries, sub, callback);
            n -= filtered.length;
            listeners[event] = filtered;
          } else {
            listeners[event] = [];
          }
        }
        if (n > 0) {
          decrementListeningCount(pub, sub, n / 3);
        }
      };
      stopListening__Everything__Iteratee = function(pub, sub) {
        var entries, event, filtered, l, len1, listeners, m, n, ref4;
        n = 0;
        listeners = pub.__listeners__;
        ref4 = objectKeys(listeners);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          event = ref4[m];
          entries = listeners[event];
          l = entries.length;
          n += l;
          if (l > 2) {
            filtered = filterEntries(entries, sub, null);
            n -= filtered.length;
            listeners[event] = filtered;
          } else {
            listeners[event] = [];
          }
        }
        if (n > 0) {
          decrementListeningCount(pub, sub, n / 3);
        }
      };
      stopListening__Everything = function(sub) {
        var len1, listening, m, oid, ref4;
        listening = sub.__listening__;
        ref4 = objectKeys(listening);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          oid = ref4[m];
          stopListening__Everything__Iteratee(listening[oid][0], sub);
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
              stopListening__EventString__Iteratee(pub, sub, events.slice(i - j, i), callback);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      };
      stopListening__EventString__Iteratee = function(pub, sub, event, callback) {
        var len1, listening, m, oid, pair, ref4;
        listening = sub.__listening__;
        ref4 = objectKeys(listening);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          oid = ref4[m];
          pair = listening[oid];
          if ((pub == null) || pair[0] === pub) {
            stopListening__Base(pair[0], sub, event, callback);
          }
        }
      };
      stopListening__EventMap = function(pub, sub, hash) {
        var events, len1, m, ref4;
        ref4 = objectKeys(hash);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          events = ref4[m];
          stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]));
        }
      };
      stopListening__AnyEvent = function(pub, sub, callback) {
        var event, len1, len2, listeners, listening, m, o, oid, pair, ref4, ref5;
        listening = sub.__listening__;
        ref4 = objectKeys(listening);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          oid = ref4[m];
          pair = listening[oid];
          if ((pub == null) || pair[0] === pub) {
            listeners = pair[0].__listeners__;
            ref5 = objectKeys(listeners);
            for (o = 0, len2 = ref5.length; o < len2; o++) {
              event = ref5[o];
              stopListening__Base(pair[0], sub, event, callback);
            }
          }
        }
      };
      PS.stopListening = function(object, events, callback) {
        if (this.__listening__ != null) {
          if (arguments.length === 0) {
            stopListening__Everything(this);
          } else if (events != null) {
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
        var idx, len;
        idx = -1;
        len = array.length;
        switch (args.length) {
          case 0:
            while ((idx += 3) < len) {
              array[idx - 1].call(array[idx]);
            }
            break;
          case 1:
            while ((idx += 3) < len) {
              array[idx - 1].call(array[idx], args[0]);
            }
            break;
          case 2:
            while ((idx += 3) < len) {
              array[idx - 1].call(array[idx], args[0], args[1]);
            }
            break;
          case 3:
            while ((idx += 3) < len) {
              array[idx - 1].call(array[idx], args[0], args[1], args[2]);
            }
            break;
          default:
            while ((idx += 3) < len) {
              array[idx - 1].apply(array[idx], args);
            }
        }
      };
      triggerEvent = function(listeners, event, args) {
        var list, listall;
        list = listeners[event];
        listall = listeners.all;
        if ((list != null ? list.length : void 0) > 0) {
          if ((listall != null ? listall.length : void 0) > 0) {
            listall = listall.slice();
          }
          runCallbacks(list, args);
        }
        if ((listall != null ? listall.length : void 0) > 0) {
          args.unshift(event);
          runCallbacks(listall, args);
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
        var args, idx, k, l, listeners, ref4, ref5;
        if (((listeners = this.__listeners__) != null) && (l = arguments.length) > 0) {
          if ((idx = events.indexOf(' ')) > -1 || ((ref4 = listeners[events]) != null ? ref4.length : void 0) > 0 || ((ref5 = listeners.all) != null ? ref5.length : void 0) > 0) {
            k = 0;
            args = [];
            while (++k < l) {
              args.push(arguments[k]);
            }
            if (idx > -1) {
              triggerEachEvent(listeners, events, args);
            } else {
              triggerEvent(listeners, events, args);
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
        if ((e = object.__listeners__[event]) == null) {
          return;
        }
        if ((len = e.length) < 3) {
          return;
        }
        r = [];
        k = -1;
        while ((k += 3) < len) {
          if (((cb == null) || (cb === e[k - 1] || cb === e[k - 1]._cb)) && ((ctx == null) || ctx === e[k])) {
            if ((sub = e[k - 2]) != null) {
              decrementListeningCount(object, sub, 1);
            }
          } else {
            r.push(e[k - 2], e[k - 1], e[k]);
          }
        }
        object.__listeners__[event] = r;
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
        var events, len1, m, ref4;
        ref4 = objectKeys(hash);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          events = ref4[m];
          unbind__EventString(object, events, resolveCallback(object, hash[events]), context);
        }
      };
      unbind__Everything = function(object) {
        var entries, event, len1, len2, listeners, m, o, ref4, sub;
        listeners = object.__listeners__;
        ref4 = objectKeys(listeners);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          event = ref4[m];
          if ((entries = listeners[event]) != null) {
            for (o = 0, len2 = entries.length; o < len2; o += 3) {
              sub = entries[o];
              if (sub != null) {
                decrementListeningCount(object, sub, 1);
              }
            }
          }
        }
        object.__listeners__ = null;
      };
      unbind__AnyEvent = function(object, callback, context) {
        var event, len1, m, ref4;
        ref4 = objectKeys(object.__listeners__);
        for (m = 0, len1 = ref4.length; m < len1; m++) {
          event = ref4[m];
          unbind__Base(object, event, callback, context);
        }
      };
      PS.unbind = PS.off = function(events, callback, context) {
        if (this.__listeners__ != null) {
          if (arguments.length === 0) {
            unbind__Everything(this);
          } else if (events != null) {
            if (typeof events === 'string') {
              unbind__EventString(this, events, resolveCallback(this, callback), context);
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
      VERSION: '1.0.11',
      isNoisy: isNoisy,
      isEventable: isEventable,
      InstanceMembers: PS
    };
  });

}).call(this);

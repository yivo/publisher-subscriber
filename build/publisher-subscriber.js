
/*!
 * publisher-subscriber 1.0.12 | https://github.com/yivo/publisher-subscriber | MIT License
 */

(function() {
  (function(factory) {
    var __root__;
    __root__ = typeof self === 'object' && self !== null && self.self === self ? self : typeof global === 'object' && global !== null && global.global === global ? global : Function('return this')();
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd !== null) {
      __root__.PublisherSubscriber = factory(__root__, Object);
      define(function() {
        return __root__.PublisherSubscriber;
      });
    } else if (typeof module === 'object' && module !== null && typeof module.exports === 'object' && module.exports !== null) {
      module.exports = factory(__root__, Object);
    } else {
      __root__.PublisherSubscriber = factory(__root__, Object);
    }
  })(function(__root__, Object) {
    var ANY_CONTEXT, PS, bind__Base, bind__EventMap, bind__EventString, bind__onceWrap, decrementListeningCount, generateOID, increaseListeningCount, isEventable, isNoisy, listenTo__Base, listenTo__EventMap, listenTo__EventString, listenTo__onceWrap, objectCreate, objectFreeze, objectKeys, ref, ref1, ref2, ref3, ref4, resolveCallback, safeAccessListeners, safeGetListeners, safeGetListening, safeGetOID, stopListening__AnyEvent, stopListening__Base, stopListening__EventMap, stopListening__EventString, stopListening__EventString__Iteratee, stopListening__Everything, stopListening__Everything__Iteratee, stopListening__filterEntries, trigger__Base, trigger__EventString, trigger__runCallbacks, unbind__AnyEvent, unbind__Base, unbind__EventMap, unbind__EventString, unbind__Everything;
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
    objectFreeze = (ref4 = Object.freeze) != null ? ref4 : function(object) {
      return object;
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
    ANY_CONTEXT = objectCreate();
    objectFreeze(ANY_CONTEXT);
    bind__onceWrap = function(object, event, callback, callcontext) {
      var run, wrapper;
      run = false;
      wrapper = function() {
        if (run === false) {
          run = true;
          object.off(event, wrapper);
          callback.apply(callcontext, arguments);
        }
      };
      wrapper.__wrapped__ = callback;
      return wrapper;
    };
    bind__Base = function(object, event, callback, usercontext, callcontext, once) {
      var cb;
      cb = once === true ? bind__onceWrap(object, event, callback, callcontext) : callback;
      safeAccessListeners(object, event).push(null, cb, usercontext, callcontext);
    };
    bind__EventString = function(object, events, callback, usercontext, callcontext, once) {
      var i, j, l;
      if (events.indexOf(' ') === -1) {
        bind__Base(object, events, callback, usercontext, callcontext, once);
      } else {
        l = events.length;
        i = -1;
        j = 0;
        while (++i <= l) {
          if (i === l || events[i] === ' ') {
            if (j > 0) {
              bind__Base(object, events.slice(i - j, i), callback, usercontext, callcontext, once);
              j = 0;
            }
          } else {
            ++j;
          }
        }
      }
    };
    bind__EventMap = function(object, hash, usercontext, callcontext, once) {
      var events, len1, m, ref5;
      ref5 = objectKeys(hash);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        events = ref5[m];
        bind__EventString(object, events, resolveCallback(object, hash[events]), usercontext, callcontext, once);
      }
    };
    (function() {
      var i, len1, m, method, ref5, results;
      ref5 = ['on', 'once'];
      results = [];
      for (i = m = 0, len1 = ref5.length; m < len1; i = ++m) {
        method = ref5[i];
        results.push(PS[method] = (function(once) {
          return function(events) {
            var args, argslength, callback, callcontext, usercontext;
            args = arguments;
            argslength = arguments.length;
            if (typeof events === 'string') {
              if (argslength > 1 && typeof (callback = resolveCallback(this, args[1])) === 'function') {
                if (argslength > 2) {
                  usercontext = args[2];
                }
                callcontext = argslength > 2 ? usercontext : this;
                bind__EventString(this, events, callback, usercontext, callcontext, once);
              }
            } else if (typeof events === 'object' && events !== null) {
              if (argslength > 2) {
                callcontext = usercontext = args[2];
              } else if (argslength > 1) {
                callcontext = usercontext = args[1];
              } else {
                callcontext = this;
              }
              bind__EventMap(this, events, usercontext, callcontext, once);
            }
            return this;
          };
        })(i === 1));
      }
      return results;
    })();
    PS.bind = PS.on;
    listenTo__onceWrap = function(pub, sub, event, callback) {
      var run, wrapper;
      run = false;
      wrapper = function() {
        if (run === false) {
          run = true;
          sub.stopListening(pub, event, wrapper);
          callback.apply(sub, arguments);
        }
      };
      wrapper.__wrapped__ = callback;
      return wrapper;
    };
    listenTo__Base = function(pub, sub, event, callback, once) {
      var cb;
      cb = once === true ? listenTo__onceWrap(pub, sub, event, callback) : callback;
      safeAccessListeners(pub, event).push(sub, cb, sub, sub);
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
      var events, len1, m, ref5;
      ref5 = objectKeys(hash);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        events = ref5[m];
        listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once);
      }
    };
    (function() {
      var i, len1, m, method, ref5, results;
      ref5 = ['listenTo', 'listenToOnce'];
      results = [];
      for (i = m = 0, len1 = ref5.length; m < len1; i = ++m) {
        method = ref5[i];
        results.push(PS[method] = (function(once) {
          return function(object, events, callback) {
            var args, argslength;
            args = arguments;
            argslength = args.length;
            if (typeof events === 'string') {
              if (argslength > 2 && typeof (callback = resolveCallback(this, args[2])) === 'function') {
                listenTo__EventString(object, this, events, callback, once);
              }
            } else if (typeof events === 'object' && events !== null) {
              listenTo__EventMap(object, this, events, once);
            }
            return this;
          };
        })(i === 1));
      }
      return results;
    })();
    stopListening__filterEntries = function(e, sub, cb) {
      var k, l, r;
      l = e.length;
      r = [];
      k = -1;
      while ((k += 4) < l) {
        if (sub !== e[k - 3] || ((cb != null) && (cb !== e[k - 2] && cb !== e[k - 2].__wrapped__))) {
          r.push(e[k - 3], e[k - 2], e[k - 1], e[k]);
        }
      }
      return r;
    };
    stopListening__Base = function(pub, sub, event, callback) {
      var entries, filtered, l, listeners, n;
      n = 0;
      listeners = pub.__listeners__;
      if ((entries = listeners[event]) != null) {
        l = entries.length;
        n += l;
        if (l > 3) {
          filtered = stopListening__filterEntries(entries, sub, callback);
          n -= filtered.length;
          listeners[event] = filtered;
        } else {
          listeners[event] = [];
        }
      }
      if (n > 0) {
        decrementListeningCount(pub, sub, n / 4);
      }
    };
    stopListening__Everything__Iteratee = function(pub, sub) {
      var entries, event, filtered, l, len1, listeners, m, n, ref5;
      n = 0;
      listeners = pub.__listeners__;
      ref5 = objectKeys(listeners);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        event = ref5[m];
        entries = listeners[event];
        l = entries.length;
        n += l;
        if (l > 3) {
          filtered = stopListening__filterEntries(entries, sub, null);
          n -= filtered.length;
          listeners[event] = filtered;
        } else {
          listeners[event] = [];
        }
      }
      if (n > 0) {
        decrementListeningCount(pub, sub, n / 4);
      }
    };
    stopListening__Everything = function(sub) {
      var len1, listening, m, oid, ref5;
      listening = sub.__listening__;
      ref5 = objectKeys(listening);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        oid = ref5[m];
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
      var len1, listening, m, oid, pair, ref5;
      listening = sub.__listening__;
      ref5 = objectKeys(listening);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        oid = ref5[m];
        pair = listening[oid];
        if ((pub == null) || pair[0] === pub) {
          stopListening__Base(pair[0], sub, event, callback);
        }
      }
    };
    stopListening__EventMap = function(pub, sub, hash) {
      var events, len1, m, ref5;
      ref5 = objectKeys(hash);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        events = ref5[m];
        stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]));
      }
    };
    stopListening__AnyEvent = function(pub, sub, callback) {
      var event, len1, len2, listeners, listening, m, o, oid, pair, ref5, ref6;
      listening = sub.__listening__;
      ref5 = objectKeys(listening);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        oid = ref5[m];
        pair = listening[oid];
        if ((pub == null) || pair[0] === pub) {
          listeners = pair[0].__listeners__;
          ref6 = objectKeys(listeners);
          for (o = 0, len2 = ref6.length; o < len2; o++) {
            event = ref6[o];
            stopListening__Base(pair[0], sub, event, callback);
          }
        }
      }
    };
    PS.stopListening = function(object, events) {
      var args, argslength;
      if (this.__listening__ != null) {
        args = arguments;
        argslength = args.length;
        if (argslength === 0) {
          stopListening__Everything(this);
        } else if (typeof events === 'string') {
          stopListening__EventString(object, this, events, argslength > 2 ? resolveCallback(this, args[2]) : void 0);
        } else if (typeof events === 'object' && events !== null) {
          stopListening__EventMap(object, this, events);
        } else {
          stopListening__AnyEvent(object, this, argslength > 2 ? resolveCallback(this, args[2]) : void 0);
        }
      }
      return this;
    };
    trigger__runCallbacks = function(array, args) {
      var idx, len;
      idx = -1;
      len = array.length;
      switch (args.length) {
        case 0:
          while ((idx += 4) < len) {
            array[idx - 2].call(array[idx]);
          }
          break;
        case 1:
          while ((idx += 4) < len) {
            array[idx - 2].call(array[idx], args[0]);
          }
          break;
        case 2:
          while ((idx += 4) < len) {
            array[idx - 2].call(array[idx], args[0], args[1]);
          }
          break;
        case 3:
          while ((idx += 4) < len) {
            array[idx - 2].call(array[idx], args[0], args[1], args[2]);
          }
          break;
        default:
          while ((idx += 4) < len) {
            array[idx - 2].apply(array[idx], args);
          }
      }
    };
    trigger__Base = function(listeners, event, args) {
      var list, listall;
      list = listeners[event];
      listall = listeners.all;
      if ((list != null ? list.length : void 0) > 0) {
        if ((listall != null ? listall.length : void 0) > 0) {
          listall = listall.slice();
        }
        trigger__runCallbacks(list, args);
      }
      if ((listall != null ? listall.length : void 0) > 0) {
        args.unshift(event);
        trigger__runCallbacks(listall, args);
        args.shift();
      }
    };
    trigger__EventString = function(listeners, events, args) {
      var i, j, l;
      l = events.length;
      i = -1;
      j = 0;
      while (++i <= l) {
        if (i === l || events[i] === ' ') {
          if (j > 0) {
            trigger__Base(listeners, events.slice(i - j, i), args);
            j = 0;
          }
        } else {
          ++j;
        }
      }
    };
    PS.trigger = PS.notify = function(events) {
      var args, idx, k, l, listeners, ref5, ref6;
      if ((listeners = this.__listeners__) != null) {
        if ((idx = events.indexOf(' ')) > -1 || ((ref5 = listeners[events]) != null ? ref5.length : void 0) > 0 || ((ref6 = listeners.all) != null ? ref6.length : void 0) > 0) {
          k = 0;
          l = arguments.length;
          args = [];
          while (++k < l) {
            args.push(arguments[k]);
          }
          if (idx > -1) {
            trigger__EventString(listeners, events, args);
          } else {
            trigger__Base(listeners, events, args);
          }
        }
      }
      return this;
    };
    unbind__Base = function(object, event, callback, usercontext) {
      var e, k, l, r, sub;
      if ((e = object.__listeners__[event]) == null) {
        return;
      }
      if ((l = e.length) < 4) {
        return;
      }
      r = [];
      k = -1;
      while ((k += 4) < l) {
        if ((callback === (void 0) || callback === null || callback === e[k - 2] || callback === e[k - 2].__wrapped__) && (usercontext === ANY_CONTEXT || usercontext === e[k - 1])) {
          if ((sub = e[k - 3]) != null) {
            decrementListeningCount(object, sub, 1);
          }
        } else {
          r.push(e[k - 3], e[k - 2], e[k - 1], e[k]);
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
      var events, len1, m, ref5;
      ref5 = objectKeys(hash);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        events = ref5[m];
        unbind__EventString(object, events, resolveCallback(object, hash[events]), context);
      }
    };
    unbind__Everything = function(object) {
      var event, len1, len2, listeners, m, o, ref5, ref6, sub;
      listeners = object.__listeners__;
      ref5 = objectKeys(listeners);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        event = ref5[m];
        ref6 = listeners[event];
        for (o = 0, len2 = ref6.length; o < len2; o += 4) {
          sub = ref6[o];
          if (sub != null) {
            decrementListeningCount(object, sub, 1);
          }
        }
      }
      object.__listeners__ = null;
    };
    unbind__AnyEvent = function(object, callback, usercontext) {
      var event, len1, m, ref5;
      ref5 = objectKeys(object.__listeners__);
      for (m = 0, len1 = ref5.length; m < len1; m++) {
        event = ref5[m];
        unbind__Base(object, event, callback, usercontext);
      }
    };
    PS.unbind = PS.off = function(events) {
      var args, argslength, callback, usercontext;
      if (this.__listeners__ != null) {
        args = arguments;
        argslength = args.length;
        if (argslength === 0) {
          unbind__Everything(this);
        } else if (typeof events === 'string') {
          if (argslength > 1) {
            callback = resolveCallback(this, args[1]);
          }
          usercontext = argslength > 2 ? args[2] : ANY_CONTEXT;
          unbind__EventString(this, events, callback, usercontext);
        } else if (typeof events === 'object' && events !== null) {
          usercontext = argslength > 1 ? args[1] : ANY_CONTEXT;
          unbind__EventMap(this, events, usercontext);
        } else {
          if (argslength > 1) {
            callback = resolveCallback(this, args[1]);
          }
          usercontext = argslength > 2 ? args[2] : ANY_CONTEXT;
          unbind__AnyEvent(this, callback, usercontext);
        }
      }
      return this;
    };
    return objectFreeze({
      VERSION: '1.0.12',
      isNoisy: isNoisy,
      isEventable: isEventable,
      InstanceMembers: objectFreeze(PS)
    });
  });

}).call(this);

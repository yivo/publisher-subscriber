describe('PublisherSubscriber', function() {

  it("on and trigger", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    obj.on('event', function() { obj.counter += 1; });
    obj.trigger('event');
    expect(obj.counter).toEqual(1, 'counter should be incremented.');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    expect(obj.counter).toEqual(5, 'counter should be incremented five times.');
  });

  it("binding and triggering multiple events", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);

    obj.on('a b c', function() { obj.counter += 1; });

    obj.trigger('a');
    expect(obj.counter).toBe(1);

    obj.trigger('a b');
    expect(obj.counter).toBe(3);

    obj.trigger('c');
    expect(obj.counter).toBe(4);

    obj.off('a c');
    obj.trigger('a b c');
    expect(obj.counter).toBe(5);
  });

  it("binding and triggering with event maps", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);

    var increment = function() {
      this.counter += 1;
    };

    obj.on({
      a: increment, b: increment, c: increment
    }, obj);

    obj.trigger('a');
    expect(obj.counter).toBe(1);

    obj.trigger('a b');
    expect(obj.counter).toBe(3);

    obj.trigger('c');
    expect(obj.counter).toBe(4);

    obj.off({
      a: increment, c: increment
    }, obj);
    obj.trigger('a b c');
    expect(obj.counter).toBe(5);
  });

  it("binding and triggering multiple event names with event maps", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);

    var increment = function() {
      this.counter += 1;
    };

    obj.on({
      'a b c': increment
    });

    obj.trigger('a');
    expect(obj.counter).toBe(1);

    obj.trigger('a b');
    expect(obj.counter).toBe(3);

    obj.trigger('c');
    expect(obj.counter).toBe(4);

    obj.off({
      'a c': increment
    });

    obj.trigger('a b c');
    expect(obj.counter).toBe(5);
  });

  it("binding and trigger with event maps context", function() {
    var obj = {counter: 0};
    var context = {};
    _.extend(obj, PublisherSubscriber.InstanceMembers);

    obj.on({
      a: function() {
        expect(this).toBe(context, 'defaults `context` to `callback` param');
      }
    }, context).trigger('a');

    obj.off().on({
      a: function() {
        expect(this).toBe(context, 'will not override explicit `context` param');
      }
    }, this, context).trigger('a');
  });

  it("listenTo and stopListening", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenTo(b, 'all', function() { expect(true).toBeTruthy(); });
    b.trigger('anything');
    a.listenTo(b, 'all', function() { expect(true).toBeFalsy(); });
    a.stopListening();
    b.trigger('anything');
  });

  it("listenTo and stopListening with event maps", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var cb = function() { expect(true).toBeTruthy(); };
    a.listenTo(b, {event: cb});
    b.trigger('event');
    a.listenTo(b, {event2: cb});
    b.on('event2', cb);
    a.stopListening(b, {event2: cb});
    b.trigger('event event2');
    a.stopListening();
    b.trigger('event event2');
  });

  it("stopListening with omitted args", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var cb = function() { expect(true).toBeTruthy(); };
    a.listenTo(b, 'event', cb);
    b.on('event', cb);
    a.listenTo(b, 'event2', cb);
    a.stopListening(null, {event: cb});
    b.trigger('event event2');
    b.off();
    a.listenTo(b, 'event event2', cb);
    a.stopListening(null, 'event');
    a.stopListening();
    b.trigger('event2');
  });

  it("listenToOnce", function() {
    // Same as the previous test, but we use once rather than having to explicitly unbind
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var incrA = function() {
      obj.counterA += 1;
      obj.trigger('event');
    };
    var incrB = function() { obj.counterB += 1; };
    obj.listenToOnce(obj, 'event', incrA);
    obj.listenToOnce(obj, 'event', incrB);
    obj.trigger('event');
    expect(obj.counterA).toEqual(1, 'counterA should have only been incremented once.');
    expect(obj.counterB).toEqual(1, 'counterB should have only been incremented once.');
  });

  it("listenToOnce and stopListening", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenToOnce(b, 'all', function() { expect(true).toBeTruthy(); });
    b.trigger('anything');
    b.trigger('anything');
    a.listenToOnce(b, 'all', function() { expect(true).toBeFalsy(); });
    a.stopListening();
    b.trigger('anything');
  });

  it("listenTo, listenToOnce and stopListening", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenToOnce(b, 'all', function() { expect(true).toBeTruthy(); });
    b.trigger('anything');
    b.trigger('anything');
    a.listenTo(b, 'all', function() { expect(true).toBeFalsy(); });
    a.stopListening();
    b.trigger('anything');
  });

  it("listenTo and stopListening with event maps", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenTo(b, {change: function() { expect(true).toBeTruthy(); }});
    b.trigger('change');
    a.listenTo(b, {change: function() { expect(true).toBeFalsy(); }});
    a.stopListening();
    b.trigger('change');
  });

  it("listenTo yourself", function() {
    var e = _.extend({}, PublisherSubscriber.InstanceMembers);
    var n = 0;
    e.listenTo(e, "foo", function() { ++n; });
    e.trigger("foo");
    expect(n).toBe(1);
  });

  it("listenTo yourself cleans yourself up with stopListening", function() {
    var e = _.extend({}, PublisherSubscriber.InstanceMembers);
    var n = 0;
    e.listenTo(e, "foo", function() { ++n; });
    e.trigger("foo");
    expect(n).toBe(1);
    e.stopListening();
    e.trigger("foo");
    expect(n).toBe(1);
  });

  it("stopListening cleans up references", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var fn = function() {};
    b.on('event', fn);
    a.listenTo(b, 'event', fn).stopListening();
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn).stopListening(b);
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn).stopListening(b, 'event');
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn).stopListening(b, 'event', fn);
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
  });

  it("stopListening cleans up references from listenToOnce", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var fn = function() {};
    b.on('event', fn);
    a.listenToOnce(b, 'event', fn).stopListening();
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenToOnce(b, 'event', fn).stopListening(b);
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenToOnce(b, 'event', fn).stopListening(b, 'event');
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenToOnce(b, 'event', fn).stopListening(b, 'event', fn);
    expect(_.size(a._3)).toBe(0);
    expect(_.size(b._2.event)).toBe(3);
    //expect(_.size(b._listeners)).toBe(0);
  });

  it("listenTo and off cleaning up references", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var fn = function() {};
    a.listenTo(b, 'event', fn);
    b.off();
    expect(_.size(a._3)).toBe(0);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn);
    b.off('event');
    expect(_.size(a._3)).toBe(0);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn);
    b.off(null, fn);
    expect(_.size(a._3)).toBe(0);
    //expect(_.size(b._listeners)).toBe(0);
    a.listenTo(b, 'event', fn);
    b.off(null, null, a);
    expect(_.size(a._3)).toBe(0);
    //expect(_.size(b._listeners)).toBe(0);
  });

  it("listenTo and stopListening cleaning up references", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenTo(b, 'all', function() { expect(true).toBeTruthy(); });
    b.trigger('anything');
    a.listenTo(b, 'other', function() { expect(true).toBeFalsy(); });
    a.stopListening(b, 'other');
    a.stopListening(b, 'all');
    expect(_.size(a._3)).toBe(0);
  });

  it("listenToOnce without context cleans up references after the event has fired", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenToOnce(b, 'all', function() { expect(true).toBeTruthy(); });
    b.trigger('anything');
    expect(_.size(a._3)).toBe(0);
  });

  it("listenToOnce with event maps cleans up references", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    var eventMap = {
      one: function() { expect(true).toBeTruthy(); }, two: function() { expect(true).toBeFalsy(); }
    };
    spyOn(eventMap, 'one');
    a.listenToOnce(b, eventMap);
    b.trigger('one');
    expect(eventMap.one.calls.count()).toBe(1);
    expect(_.size(a._3)).toBe(1);
  });

  it("listenToOnce with event maps binds the correct `this`", function() {
    var a = _.extend({}, PublisherSubscriber.InstanceMembers);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers);
    a.listenToOnce(b, {
      one: function() { expect(this).toBe(a); }, two: function() { expect(true).toBeFalsy(); }
    });
    b.trigger('one');
  });

  it("listenTo with empty callback doesn't throw an error", function() {
    var e = _.extend({}, PublisherSubscriber.InstanceMembers);
    e.listenTo(e, "foo", null);
    e.trigger("foo");
    expect(true).toBeTruthy();
  });

  it("trigger all for each event", function() {
    var a, b, obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    obj.on('all', function(event) {
        obj.counter++;
        if (event == 'a') a = true;
        if (event == 'b') b = true;
      })
      .trigger('a b');
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(obj.counter).toBe(2);
  });

  it("on, then unbind all functions", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var callback = function() { obj.counter += 1; };
    obj.on('event', callback);
    obj.trigger('event');
    obj.off('event');
    obj.trigger('event');
    expect(obj.counter).toEqual(1, 'counter should have only been incremented once.');
  });

  it("bind two callbacks, unbind only one", function() {
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var callback = function() { obj.counterA += 1; };
    obj.on('event', callback);
    obj.on('event', function() { obj.counterB += 1; });
    obj.trigger('event');
    obj.off('event', callback);
    obj.trigger('event');
    expect(obj.counterA).toEqual(1, 'counterA should have only been incremented once.');
    expect(obj.counterB).toEqual(2, 'counterB should have been incremented twice.');
  });

  it("unbind a callback in the midst of it firing", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var callback = function() {
      obj.counter += 1;
      obj.off('event', callback);
    };
    obj.on('event', callback);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    expect(obj.counter).toEqual(1, 'the callback should have been unbound.');
  });

  it("two binds that unbind themeselves", function() {
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var incrA = function() {
      obj.counterA += 1;
      obj.off('event', incrA);
    };
    var incrB = function() {
      obj.counterB += 1;
      obj.off('event', incrB);
    };
    obj.on('event', incrA);
    obj.on('event', incrB);
    obj.trigger('event');
    obj.trigger('event');
    obj.trigger('event');
    expect(obj.counterA).toEqual(1, 'counterA should have only been incremented once.');
    expect(obj.counterB).toEqual(1, 'counterB should have only been incremented once.');
  });

  it("bind a callback with a supplied context", function() {
    var TestClass = function() {
      return this;
    };
    TestClass.prototype.assertTrue = function() {
      expect(true).toBeTruthy('`this` was bound to the callback');
    };

    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.on('event', function() { this.assertTrue(); }, (new TestClass));
    obj.trigger('event');
  });

  it("nested trigger with unbind", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var incr1 = function() {
      obj.counter += 1;
      obj.off('event', incr1);
      obj.trigger('event');
    };
    var incr2 = function() { obj.counter += 1; };
    obj.on('event', incr1);
    obj.on('event', incr2);
    obj.trigger('event');
    expect(obj.counter).toEqual(3, 'counter should have been incremented three times');
  });

  it("callback list is not altered during trigger", function() {
    var counter = 0, obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var incr = function() { counter++; };
    var incrOn = function() { obj.on('event all', incr); };
    var incrOff = function() { obj.off('event all', incr); };

    obj.on('event all', incrOn).trigger('event');
    expect(counter).toEqual(0, 'on does not alter callback list');

    obj.off().on('event', incrOff).on('event all', incr).trigger('event');
    expect(counter).toEqual(2, 'off does not alter callback list');
  });

  it("#1282 - 'all' callback list is retrieved after each event.", function() {
    var counter = 0;
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var incr = function() { counter++; };
    obj.on('x', function() {
        obj.on('y', incr).on('all', incr);
      })
      .trigger('x y');
    expect(counter).toBe(2);
  });

  it("if no callback is provided, `on` is a noop", function() {
    _.extend({}, PublisherSubscriber.InstanceMembers).on('test').trigger('test');
  });

  it("if callback is truthy but not a function, `on` should throw an error just like jQuery", function() {
    var view = _.extend({}, PublisherSubscriber.InstanceMembers).on('test', 'noop');
    expect(function() {
      view.trigger('test');
    }).toThrow();
  });

  it("remove all events for a specific context", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.on('x y all', function() { expect(true).toBeTruthy(); });
    obj.on('x y all', function() { expect(true).toBeFalsy(); }, obj);
    obj.off(null, null, obj);
    obj.trigger('x y');
  });

  it("remove all events for a specific callback", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var success = function() { expect(true).toBeTruthy(); };
    var fail = function() { expect(true).toBeFalsy(); };
    obj.on('x y all', success);
    obj.on('x y all', fail);
    obj.off(null, fail);
    obj.trigger('x y');
  });

  it("#1310 - off does not skip consecutive events", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.on('event', function() { expect(true).toBeFalsy(); }, obj);
    obj.on('event', function() { expect(true).toBeFalsy(); }, obj);
    obj.off(null, null, obj);
    obj.trigger('event');
  });

  it("once", function() {
    // Same as the previous test, but we use once rather than having to explicitly unbind
    var obj = {counterA: 0, counterB: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    var incrA = function() {
      obj.counterA += 1;
      obj.trigger('event');
    };
    var incrB = function() { obj.counterB += 1; };
    obj.once('event', incrA);
    obj.once('event', incrB);
    obj.trigger('event');
    expect(obj.counterA).toEqual(1, 'counterA should have only been incremented once.');
    expect(obj.counterB).toBe(1, 'counterB should have only been incremented once.');
  });

  it("once variant one", function() {
    var f = function() { expect(true).toBeTruthy(); };

    var a = _.extend({}, PublisherSubscriber.InstanceMembers).once('event', f);
    var b = _.extend({}, PublisherSubscriber.InstanceMembers).on('event', f);

    a.trigger('event');

    b.trigger('event');
    b.trigger('event');
  });

  it("once variant two", function() {
    var f = function() { expect(true).toBeTruthy(); };
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);

    obj
      .once('event', f)
      .on('event', f)
      .trigger('event')
      .trigger('event');
  });

  it("once with off", function() {
    var f = function() { expect(true).toBeTruthy(); };
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);

    obj.once('event', f);
    obj.off('event', f);
    obj.trigger('event');
  });

  it("once with event maps", function() {
    var obj = {counter: 0};
    _.extend(obj, PublisherSubscriber.InstanceMembers);

    var increment = function() {
      this.counter += 1;
    };

    obj.once({
      a: increment, b: increment, c: increment
    }, obj);

    obj.trigger('a');
    expect(obj.counter).toBe(1);

    obj.trigger('a b');
    expect(obj.counter).toBe(2);

    obj.trigger('c');
    expect(obj.counter).toBe(3);

    obj.trigger('a b c');
    expect(obj.counter).toBe(3);
  });

  it('bind a callback with a supplied context using once with object notation', function() {
    var obj = {counter: 0};
    var context = {};
    _.extend(obj, PublisherSubscriber.InstanceMembers);
    obj.once({
      a: function() {
        ++obj.counter;
        // defaults `context` to `callback` param
        expect(this).toBe(context);
      }
    }, context).trigger('a');
    expect(obj.counter).toBe(1);
  });

  it("once with off only by context", function() {
    var context = {};
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.once('event', function() { expect(true).toBeFalsy(); }, context);
    obj.off(null, null, context);
    obj.trigger('event');
  });

  it("once with asynchronous events", function(done) {
    var func = _.debounce(function() {
      expect(true).toBeTruthy();
      done();
    }, 50);
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers).once('async', func);

    obj.trigger('async');
    obj.trigger('async');
  });

  it("once with multiple events.", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.once('x y', function() { expect(true).toBeTruthy(); });
    obj.trigger('x y');
  });

  it("Off during iteration with once.", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var f = function() { this.off('event', f); };
    obj.on('event', f);
    obj.once('event', function() {});
    obj.on('event', function() { expect(true).toBeTruthy(); });

    obj.trigger('event');
    obj.trigger('event');
  });

  it("`once` on `all` should work as expected", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.once('all', function() {
      expect(true).toBeTruthy();
      obj.trigger('all');
    });
    obj.trigger('all');
  });

  it("once without a callback is a noop", function() {
    _.extend({}, PublisherSubscriber.InstanceMembers).once('event').trigger('event');
  });

  it("listenToOnce without a callback is a noop", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    obj.listenToOnce(obj, 'event').trigger('event');
  });

  it("event functions are chainable", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var obj2 = _.extend({}, PublisherSubscriber.InstanceMembers);
    var fn = function() {};
    expect(obj).toBe(obj.trigger('noeventssetyet'));
    expect(obj).toBe(obj.off('noeventssetyet'));
    expect(obj).toBe(obj.stopListening('noeventssetyet'));
    expect(obj).toBe(obj.on('a', fn));
    expect(obj).toBe(obj.once('c', fn));
    expect(obj).toBe(obj.trigger('a'));
    expect(obj).toBe(obj.listenTo(obj2, 'a', fn));
    expect(obj).toBe(obj.listenToOnce(obj2, 'b', fn));
    expect(obj).toBe(obj.off('a c'));
    expect(obj).toBe(obj.stopListening(obj2, 'a'));
    expect(obj).toBe(obj.stopListening());
  });

  it("#3448 - listenToOnce with space-separated events", function() {
    var one = _.extend({}, PublisherSubscriber.InstanceMembers);
    var two = _.extend({}, PublisherSubscriber.InstanceMembers);
    var count = 1;

    one.fn = function(n) { expect(n).toBe(count++); };
    spyOn(one, 'fn');

    one.listenToOnce(two, 'x y', one.fn);

    two.trigger('x', 1);
    expect(one.fn.calls.count()).toEqual(1);

    two.trigger('x', 1);
    expect(one.fn.calls.count()).toEqual(1);

    two.trigger('y', 2);
    expect(one.fn.calls.count()).toEqual(2);

    two.trigger('y', 2);
    expect(one.fn.calls.count()).toEqual(2);
  });

  it("Callback as property name (bind)", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var counter = 0;
    obj.fn = function() { counter++; };

    obj.on('event', 'fn');
    obj.trigger('event');
    expect(counter).toBe(1);
    obj.off('event', 'fn');
    counter = 0;

    obj.on({event: 'fn'});
    obj.trigger('event');
    expect(counter).toBe(1);
    obj.off({event: 'fn'});
    counter = 0;

    obj.once('event', 'fn');
    obj.trigger('event');
    obj.trigger('event');
    expect(counter).toBe(1);
    counter = 0;
  });

  it("Callback as property name (listenTo)", function() {
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var counter = 0;
    obj.fn = function() { counter++; };

    obj.listenTo(obj, 'event', 'fn');
    obj.trigger('event');
    expect(counter).toEqual(1);
    obj.stopListening(obj, 'event', 'fn');
    counter = 0;

    obj.listenTo(obj, {event: 'fn'});
    obj.trigger('event');
    expect(counter).toEqual(1);
    obj.stopListening(obj, {event: 'fn'});
    counter = 0;

    obj.listenToOnce(obj, 'event', 'fn');
    obj.trigger('event');
    obj.trigger('event');
    expect(counter).toBe(1);
    counter = 0;
  });

  it("Fast properties", function() {
    return;
    var obj = _.extend({}, PublisherSubscriber.InstanceMembers);
    var counter = 0;
    obj.fn = function() { counter++; };

    obj.listenTo(obj, 'namespace:event', 'fn');
    expect(_.keys(obj._2)[0]).toBe('namespace_event');
    obj.trigger('namespace:event');
    expect(counter).toEqual(1);
    obj.stopListening(obj, 'namespace:event', 'fn');
    counter = 0;

    obj.listenTo(obj, {'namespace:event': 'fn'});
    expect(_.keys(obj._2)[0]).toBe('namespace_event');
    obj.trigger('namespace:event');
    expect(counter).toEqual(1);
    obj.stopListening(obj, {'namespace:event': 'fn'});
    counter = 0;

    obj.listenToOnce(obj, 'namespace:event', 'fn');
    expect(_.keys(obj._2)[0]).toBe('namespace_event');
    obj.trigger('namespace:event');
    obj.trigger('namespace:event');
    expect(counter).toBe(1);
    counter = 0;
  });
});

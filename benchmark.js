var _                   = require('lodash');
var PublisherSubscriber = require('./build/publisher-subscriber.min.js').InstanceMembers;
var BackboneEvents      = require('./node_modules/backbone/backbone-min.js').Events;
var Benchmark           = require('benchmark');

function nop() {}

function iteration(Events) {
    var o1 = _.extend({}, Events);
    var o2 = _.extend({}, Events);
    var o3 = _.extend({}, Events);
    var o4 = _.extend({}, Events);
    var o5 = _.extend({}, Events);

    o1.on('event1', nop);
    o1.on({event2: nop, event3: nop}, o1);
    o1.once('event1', nop);
    o1.once({event1: nop}, nop, o1);
    o1.trigger('event1', 1000, 'Hello world!', {});
    o1.listenTo(o5, 'event2', nop);

    o1.listenTo(o2, 'event1', nop);
    o1.listenTo(o3, 'event2', nop);
    o1.listenToOnce(o2, {event4: nop, event5: nop});
    o1.trigger('event2', [1, 2, 3, 4], 'string');

    o2.stopListening(o1);
    o2.on('event1', nop);
    o2.listenToOnce(o3, {event1: nop});
    o2.trigger('event2 event3 event4', [1, 2, 3], 'one', 'two');

    o3.once({event2: nop}, o4);
    o3.listenTo(o2, 'event2', o1);
    o3.stopListening();
    o3.trigger('event1 event5', 1, 2, 3, 4, 5);

    o4.on('event1', nop);
    o4.off('event2');
    o4.on('event1', nop, o1);
    o4.on('event1 event2 event3', nop, o3);
    o4.off('event99', null, null);

    o5.listenTo(o1, 'event1 event2 event3', nop);
    o5.listenTo(o5, {'event1 event2 event3': nop});
    o5.off(null, nop);
    o5.trigger('event1 event2 event3', 1, 2, false, true);

    o5.on('namespace:event1', nop);
    o5.listenTo(o2, {'namespace:event2': nop, event3: nop});
    o1.trigger('event1 event3');
    o1.listenTo(o5, 'namespace:event1', nop);
    o5.trigger('namespace:event1', 5);

    var objs = [o1, o2, o3, o4, o5];
    for (var i = 0; i < objs.length; ++i) {
        objs[i].off();
        objs[i].stopListening();
    }
}

var suite = new Benchmark.Suite();

suite
    .add('BackboneEvents', function() {
        iteration(BackboneEvents);
    })
    .add('PublisherSubscriber', function() {
        iteration(PublisherSubscriber);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })
    .run();

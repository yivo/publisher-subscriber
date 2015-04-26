describe('Events', function() {
  var Model, View, model, view;
  Model = (function() {
    function Model() {}

    Model.prototype.onChange = function() {};

    return Model;

  })();
  View = (function() {
    function View() {}

    View.prototype.render = function() {};

    return View;

  })();
  _.extend(Model.prototype, PublisherSubscriber);
  _.extend(View.prototype, PublisherSubscriber);
  model = null;
  view = null;
  beforeEach(function() {
    model = new Model();
    view = new View();
    spyOn(model, 'onChange');
    return spyOn(view, 'render');
  });
  describe('binding events', function() {
    it('should correctly bind event', function() {
      var obj;
      model.on('change', view.render, view);
      expect(model._events.change).toEqual([view, view.render]);
      obj = {};
      obj[model.oid] = model;
      return expect(view._subscribedTo).toEqual(obj);
    });
    it('should correctly bind many events', function() {
      model.on('nameChange   ageChange', view.render, view);
      expect(model._events.nameChange).toEqual([view, view.render]);
      return expect(model._events.ageChange).toEqual([view, view.render]);
    });
    it('should correctly bind hash of events', function() {
      var events, obj;
      events = {
        'nameChange  ageChange': view.render,
        'nameChange': view.onNameChange
      };
      model.bind(events, view);
      expect(model._events.nameChange).toEqual([view, view.render, view, view.onNameChange]);
      expect(model._events.ageChange).toEqual([view, view.render]);
      obj = {};
      obj[model.oid] = model;
      return expect(view._subscribedTo).toEqual(obj);
    });
    return it('should correctly handle method when it is string', function() {
      model.on('change', 'render', view);
      return expect(model._events.change).toEqual([view, view.render]);
    });
  });
  describe('unbinding events', function() {
    it('should correctly unbind all events', function() {
      model.on('change', view.render, view);
      model.off();
      expect(model._events).toBeNull();
      return expect(view._subscribedTo).toEqual({});
    });
    it('should correctly unbind event by context', function() {
      model.on('foo bar', view.render, view);
      model.off(view);
      expect(model._events).toEqual({
        foo: [],
        bar: []
      });
      return expect(view._subscribedTo).toEqual({});
    });
    it('should correctly unbind event by name', function() {
      model.on('change', view.render, view);
      model.off('change');
      expect(model._events).toEqual({});
      return expect(view._subscribedTo).toEqual({});
    });
    return it('should correctly unbind event by both name and context', function() {
      model.on('change', view.render, view);
      model.off(view, 'change');
      expect(model._events).toEqual({
        change: []
      });
      return expect(view._subscribedTo).toEqual({});
    });
  });
  return describe('notifying about events', function() {
    it('should notify subscribers about events', function() {
      model.on('change', view.render, view);
      model.notify('change');
      return expect(view.render).toHaveBeenCalled();
    });
    it("should notify publisher's callback", function() {
      model.on('change', view.render, view);
      model.notify('change');
      return expect(model.onChange).toHaveBeenCalled();
    });
    return it('should notify once and unbind event', function() {
      model.once('change', view.render, view);
      model.notify('change');
      expect(model.onChange).toHaveBeenCalled();
      expect(view.render).toHaveBeenCalled();
      expect(model._events).toEqual({
        change: []
      });
      return expect(view._subscribedTo).toEqual({});
    });
  });
});

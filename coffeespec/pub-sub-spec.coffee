describe 'Events', ->

  class Model
    onChange: ->

  class View
    render: ->

  _.extend Model::, PublisherSubscriber
  _.extend View::, PublisherSubscriber

  model = null
  view  = null

  beforeEach ->
    model = new Model()
    view = new View()
    spyOn model, 'onChange'
    spyOn view, 'render'

  describe 'binding events', ->

    it 'should correctly bind event', ->
      model.on 'change', view.render, view
      expect(model._events.change).toEqual [view, view.render]

      obj = {}
      obj[model.oid] = model
      expect(view._subscribedTo).toEqual obj

    it 'should correctly bind many events', ->
      model.on 'nameChange   ageChange', view.render, view
      expect(model._events.nameChange).toEqual [view, view.render]
      expect(model._events.ageChange).toEqual [view, view.render]

    it 'should correctly bind hash of events', ->
      events =
        'nameChange  ageChange': view.render
        'nameChange': view.onNameChange

      model.bind(events, view)
      expect(model._events.nameChange).toEqual [view, view.render, view, view.onNameChange]
      expect(model._events.ageChange).toEqual [view, view.render]

      obj = {}
      obj[model.oid] = model
      expect(view._subscribedTo).toEqual obj

    it 'should correctly handle method when it is string', ->
      model.on('change', 'render', view)
      expect(model._events.change).toEqual [view, view.render]

  describe 'unbinding events', ->

    it 'should correctly unbind all events', ->
      model.on 'change', view.render, view
      model.off()
      expect(model._events).toBeNull()
      expect(view._subscribedTo).toEqual {}

    it 'should correctly unbind event by context', ->
      model.on 'foo bar', view.render, view
      model.off(view)
      expect(model._events).toEqual foo: [], bar: []
      expect(view._subscribedTo).toEqual {}

    it 'should correctly unbind event by name', ->
      model.on 'change', view.render, view
      model.off('change')
      expect(model._events).toEqual {}
      expect(view._subscribedTo).toEqual {}

    it 'should correctly unbind event by both name and context', ->
      model.on 'change', view.render, view
      model.off(view, 'change')
      expect(model._events).toEqual change: []
      expect(view._subscribedTo).toEqual {}

  describe 'notifying about events', ->

    it 'should notify subscribers about events', ->
      model.on 'change', view.render, view
      model.notify 'change'
      expect(view.render).toHaveBeenCalled()

    it "should notify publisher's callback", ->
      model.on 'change', view.render, view
      model.notify 'change'
      expect(model.onChange).toHaveBeenCalled()

    it 'should notify once and unbind event', ->
      model.once 'change', view.render, view
      model.notify 'change'
      expect(model.onChange).toHaveBeenCalled()
      expect(view.render).toHaveBeenCalled()
      expect(model._events).toEqual change: []
      expect(view._subscribedTo).toEqual {}

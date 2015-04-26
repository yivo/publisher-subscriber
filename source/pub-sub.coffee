exports = {}

# Set callback to be invoked when object notifies about events
#
# @example Render view when model changes:
#   model.on 'change', view.render, view
#
# @param events {String} Event names separated by space
# @param callback {String|Function} Callback or its name which will be invoked
# @param subscriber {Object} Object which subscribes events. Subscriber will be used as context for callback
#
exports.on = (events, callback, subscriber) ->
  subscriptions = (@_events ||= {})
  subscriber  ||= @

  # @see http://jsperf.com/regex-split-vs-loop
  len = events.length
  i = -1
  j = 0
  while ++i <= len
    if i is len or events[i] is ' '
      if j > 0
        (subscriptions[events[i - j...i]] ||= []).push subscriber, mapMethod(subscriber, callback)
      j = 0
    else ++j

  (subscriber._subscribedTo ||= {})[@oid ||= genOid()] = @
  this

# Version of `on` which works the same way, but callback will be invoked only once
#
# @example Initialize dependencies:
#   app.once 'start', 'startRouting', router
#
# @param events {String}
# @param callback {String|Function}
# @param subscriber {Object}
#
exports.once = (events, callback, subscriber) ->
  self = @
  wrapper = ->
    callback.apply(@, arguments)

    # Micro optimization
    multipleEvents = events.indexOf(' ') > -1
    if multipleEvents
      self.off(subscriber, null, wrapper)
    else
      self.off(subscriber, events, wrapper)

  @on events, wrapper, subscriber

# Version of `on` which works well with events specified as object
#
# @example Bind many events:
#   model.bind
#     positionChange: 'reorder'
#     valueChange: 'updateValue'
#   , view
#
# @param events {String|Object}
# @param callback {String|Function}
# @param subscriber {Object}
#
exports.bind = (events, callback, subscriber) ->
  if isObject(events)
    for event, cb of events
      @on(event, cb, callback) # callback is context here
  else
    @on(events, cb, subscriber)
  this

exports.off = exports.unbind = (arg1, arg2, arg3) ->
  return this unless @_events
  oid = @oid ||= genOid()

  # obj.off()
  if arguments.length is 0
    for event, subscriptions of @_events
      for subscriber in subscriptions by 2
        delete subscriber._subscribedTo[oid]
    @_events = null

  # obj.off('event')
  else if isString(arg1)
    event = arg1
    for subscriber in @_events[event] by 2
      delete subscriber._subscribedTo[oid]
    delete @_events[event]

  else
    subscriber = arg1
    event      = arg2
    callback   = arg3

    deleted = !subscriber or delete subscriber._subscribedTo[oid]

    if deleted
      # obj.off(other, 'event')
      # obj.off(null, 'event')
      # obj.off(other, 'event', cb)
      # obj.off(null, 'event', cb)
      if event
        filterSubscriptions(subscriber, callback, @_events[event])

      # obj.off(other, null)
      # obj.off(other, null, cb)
      # obj.off(null, null, cb)
      else
        for event, subscriptions of @_events
          filterSubscriptions(subscriber, callback, subscriptions)
  this

exports.subscribe = (publisher, events, callback) ->
  publisher.on(events, callback, this)

exports.unsubscribe = ->
  if @_subscribedTo
    for oid, publisher of @_subscribedTo
      publisher.off(this)
  this

exports.notify = (event) ->
  callback = @['on' + event[0].toUpperCase() + event.slice(1)]

  if callback
    args = slice.call(arguments, 1)
    if args[0] is this
      args.shift()
      omitted = yes
    apply(callback, this, args)

  if @_events
    givenEvent = @_events[event]
    allEvents = @_events.all

    if givenEvent and givenEvent.length
      args ||= slice.call(arguments, 1)

      if omitted
        args.unshift(this)
        omitted = no

      fireCallbacks(givenEvent, args)

    if allEvents and allEvents.length
      if args
        args.unshift(this) if omitted
        args.unshift(event)
      else
        args = slice.call(arguments)

      fireCallbacks(allEvents, args)
  this

{isFunction, isObject, isString, uniqueId} = _

slice = Array::slice

mapMethod = (object, method) ->
  if isFunction(method) then method else object and object[method]

genOid = ->
  +uniqueId()

filterSubscriptions = (subscriber, callback, data) ->
  i = -2
  len = data.length

  # Micro optimization
  if !subscriber and !data
    data.splice(0, len)
  else
    while (i += 2) < len
      if (!subscriber or data[i] is subscriber) and (!callback or data[i + 1] is callback)
        data.splice(i, 2)
        i -= 2
        len -= 2
  return

# @see http://jsperf.com/apply-vs-custom-apply
apply = (func, obj, args) ->
  arg1 = args[0]
  arg2 = args[1]
  arg3 = args[2]
  switch args.length
    when 0 then func.call(obj)
    when 1 then func.call(obj, arg1)
    when 2 then func.call(obj, arg1, arg2)
    when 3 then func.call(obj, arg1, arg2, arg3)
    else func.apply(obj, args)

# @see http://jsperf.com/apply-vs-custom-apply
fireCallbacks = (data, args) ->
  arg1 = args[0]
  arg2 = args[1]
  arg3 = args[2]

  switch args.length
    when 0
      data[i + 1].call(ctx) for ctx, i in data by 2
    when 1
      data[i + 1].call(ctx, arg1) for ctx, i in data by 2
    when 2
      data[i + 1].call(ctx, arg1, arg2) for ctx, i in data by 2
    when 3
      data[i + 1].call(ctx, arg1, arg2, arg3) for ctx, i in data by 2
    else
      data[i + 1].apply(ctx, args) for ctx, i in data by 2
  return

exports
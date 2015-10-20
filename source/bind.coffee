do ->
  onceWrap = (pub, event, callback, context) ->
    run     = false
    wrapper = ->
      if not run
        run = true
        pub.off(event, wrapper, context)
        callback.apply(context, arguments)
        return
    wrapper._cb = callback
    wrapper

  bind__Base = (object, event, callback, context, once) ->
    cb = if once then onceWrap(object, event, callback, context) else callback
    ((object._pb ||= {})[event] ||= []).push(undefined, cb, context)

  bind__EventString = (object, events, callback, context, once) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          bind__Base(object, events[i - j...i], callback, context, once)
          j = 0
      else ++j
    return

  bind__EventMap = (object, hash, context, once) ->
    for events of hash
      bind__EventString(object, events, resolveCallback(object, hash[events]), context, once)
    return

  for own k, v of { bind: false, bindOnce: true }
    do (method = k, once = v) ->

      PB[method] = (events, callback, context) ->
        if typeof events is 'string'

          if callback # Added here for spec: "if no callback is provided, `on` is a noop"
            bind__EventString(this, events, resolveCallback(this, callback), context or this, once)

        else
          bind__EventMap(this, events, context or callback or this, once)
        this

  PB.on   = PB.bind
  PB.once = PB.bindOnce
  return
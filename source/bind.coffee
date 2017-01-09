do ->
  onceWrap = (pub, event, callback, context) ->
    run     = false
    wrapper = ->
      if run is false
        run = true
        pub.off(event, wrapper, context)
        callback.apply(context, arguments)
      return
    wrapper._cb = callback
    wrapper

  bind__Base = (object, event, callback, context, once) ->
    cb = if once is true then onceWrap(object, event, callback, context) else callback
    safeAccessListeners(object, event).push(undefined, cb, context)
    return

  bind__EventString = (object, events, callback, context, once) ->
    if events.indexOf(' ') is -1
      bind__Base(object, events, callback, context, once)
    else
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
    for events in objectKeys(hash)
      bind__EventString(object, events, resolveCallback(object, hash[events]), context, once)
    return

  for method, i in ['on', 'once']
    do (method, once = i is 1) ->

      PS[method] = (events, callback, context) ->
        if events?
          if typeof events is 'string'

            if callback? # Added here for spec: "if no callback is provided, `on` is a noop"
              bind__EventString(this, events, resolveCallback(this, callback), context ? this, once)

          else
            bind__EventMap(this, events, context ? callback ? this, once)
        this
  
  PS.bind = PS.on
  return

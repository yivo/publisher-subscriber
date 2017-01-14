bind__onceWrap = (object, event, callback, callcontext) ->
  run     = false
  wrapper = ->
    if run is false
      run = true
      object.off(event, wrapper)
      callback.apply(callcontext, arguments)
    return
  wrapper.__wrapped__ = callback
  wrapper

bind__Base = (object, event, callback, usercontext, callcontext, once) ->
  cb = if once is true then bind__onceWrap(object, event, callback, callcontext) else callback
  safeAccessListeners(object, event).push(null, cb, usercontext, callcontext)
  return

bind__EventString = (object, events, callback, usercontext, callcontext, once) ->
  if events.indexOf(' ') is -1
    bind__Base(object, events, callback, usercontext, callcontext, once)
  else
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          bind__Base(object, events[i - j...i], callback, usercontext, callcontext, once)
          j = 0
      else 
        ++j
  return

bind__EventMap = (object, hash, usercontext, callcontext, once) ->
  for events in objectKeys(hash)
    bind__EventString(object, events, resolveCallback(object, hash[events]), usercontext, callcontext, once)
  return

do ->
  for method, i in ['on', 'once']
    PS[method] = do (once = i is 1) ->
      (events) ->
        args       = arguments
        argslength = arguments.length
        
        if typeof events is 'string'
          if argslength > 1 and typeof (callback = resolveCallback(this, args[1])) is 'function'
            usercontext = args[2] if argslength > 2
            callcontext = if argslength > 2 then usercontext else this
            bind__EventString(this, events, callback, usercontext, callcontext, once)
    
        else if typeof events is 'object' and events isnt null
          if argslength > 2
            callcontext = usercontext = args[2]
          else if argslength > 1
            callcontext = usercontext = args[1]
          else
            callcontext = this
          bind__EventMap(this, events, usercontext, callcontext, once)
        this

PS.bind = PS.on

listenTo__onceWrap = (pub, sub, event, callback) ->
  run     = false
  wrapper = ->
    if run is false
      run = true
      sub.stopListening(pub, event, wrapper)
      callback.apply(sub, arguments)
    return
  wrapper.__wrapped__ = callback
  wrapper

listenTo__Base = (pub, sub, event, callback, once) ->
  cb = if once is true then listenTo__onceWrap(pub, sub, event, callback) else callback
  safeAccessListeners(pub, event).push(sub, cb, sub, sub)
  increaseListeningCount(pub, sub)
  return

listenTo__EventString = (pub, sub, events, callback, once) ->
  if events.indexOf(' ') is -1
    listenTo__Base(pub, sub, events, callback, once)
  else
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          listenTo__Base(pub, sub, events[i - j...i], callback, once)
          j = 0
      else 
        ++j
  return

listenTo__EventMap = (pub, sub, hash, once) ->
  for events in objectKeys(hash)
    listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once)
  return
  
do ->
  for method, i in ['listenTo', 'listenToOnce']
    PS[method] = do (once = i is 1) ->
      (object, events, callback) ->
        args       = arguments
        argslength = args.length
        
        if typeof events is 'string'
          if argslength > 2 and typeof (callback = resolveCallback(this, args[2])) is 'function'
            listenTo__EventString(object, this, events, callback, once)
        
        else if typeof events is 'object' and events isnt null
          listenTo__EventMap(object, this, events, once)
        this

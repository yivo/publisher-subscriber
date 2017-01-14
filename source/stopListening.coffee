stopListening__filterEntries = (e, sub, cb) ->
  l = e.length
  r = []
  k = -1

  while (k+=4) < l
    if sub isnt e[k-3] or (cb? and cb not in [e[k-2], e[k-2].__wrapped__])
      r.push(e[k-3], e[k-2], e[k-1], e[k])
  r

stopListening__Base = (pub, sub, event, callback) ->
  n         = 0
  listeners = pub.__listeners__

  if (entries = listeners[event])?
    l  = entries.length
    n += l
    
    if l > 3
      filtered         = stopListening__filterEntries(entries, sub, callback)
      n               -= filtered.length
      listeners[event] = filtered
    else
      listeners[event] = []
    
  decrementListeningCount(pub, sub, n / 4) if n > 0
  return

stopListening__Everything__Iteratee = (pub, sub) ->
  n         = 0
  listeners = pub.__listeners__
  
  for event in objectKeys(listeners)
    entries = listeners[event]
    l       = entries.length
    n      += l
    
    if l > 3
      filtered         = stopListening__filterEntries(entries, sub, null)
      n               -= filtered.length
      listeners[event] = filtered
    else
      listeners[event] = []
      
  decrementListeningCount(pub, sub, n / 4) if n > 0
  return

stopListening__Everything = (sub) ->
  listening = sub.__listening__
  for oid in objectKeys(listening)
    stopListening__Everything__Iteratee(listening[oid][0], sub)
  return

stopListening__EventString = (pub, sub, events, callback) ->
  l = events.length
  i = -1
  j = 0
  while ++i <= l
    if i is l or events[i] is ' '
      if j > 0
        stopListening__EventString__Iteratee(pub, sub, events[i - j...i], callback)
        j = 0
    else ++j
  return

stopListening__EventString__Iteratee = (pub, sub, event, callback) ->
  listening = sub.__listening__
  for oid in objectKeys(listening)
    pair = listening[oid]
    if !pub? or pair[0] is pub
      stopListening__Base(pair[0], sub, event, callback)
  return

stopListening__EventMap = (pub, sub, hash) ->
  for events in objectKeys(hash)
    stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]))
  return

stopListening__AnyEvent = (pub, sub, callback) ->
  listening = sub.__listening__
  for oid in objectKeys(listening)
    pair = listening[oid]
    if !pub? or pair[0] is pub
      listeners = pair[0].__listeners__
      for event in objectKeys(listeners)
        stopListening__Base(pair[0], sub, event, callback)
  return

PS.stopListening = (object, events) ->
  if @__listening__?
    args       = arguments
    argslength = args.length
    
    if argslength is 0
      stopListening__Everything(this)
    
    else if typeof events is 'string'
      stopListening__EventString(object, this, events, resolveCallback(this, args[2]) if argslength > 2)

    else if typeof events is 'object' and events isnt null
      stopListening__EventMap(object, this, events)

    else
      stopListening__AnyEvent(object, this, resolveCallback(this, args[2]) if argslength > 2)
  this

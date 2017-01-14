unbind__Base = (object, event, callback, usercontext) ->
  return unless (e = object.__listeners__[event])?
  return if     (l = e.length) < 4

  r = []
  k = -1

  while (k+=4) < l

    if callback in [undefined, null, e[k-2], e[k-2].__wrapped__] and usercontext in [ANY_CONTEXT, e[k-1]]
      decrementListeningCount(object, sub, 1) if (sub = e[k-3])?

    else
      r.push(e[k-3], e[k-2], e[k-1], e[k])

  object.__listeners__[event] = r
  return

unbind__EventString = (object, events, callback, context) ->
  l = events.length
  i = -1
  j = 0
  while ++i <= l
    if i is l or events[i] is ' '
      if j > 0
        unbind__Base(object, events[i - j...i], callback, context)
        j = 0
    else 
      ++j
  return

unbind__EventMap = (object, hash, context) ->
  for events in objectKeys(hash)
    unbind__EventString(object, events, resolveCallback(object, hash[events]), context)
  return

unbind__Everything = (object) ->
  listeners = object.__listeners__
  for event in objectKeys(listeners)
    for sub in listeners[event] by 4 when sub?
      decrementListeningCount(object, sub, 1)
  object.__listeners__ = null
  return

unbind__AnyEvent = (object, callback, usercontext) ->
  for event in objectKeys(object.__listeners__)
    unbind__Base(object, event, callback, usercontext)
  return

PS.unbind = PS.off = (events) ->
  if @__listeners__?
    args       = arguments
    argslength = args.length
    
    if argslength is 0
      unbind__Everything(this)
    
    else if typeof events is 'string'
      callback    = resolveCallback(this, args[1]) if argslength > 1
      usercontext = if argslength > 2 then args[2] else ANY_CONTEXT 
      unbind__EventString(this, events, callback, usercontext)
    
    else if typeof events is 'object' and events isnt null
      usercontext = if argslength > 1 then args[1] else ANY_CONTEXT
      unbind__EventMap(this, events, usercontext)

    else
      callback    = resolveCallback(this, args[1]) if argslength > 1
      usercontext = if argslength > 2 then args[2] else ANY_CONTEXT
      unbind__AnyEvent(this, callback, usercontext)
  this

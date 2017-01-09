do ->
  unbind__Base = (object, event, cb, ctx) ->
    return unless (e = object.__listeners__[event])?
    return if (len = e.length) < 3

    r = []
    k = -1

    while (k += 3) < len

      if (!cb? or cb in [e[k-1], e[k-1]._cb]) and (!ctx? or ctx is e[k])
        # Omit!
        decrementListeningCount(object, sub, 1) if (sub = e[k-2])?

      else
        r.push(e[k-2], e[k-1], e[k])

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
      else ++j
    return

  unbind__EventMap = (object, hash, context) ->
    for events in objectKeys(hash)
      unbind__EventString(object, events, resolveCallback(object, hash[events]), context)
    return

  unbind__Everything = (object) ->
    listeners = object.__listeners__
    for event in objectKeys(listeners)
      if (entries = listeners[event])?
        for sub in entries by 3 when sub?
          decrementListeningCount(object, sub, 1)
    object.__listeners__ = null
    return

  unbind__AnyEvent = (object, callback, context) ->
    for event in objectKeys(object.__listeners__)
      unbind__Base(object, event, callback, context)
    return

  PS.unbind = PS.off = (events, callback, context) ->
    if @__listeners__?
      if !events? and !callback? and !context?
        unbind__Everything(this)

      else if events?
        if typeof events is 'string'
          unbind__EventString(this, events, resolveCallback(this, callback), context)
        else
          unbind__EventMap(this, events, context ? callback)

      else
        unbind__AnyEvent(this, callback, context)
    this
  return

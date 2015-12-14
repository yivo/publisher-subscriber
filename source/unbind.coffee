do ->
  unbind__Base = (object, event, cb, ctx) ->
    fevent = fastProperty(event)
    return if not e = object._ps[fevent]
    return if (len = e.length) < 3

    r = null
    k = -1

    while (k += 3) < len

      if (!cb or cb in [e[k-1], e[k-1]._cb]) and (!ctx or ctx is e[k])
        # Omit!
        decrementListeningCount(object, e[k-2]) if e[k-2]

      else
        (r ||= []).push(e[k-2], e[k-1], e[k])

    object._ps[fevent] = r
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
    for events of hash
      unbind__EventString(object, events, resolveCallback(object, hash[events]), context)
    return

  unbind__Everything = (object) ->
    for event, entries of object._ps when entries
      for sub in entries by 3 when sub
        decrementListeningCount(object, sub)
    object._ps = null
    return

  unbind__AnyEvent = (object, callback, context) ->
    for event of object._ps
      unbind__Base(object, event, callback, context)
    return

  PS.unbind = PS.off = (events, callback, context) ->
    if @_ps
      if !events and !callback and !context
        unbind__Everything(this)

      else if events
        if typeof events is 'string'
          unbind__EventString(this, events, resolveCallback(this, callback), context)
        else
          unbind__EventMap(this, events, context or callback)

      else
        unbind__AnyEvent(this, callback, context)
    this
  return

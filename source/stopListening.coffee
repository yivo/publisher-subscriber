do ->
  filterEntries = (e, sub, cb) ->
    return if (l = e.length) < 3

    r = null
    k = -1

    while (k += 3) < l
      if (sub isnt e[k-2]) or (cb and cb not in [e[k-1], e[k-1]._cb])
        (r ||= []).push(e[k-2], e[k-1], e[k])
    r

  stopListening__Base = (pub, sub, event, callback) ->
    n       = 0
    ps      = pub._ps
    fevent  = fastProperty(event)

    if ps and (entries = ps[fevent])
      filtered = filterEntries(entries, sub, callback)
      n += entries.length - (filtered?.length | 0)
      ps[fevent] = filtered
      decrementListeningCount(pub, sub, n / 3) if n > 0
    return

  stopListening__Everything = (object) ->
    for oid, pair of object._psTo
      pub   = pair[0]
      ps    = pub._ps
      n     = 0
      for event, entries of ps when entries
        filtered = filterEntries(entries, object)
        n += entries.length - (filtered?.length | 0)
        ps[event] = filtered
      decrementListeningCount(pub, object, n / 3) if n > 0
    return

  stopListening__EventString = (pub, sub, events, callback) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          for oid, pair of sub._psTo when !pub or pair[0] is pub
            stopListening__Base(pair[0], sub, events[i - j...i], callback)
          j = 0
      else ++j
    return

  stopListening__EventMap = (pub, sub, hash) ->
    for own events, callback of hash
      stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]))
    return

  stopListening__AnyEvent = (pub, sub, callback) ->
    for oid, pair of sub._psTo when !pub or (ipub = pair[0]) is pub
      for event of ipub._ps
        stopListening__Base(ipub, sub, event, callback)
    return

  PS.stopListening = (object, events, callback) ->
    if @_psTo
      if !object and !events and !callback
        stopListening__Everything(this)

      else if events
        if typeof events is 'string'
          stopListening__EventString(object, this, events, resolveCallback(this, callback))
        else
          stopListening__EventMap(object, this, events)

      else
        stopListening__AnyEvent(object, this, resolveCallback(this, callback))

    this

  return

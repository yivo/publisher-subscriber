do ->
  filterEntries = (e, sub, cb) ->
    l = e.length
    r = []
    k = -1

    while (k += 3) < l
      if (sub isnt e[k-2]) or (cb and cb not in [e[k-1], e[k-1]._cb])
        r.push(e[k-2], e[k-1], e[k])
    r

  stopListening__Base = (pub, sub, event, callback) ->
    n       = 0
    ps      = pub._ps

    if ps? and (entries = ps[event])?
      l  = entries.length
      n += l
      if l > 2
        filtered = filterEntries(entries, sub, callback)
        n       -= filtered.length
      ps[event] = filtered
      decrementListeningCount(pub, sub, n / 3) if n > 0
    return

  stopListening__Everything__Iteration = (pub, sub) ->
    ps    = pub._ps
    n     = 0
    for event, entries of ps when entries?
      l  = entries.length
      n += l
      if l > 2
        filtered = filterEntries(entries, sub)
        n       -= filtered.length
      ps[event] = filtered
    decrementListeningCount(pub, sub, n / 3) if n > 0
    return

  stopListening__Everything = (sub) ->
    for oid, pair of sub._psTo
      stopListening__Everything__Iteration(pair[0], sub)
    return

  stopListening__EventString = (pub, sub, events, callback) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          stopListening__EventString__Iteration(pub, sub, events[i - j...i], callback)
          j = 0
      else ++j
    return

  stopListening__EventString__Iteration = (pub, sub, event, callback) ->
    for oid, pair of sub._psTo when !pub? or pair[0] is pub
      stopListening__Base(pair[0], sub, event, callback)
    return

  stopListening__EventMap = (pub, sub, hash) ->
    for own events, callback of hash
      stopListening__EventString(pub, sub, events, resolveCallback(sub, hash[events]))
    return

  stopListening__AnyEvent = (pub, sub, callback) ->
    for oid, pair of sub._psTo when !pub? or (ipub = pair[0]) is pub
      for event of ipub._ps
        stopListening__Base(ipub, sub, event, callback)
    return

  PS.stopListening = (object, events, callback) ->
    if @_psTo?
      if !object? and !events? and !callback?
        stopListening__Everything(this)

      else if events?
        if typeof events is 'string'
          stopListening__EventString(object, this, events, resolveCallback(this, callback))
        else
          stopListening__EventMap(object, this, events)

      else
        stopListening__AnyEvent(object, this, resolveCallback(this, callback))

    this

  return

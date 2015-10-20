do ->
  onceWrap = (pub, sub, event, callback) ->
    run     = false
    wrapper = ->
      if not run
        run = true
        sub.stopListening(pub, event, wrapper)
        callback.apply(sub, arguments)
        return
    wrapper._cb = callback
    wrapper

  listenTo__Base = (pub, sub, event, callback, once) ->
    cb = if once then onceWrap(pub, sub, event, callback) else callback
    ((pub._pb ||= {})[event] ||= []).push(sub, cb, sub)
    increaseListeningCount(pub, sub)
    return

  listenTo__EventString = (pub, sub, events, callback, once) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          listenTo__Base(pub, sub, events[i - j...i], callback, once)
          j = 0
      else ++j
    return

  listenTo__EventMap = (pub, sub, hash, once) ->
    for events of hash
      listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once)
    return

  for own k, v of { listenTo: false, listenToOnce: true }
    do (method = k, once = v) ->

      PB[method] = (object, events, callback) ->
        if typeof events is 'string'

          if callback # Added here for spec: "listenTo with empty callback doesn't throw an error"
            listenTo__EventString(object, this, events, resolveCallback(this, callback), once)

        else
          listenTo__EventMap(object, this, events, once)
        this

  return
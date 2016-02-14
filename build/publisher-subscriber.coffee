((factory) ->

  # Browser and WebWorker
  root = if typeof self is 'object' and self?.self is self
    self

  # Server
  else if typeof global is 'object' and global?.global is global
    global

  # AMD
  if typeof define is 'function' and define.amd
    root.PublisherSubscriber = factory(root)
    define -> root.PublisherSubscriber

  # CommonJS
  else if typeof module is 'object' and module isnt null and
          module.exports? and typeof module.exports is 'object'
    module.exports = factory(root)

  # Browser and the rest
  else
    root.PublisherSubscriber = factory(root)

  # No return value
  return

)((__root__) ->
  PS = {}
  
  generateOID =  do ->
    counter = 0
    -> ++counter
  
  getOID = (object) ->
    object.oid ||= generateOID()
  
  resolveCallback = (object, callback) ->
    if typeof callback is 'string'
      object[callback]
    else
      callback
  
  increaseListeningCount = (pub, sub, n) ->
    listening = (sub._psTo ||= {})
    record    = (listening[getOID(pub)] ||= [pub, 0])
    record[1] += n || 1
    return
  
  decrementListeningCount = (pub, sub, n) ->
    oid       = getOID(pub)
    record    = sub._psTo[oid]
    if record and (record[1] -= n || 1) < 1
      delete sub._psTo[oid]
    return
  
  fastProperty = (prop) ->
    if prop.indexOf(':') > -1
  
      # http://stackoverflow.com/questions/14352100/does-v8-cache-compiled-regular-expressions-automatically
      prop.replace(/:/g, '_')
    else
      prop
  
  # TODO Event list binding
  isArrayLike = (obj) ->
    obj? and typeof obj.length is 'number'
  
  isNoisy = (options) ->
    # null, undefined => true
    # true            => true
    # false           => false
    # {}              => true
    # {silent: *}     => !silent
    options != false && (options && options.silent) != true
  
  isEventable = (obj) ->
    obj && obj.on == PS.on
  
  do ->
    onceWrap = (pub, event, callback, context) ->
      run     = false
      wrapper = ->
        if not run
          run = true
          pub.off(event, wrapper, context)
          callback.apply(context, arguments)
          return
      wrapper._cb = callback
      wrapper
  
    bind__Base = (object, event, callback, context, once) ->
      cb = if once then onceWrap(object, event, callback, context) else callback
      ((object._ps ||= {})[fastProperty(event)] ||= []).push(undefined, cb, context)
  
    bind__EventString = (object, events, callback, context, once) ->
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
  
    # TODO Event list binding
    bind__EventList = (object, events, callback, context, once) ->
      for event in events
        bind__Base(object, event, callback, context, once)
      return
  
    bind__EventMap = (object, hash, context, once) ->
      for events of hash
        bind__EventString(object, events, resolveCallback(object, hash[events]), context, once)
      return
  
    for own k, v of { bind: false, bindOnce: true }
      do (method = k, once = v) ->
  
        PS[method] = (events, callback, context) ->
          if typeof events is 'string'
  
            if callback # Added here for spec: "if no callback is provided, `on` is a noop"
              bind__EventString(this, events, resolveCallback(this, callback), context or this, once)
  
          else
            bind__EventMap(this, events, context or callback or this, once)
          this
  
    PS.on   = PS.bind
    PS.once = PS.bindOnce
    return
  
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
      ((pub._ps ||= {})[fastProperty(event)] ||= []).push(sub, cb, sub)
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
  
        PS[method] = (object, events, callback) ->
          if typeof events is 'string'
  
            if callback # Added here for spec: "listenTo with empty callback doesn't throw an error"
              listenTo__EventString(object, this, events, resolveCallback(this, callback), once)
  
          else
            listenTo__EventMap(object, this, events, once)
          this
  
    return
  
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
  
  do ->
    runCallbacks = (array, args) ->
      return if array.length is 0
      i    = -1
      len  = array.length
      arg1 = len > 0 and args[0]
      arg2 = len > 1 and args[1]
      arg3 = len > 2 and args[2]
  
      switch args.length
        when 0 then array[i - 1].call(array[i])                     while (i += 3) < len
        when 1 then array[i - 1].call(array[i], arg1)               while (i += 3) < len
        when 2 then array[i - 1].call(array[i], arg1, arg2)         while (i += 3) < len
        when 3 then array[i - 1].call(array[i], arg1, arg2, arg3)   while (i += 3) < len
        else        array[i - 1].apply(array[i], args)              while (i += 3) < len
      return
  
    triggerEvent = (ps, event, args) ->
      list    = ps[fastProperty(event)]
      allList = ps.all
  
      if list
        allList = allList.slice() if allList
        runCallbacks(list, args)
  
      if allList
        args.unshift(event)
        runCallbacks(allList, args)
        args.shift()
      return
  
    triggerEachEvent = (ps, events, args) ->
      l = events.length
      i = -1
      j = 0
      while ++i <= l
        if i is l or events[i] is ' '
          if j > 0
            triggerEvent(ps, events[i - j...i], args)
            j = 0
        else ++j
      return
  
    PS.trigger = PS.notify = (events) ->
      if (ps = @_ps) and (l = arguments.length) > 0
  
        # If space-separated events
        # or there entries for [event]
        # or there entries for `all` event
        if events.indexOf(' ') > -1 or ps[fastProperty(events)] or ps.all
          k           = 0
          args        = new Array(l - 1)
          args[k - 1] = arguments[k] while ++k < l
          triggerEachEvent(ps, events, args)
      this
    return
  
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
  
  
  VERSION:         '1.0.3'
  isNoisy:         isNoisy
  isEventable:     isEventable
  InstanceMembers: PS
  included:        (Class) ->
                     Class.initializer? -> @_ps = {}; @_psTo = {}; return
  
)
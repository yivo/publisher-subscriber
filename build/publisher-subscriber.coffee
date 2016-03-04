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
  
  generateOID = __root__._?.generateID ? do ->
    n = 0
    -> ++n
  
  getOID = (object) -> object.oid ?= generateOID()
  
  resolveCallback = (object, callback) ->
    if typeof callback is 'string' then object[callback] else callback
  
  increaseListeningCount = (pub, sub) ->
    listening = (sub._3 ?= {})
    record    = (listening[pub.oid ?= generateOID()] ?= [pub, 0])
    record[1] += 1
    return
  
  decrementListeningCount = (pub, sub, n) ->
    oid       = pub.oid ?= generateOID()
    record    = sub._3[oid]
    if record? and (record[1] -= n | 0) < 1
      delete sub._3[oid]
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
        if run is false
          run = true
          pub.off(event, wrapper, context)
          callback.apply(context, arguments)
        return
      wrapper._cb = callback
      wrapper
  
    bind__Base = (object, event, callback, context, once) ->
      cb = if once is true then onceWrap(object, event, callback, context) else callback
      ((object._2 ?= {})[event] ?= []).push(undefined, cb, context)
      return
  
    bind__EventString = (object, events, callback, context, once) ->
      if events.indexOf(' ') == -1
        bind__Base(object, events, callback, context, once)
      else
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
        bind__EventString(object, events, (if typeof hash[events] is 'string' then object[hash[events]] else hash[events]), context, once)
      return
  
    for own k, v of { bind: false, bindOnce: true }
      do (method = k, once = v) ->
  
        PS[method] = (events, callback, context) ->
          if typeof events is 'string'
  
            if callback # Added here for spec: "if no callback is provided, `on` is a noop"
              bind__EventString(this, events, (if typeof callback is 'string' then this[callback] else callback), context ? this, once)
  
          else
            bind__EventMap(this, events, context ? callback ? this, once)
          this
  
    PS.on   = PS.bind
    PS.once = PS.bindOnce
    return
  
  do ->
    onceWrap = (pub, sub, event, callback) ->
      run     = false
      wrapper = ->
        if run is false
          run = true
          sub.stopListening(pub, event, wrapper)
          callback.apply(sub, arguments)
        return
      wrapper._cb = callback
      wrapper
  
    listenTo__Base = (pub, sub, event, callback, once) ->
      cb = if once is true then onceWrap(pub, sub, event, callback) else callback
      ((pub._2 ?= {})[event] ?= []).push(sub, cb, sub)
      increaseListeningCount(pub, sub)
      return
  
    listenTo__EventString = (pub, sub, events, callback, once) ->
      if events.indexOf(' ') == -1
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
          else ++j
      return
  
    listenTo__EventMap = (pub, sub, hash, once) ->
      for events of hash
        listenTo__EventString(pub, sub, events, (if typeof hash[events] is 'string' then sub[hash[events]] else hash[events]), once)
      return
  
    for own k, v of { listenTo: false, listenToOnce: true }
      do (method = k, once = v) ->
  
        PS[method] = (object, events, callback) ->
          if typeof events is 'string'
  
            if callback # Added here for spec: "listenTo with empty callback doesn't throw an error"
              listenTo__EventString(object, this, events, (if typeof callback is 'string' then this[callback] else callback), once)
  
          else
            listenTo__EventMap(object, this, events, once)
          this
  
    return
  
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
      ps      = pub._2
  
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
      ps    = pub._2
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
      for oid, pair of sub._3
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
      for oid, pair of sub._3 when !pub? or pair[0] is pub
        stopListening__Base(pair[0], sub, event, callback)
      return
  
    stopListening__EventMap = (pub, sub, hash) ->
      for own events, callback of hash
        stopListening__EventString(pub, sub, events, (if typeof hash[events] is 'string' then sub[hash[events]] else hash[events]))
      return
  
    stopListening__AnyEvent = (pub, sub, callback) ->
      for oid, pair of sub._3 when !pub? or (ipub = pair[0]) is pub
        for event of ipub._2
          stopListening__Base(ipub, sub, event, callback)
      return
  
    PS.stopListening = (object, events, callback) ->
      if @_3?
        if !object? and !events? and !callback?
          stopListening__Everything(this)
  
        else if events?
          if typeof events is 'string'
            stopListening__EventString(object, this, events, (if typeof callback is 'string' then this[callback] else callback))
          else
            stopListening__EventMap(object, this, events)
  
        else
          stopListening__AnyEvent(object, this, (if typeof callback is 'string' then this[callback] else callback))
  
      this
  
    return
  
  do ->
    runCallbacks = (array, args) ->
      i    = -1
      len  = array.length
      arg1 = args[0] if len > 0
      arg2 = args[1] if len > 1
      arg3 = args[2] if len > 2
  
      switch args.length
        when 0 then array[i - 1].call(array[i])                     while (i += 3) < len
        when 1 then array[i - 1].call(array[i], arg1)               while (i += 3) < len
        when 2 then array[i - 1].call(array[i], arg1, arg2)         while (i += 3) < len
        when 3 then array[i - 1].call(array[i], arg1, arg2, arg3)   while (i += 3) < len
        else        array[i - 1].apply(array[i], args)              while (i += 3) < len
      return
  
    triggerEvent = (ps, event, args) ->
      list    = ps[event]
      allList = ps.all
  
      if list? and list.length > 0
        if allList? and allList.length > 0
          ref     = allList
          allList = []
          allList.push(el) for el in ref
        runCallbacks(list, args)
  
      if allList? and allList.length > 0
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
      if (ps = @_2)? and (l = arguments.length) > 0
  
        # If space-separated events
        # or there entries for [event]
        # or there entries for `all` event
        if (idx = events.indexOf(' ')) > -1 or
              ((ref1 = ps[events])? and ref1.length > 0) or ((ref2 = ps.all)? and ref2.length > 0)
          k           = 0
          args        = []
          args.push(arguments[k]) while ++k < l
          if idx > -1
            triggerEachEvent(ps, events, args)
          else
            triggerEvent(ps, events, args)
      this
    return
  
  do ->
    unbind__Base = (object, event, cb, ctx) ->
      return unless (e = object._2[event])?
      return if (len = e.length) < 3
  
      r = null
      k = -1
  
      while (k += 3) < len
  
        if (!cb? or cb in [e[k-1], e[k-1]._cb]) and (!ctx? or ctx is e[k])
          # Omit!
          decrementListeningCount(object, sub, 1) if (sub = e[k-2])?
  
        else
          (r ?= []).push(e[k-2], e[k-1], e[k])
  
      object._2[event] = r
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
        unbind__EventString(object, events, (if typeof hash[events] is 'string' then object[hash[events]] else hash[events]), context)
      return
  
    unbind__Everything = (object) ->
      for event, entries of object._2 when entries?
        for sub in entries by 3 when sub?
          decrementListeningCount(object, sub, 1)
      object._2 = null
      return
  
    unbind__AnyEvent = (object, callback, context) ->
      for event of object._2
        unbind__Base(object, event, callback, context)
      return
  
    PS.unbind = PS.off = (events, callback, context) ->
      if @_2
        if !events? and !callback? and !context?
          unbind__Everything(this)
  
        else if events?
          if typeof events is 'string'
            unbind__EventString(this, events, (if typeof callback is 'string' then this[callback] else callback), context)
          else
            unbind__EventMap(this, events, context ? callback)
  
        else
          unbind__AnyEvent(this, callback, context)
      this
    return
  
  
  VERSION:         '1.0.8'
  isNoisy:         isNoisy
  isEventable:     isEventable
  InstanceMembers: PS
  included:        (Class) ->
    Class.initializer? 'publisher-subscriber', ->
      @oid ?= generateOID(); @_2 ?= {}; @_3 ?= {}; return
    return
)
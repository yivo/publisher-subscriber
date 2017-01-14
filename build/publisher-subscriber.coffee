###!
# publisher-subscriber 1.0.12 | https://github.com/yivo/publisher-subscriber | MIT License  
###

((factory) ->

  __root__ = 
    # The root object for Browser or Web Worker
    if typeof self is 'object' and self isnt null and self.self is self
      self

    # The root object for Server-side JavaScript Runtime
    else if typeof global is 'object' and global isnt null and global.global is global
      global

    else
      Function('return this')()

  # Asynchronous Module Definition (AMD)
  if typeof define is 'function' and typeof define.amd is 'object' and define.amd isnt null
    __root__.PublisherSubscriber = factory(__root__, Object)
    define -> __root__.PublisherSubscriber

  # Server-side JavaScript Runtime compatible with CommonJS Module Spec
  else if typeof module is 'object' and module isnt null and typeof module.exports is 'object' and module.exports isnt null
    module.exports = factory(__root__, Object)

  # Browser, Web Worker and the rest
  else
    __root__.PublisherSubscriber = factory(__root__, Object)

  # No return value
  return

)((__root__, Object) ->
  PS = {}
  
  generateOID         = __root__._?.generateID ? do -> n = 0; (-> ++n)
  
  objectKeys          = __root__._?.keys ? Object.keys
  
  objectCreate        = if Object.create? then -> Object.create(null) else -> {}
  
  objectFreeze        = Object.freeze ? (object) -> object
  
  safeGetOID          = (object) -> object.oid ?= generateOID()
  
  safeGetListeners    = (object) -> object.__listeners__ ?= objectCreate()
  
  safeAccessListeners = (object, event) -> safeGetListeners(object)[event] ?= []
  
  safeGetListening    = (object) -> object.__listening__ ?= objectCreate()
    
  resolveCallback     = (object, callback) -> if typeof callback is 'string' then object[callback] else callback
  
  increaseListeningCount = (pub, sub) ->
    listening  = safeGetListening(sub)
    record     = (listening[safeGetOID(pub)] ?= [pub, 0])
    record[1] += 1
    return
  
  decrementListeningCount = (pub, sub, n) ->
    oid       = safeGetOID(pub)
    record    = sub.__listening__[oid]
    if record? and (record[1] -= n|0) < 1
      delete sub.__listening__[oid]
    return
  
  isNoisy = (options) ->
    # null, undefined => true
    # true            => true
    # false           => false
    # {}              => true
    # {silent: *}     => !silent
    options isnt false and options?.silent isnt true
  
  isEventable = (obj) -> obj?.on is PS.on
  
  ANY_CONTEXT = objectCreate()
  
  objectFreeze(ANY_CONTEXT)
  
  bind__onceWrap = (object, event, callback, callcontext) ->
    run     = false
    wrapper = ->
      if run is false
        run = true
        object.off(event, wrapper)
        callback.apply(callcontext, arguments)
      return
    wrapper.__wrapped__ = callback
    wrapper
  
  bind__Base = (object, event, callback, usercontext, callcontext, once) ->
    cb = if once is true then bind__onceWrap(object, event, callback, callcontext) else callback
    safeAccessListeners(object, event).push(null, cb, usercontext, callcontext)
    return
  
  bind__EventString = (object, events, callback, usercontext, callcontext, once) ->
    if events.indexOf(' ') is -1
      bind__Base(object, events, callback, usercontext, callcontext, once)
    else
      l = events.length
      i = -1
      j = 0
      while ++i <= l
        if i is l or events[i] is ' '
          if j > 0
            bind__Base(object, events[i - j...i], callback, usercontext, callcontext, once)
            j = 0
        else 
          ++j
    return
  
  bind__EventMap = (object, hash, usercontext, callcontext, once) ->
    for events in objectKeys(hash)
      bind__EventString(object, events, resolveCallback(object, hash[events]), usercontext, callcontext, once)
    return
  
  do ->
    for method, i in ['on', 'once']
      PS[method] = do (once = i is 1) ->
        (events) ->
          args       = arguments
          argslength = arguments.length
          
          if typeof events is 'string'
            if argslength > 1 and typeof (callback = resolveCallback(this, args[1])) is 'function'
              usercontext = args[2] if argslength > 2
              callcontext = if argslength > 2 then usercontext else this
              bind__EventString(this, events, callback, usercontext, callcontext, once)
      
          else if typeof events is 'object' and events isnt null
            if argslength > 2
              callcontext = usercontext = args[2]
            else if argslength > 1
              callcontext = usercontext = args[1]
            else
              callcontext = this
            bind__EventMap(this, events, usercontext, callcontext, once)
          this
  
  PS.bind = PS.on
  
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
  
  trigger__runCallbacks = (array, args) ->
    idx = -1
    len = array.length
  
    switch args.length
      when 0 then array[idx - 2].call(array[idx])                            while (idx += 4) < len
      when 1 then array[idx - 2].call(array[idx], args[0])                   while (idx += 4) < len
      when 2 then array[idx - 2].call(array[idx], args[0], args[1])          while (idx += 4) < len
      when 3 then array[idx - 2].call(array[idx], args[0], args[1], args[2]) while (idx += 4) < len
      else        array[idx - 2].apply(array[idx], args)                     while (idx += 4) < len
    return
  
  trigger__Base = (listeners, event, args) ->
    list    = listeners[event]
    listall = listeners.all
  
    if list?.length > 0
      if listall?.length > 0
        listall = listall.slice()
      trigger__runCallbacks(list, args)
  
    if listall?.length > 0
      args.unshift(event)
      trigger__runCallbacks(listall, args)
      args.shift()
    return
  
  trigger__EventString = (listeners, events, args) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          trigger__Base(listeners, events[i - j...i], args)
          j = 0
      else 
        ++j
    return
  
  PS.trigger = PS.notify = (events) ->
    if (listeners = @__listeners__)?
  
      # If events are space-separated
      # or there are entries for [event]
      # or there are entries for `all` event
      if (idx = events.indexOf(' ')) > -1 or listeners[events]?.length > 0 or listeners.all?.length > 0
        k           = 0
        l           = arguments.length
        args        = []
        args.push(arguments[k]) while ++k < l
        if idx > -1
          trigger__EventString(listeners, events, args)
        else
          trigger__Base(listeners, events, args)
    this
  
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
  
  
  objectFreeze
    VERSION:         '1.0.12'
    isNoisy:         isNoisy
    isEventable:     isEventable
    InstanceMembers: objectFreeze(PS)
  
  # TODO While loops: http://stackoverflow.com/questions/18640032/javascript-performance-while-vs-for-loops
)
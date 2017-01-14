((factory) ->

  # Browser and WebWorker
  root = if typeof self is 'object' and self isnt null and self.self is self
    self

  # Server
  else if typeof global is 'object' and global isnt null and global.global is global
    global

  # AMD
  if typeof define is 'function' and typeof define.amd is 'object' and define.amd isnt null
    root.PublisherSubscriber = factory(root, Object)
    define -> root.PublisherSubscriber

  # CommonJS
  else if typeof module is 'object' and module isnt null and
          typeof module.exports is 'object' and module.exports isnt null
    module.exports = factory(root, Object)

  # Browser and the rest
  else
    root.PublisherSubscriber = factory(root, Object)

  # No return value
  return

)((__root__, Object) ->
  PS = {}
  
  generateOID         = __root__._?.generateID ? do -> n = 0; (-> ++n)
  
  objectKeys          = __root__._?.keys ? Object.keys
  
  objectCreate        = if Object.create? then -> Object.create(null) else -> {}
  
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
      safeAccessListeners(object, event).push(undefined, cb, context)
      return
  
    bind__EventString = (object, events, callback, context, once) ->
      if events.indexOf(' ') is -1
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
  
    bind__EventMap = (object, hash, context, once) ->
      for events in objectKeys(hash)
        bind__EventString(object, events, resolveCallback(object, hash[events]), context, once)
      return
  
    for method, i in ['on', 'once']
      do (method, once = i is 1) ->
  
        PS[method] = (events, callback, context) ->
          if events?
            if typeof events is 'string'
  
              if callback? # Added here for spec: "if no callback is provided, `on` is a noop"
                bind__EventString(this, events, resolveCallback(this, callback), context ? this, once)
  
            else
              bind__EventMap(this, events, context ? callback ? this, once)
          this
    
    PS.bind = PS.on
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
      safeAccessListeners(pub, event).push(sub, cb, sub)
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
          else ++j
      return
  
    listenTo__EventMap = (pub, sub, hash, once) ->
      for events in objectKeys(hash)
        listenTo__EventString(pub, sub, events, resolveCallback(sub, hash[events]), once)
      return
  
    for method, i in ['listenTo', 'listenToOnce']
      do (method, once = i is 1) ->
  
        PS[method] = (object, events, callback) ->
          if events?
            if typeof events is 'string'
  
              if callback? # Added here for spec: "listenTo with empty callback doesn't throw an error"
                listenTo__EventString(object, this, events, resolveCallback(this, callback), once)
  
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
        if (sub isnt e[k-2]) or (cb? and cb not in [e[k-1], e[k-1]._cb])
          r.push(e[k-2], e[k-1], e[k])
      r
  
    stopListening__Base = (pub, sub, event, callback) ->
      n         = 0
      listeners = pub.__listeners__
  
      if listeners? and (entries = listeners[event])?
        l  = entries.length
        n += l
        
        if l > 2
          filtered         = filterEntries(entries, sub, callback)
          n               -= filtered.length
          listeners[event] = filtered
        else
          listeners[event] = []
        
      decrementListeningCount(pub, sub, n / 3) if n > 0
      return
  
    stopListening__Everything__Iteratee = (pub, sub) ->
      n         = 0
      listeners = pub.__listeners__
      
      for event in objectKeys(listeners)
        entries = listeners[event]
        l       = entries.length
        n      += l
        
        if l > 2
          filtered         = filterEntries(entries, sub, null)
          n               -= filtered.length
          listeners[event] = filtered
        else
          listeners[event] = []
          
      decrementListeningCount(pub, sub, n / 3) if n > 0
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
  
    PS.stopListening = (object, events, callback) ->
      if @__listening__?
        if arguments.length is 0
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
  
  do ->
    runCallbacks = (array, args) ->
      idx = -1
      len = array.length
  
      switch args.length
        when 0 then array[idx - 1].call(array[idx])                            while (idx += 3) < len
        when 1 then array[idx - 1].call(array[idx], args[0])                   while (idx += 3) < len
        when 2 then array[idx - 1].call(array[idx], args[0], args[1])          while (idx += 3) < len
        when 3 then array[idx - 1].call(array[idx], args[0], args[1], args[2]) while (idx += 3) < len
        else        array[idx - 1].apply(array[idx], args)                     while (idx += 3) < len
      return
  
    triggerEvent = (listeners, event, args) ->
      list    = listeners[event]
      listall = listeners.all
  
      if list?.length > 0
        if listall?.length > 0
          listall = listall.slice()
        runCallbacks(list, args)
  
      if listall?.length > 0
        args.unshift(event)
        runCallbacks(listall, args)
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
      if (listeners = @__listeners__)? and (l = arguments.length) > 0
  
        # If events are space-separated
        # or there are entries for [event]
        # or there are entries for `all` event
        if (idx = events.indexOf(' ')) > -1 or listeners[events]?.length > 0 or listeners.all?.length > 0
          k           = 0
          args        = []
          args.push(arguments[k]) while ++k < l
          if idx > -1
            triggerEachEvent(listeners, events, args)
          else
            triggerEvent(listeners, events, args)
      this
    return
  
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
        if arguments.length is 0
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
  
  
  VERSION:         '1.0.11'
  isNoisy:         isNoisy
  isEventable:     isEventable
  InstanceMembers: PS
  
  # TODO While loops: http://stackoverflow.com/questions/18640032/javascript-performance-while-vs-for-loops
)
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
    if (ps = @_ps)? and (l = arguments.length) > 0

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

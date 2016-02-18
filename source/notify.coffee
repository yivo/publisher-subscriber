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
      if space = (events.indexOf(' ') > -1) or ps[fastProperty(events)] or ps.all
        k           = 0
        args        = []
        args.push(arguments[k]) while ++k < l
        if space
          triggerEachEvent(ps, events, args)
        else
          triggerEvent(ps, events, args)
    this
  return

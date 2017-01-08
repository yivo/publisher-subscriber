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

  triggerEvent = (ps, event, args) ->
    list    = ps[event]
    allList = ps.all

    if list?.length > 0
      if allList?.length > 0
        ref     = allList
        allList = []
        allList.push(el) for el in ref
      runCallbacks(list, args)

    if allList?.length > 0
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
      if (idx = events.indexOf(' ')) > -1 or ps[events]?.length > 0 or ps.all?.length > 0
        k           = 0
        args        = []
        args.push(arguments[k]) while ++k < l
        if idx > -1
          triggerEachEvent(ps, events, args)
        else
          triggerEvent(ps, events, args)
    this
  return

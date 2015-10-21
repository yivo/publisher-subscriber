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

  triggerEvent = (pb, event, args) ->
    list    = pb[event]
    allList = pb.all

    if list
      allList = allList.slice() if allList
      runCallbacks(list, args)

    if allList
      args.unshift(event)
      runCallbacks(allList, args)
      args.shift()
    return

  triggerEachEvent = (pb, events, args) ->
    l = events.length
    i = -1
    j = 0
    while ++i <= l
      if i is l or events[i] is ' '
        if j > 0
          triggerEvent(pb, events[i - j...i], args)
          j = 0
      else ++j
    return

  PB.trigger = PB.notify = (events) ->
    if (pb = @_pb) and (l = arguments.length) > 0

      # If space-separated events
      # or there entries for [event]
      # or there entries for `all` event
      if events.indexOf(' ') > -1 or pb[events] or pb.all
        k           = 0
        args        = new Array(l - 1)
        args[k - 1] = arguments[k] while ++k < l
        triggerEachEvent(pb, events, args)
    this
  return
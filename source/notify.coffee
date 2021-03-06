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

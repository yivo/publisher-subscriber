generateOID = __root__._?.generateID ? do -> n = 0; (-> ++n)
  
getOID = (object) -> object.oid ?= generateOID()

resolveCallback = (object, callback) ->
  if typeof callback is 'string' then object[callback] else callback

increaseListeningCount = (pub, sub) ->
  listening = (sub._psTo ?= {})
  record    = (listening[getOID(pub)] ?= [pub, 0])
  record[1] += 1
  return

decrementListeningCount = (pub, sub, n) ->
  oid       = getOID(pub)
  record    = sub._psTo[oid]
  if record? and (record[1] -= n | 0) < 1
    delete sub._psTo[oid]
  return

fastProperty = (prop) ->
  if prop.indexOf(':') > -1

    # http://stackoverflow.com/questions/14352100/does-v8-cache-compiled-regular-expressions-automatically
    prop.replace(/:/g, '_')
  else
    prop

isNoisy = (options) ->
  # null, undefined => true
  # true            => true
  # false           => false
  # {}              => true
  # {silent: *}     => !silent
  options != false && (options && options.silent) != true

isEventable = (obj) -> obj?.on is PS.on

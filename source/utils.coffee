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

isEventable = (obj) ->
  obj && obj.on == PS.on

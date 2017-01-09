generateOID = __root__._?.generateID ? do -> n = 0; (-> ++n)

objectKeys = __root__._?.keys ? Object.keys

emptyObject = if Object.create? then -> Object.create(null) else -> {}

getOID = (object) -> object.oid ?= generateOID()

resolveCallback = (object, callback) ->
  if typeof callback is 'string' then object[callback] else callback

increaseListeningCount = (pub, sub) ->
  listening  = (sub._psTo ?= emptyObject())
  record     = (listening[getOID(pub)] ?= [pub, 0])
  record[1] += 1
  return

decrementListeningCount = (pub, sub, n) ->
  oid       = getOID(pub)
  record    = sub._psTo[oid]
  if record? and (record[1] -= n|0) < 1
    delete sub._psTo[oid]
  return

isNoisy = (options) ->
  # null, undefined => true
  # true            => true
  # false           => false
  # {}              => true
  # {silent: *}     => !silent
  options isnt false and options?.silent isnt true

isEventable = (obj) -> obj?.on is PS.on

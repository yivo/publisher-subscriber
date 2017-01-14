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

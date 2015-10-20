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
  listening = (sub._pbTo ||= {})
  record    = (listening[getOID(pub)] ||= [pub, 0])
  record[1] += n || 1
  return

decrementListeningCount = (pub, sub, n) ->
  oid       = getOID(pub)
  record    = sub._pbTo[oid]
  if record and (record[1] -= n || 1) < 1
    delete sub._pbTo[oid]
  return

fastProperty = (prop) ->
  prop
#  l = prop.length
#  i = -1
#  j = 0
#  ret = ''
#  while ++i <= l
#    if i is l or prop[i] is ':'
#      if j > 0
#        ret = if ret
#          "#{ret}_#{prop[i - j...i]}"
#        else
#          prop[i - j...i]
#
#        j = 0
#    else ++j
#  ret

isNoisy = (options) ->
  # null, undefined => true
  # true            => true
  # false           => false
  # {}              => true
  # {silent: *}     => !silent
  options != false && (options && options.silent) != true

isEventable = (obj) ->
  obj && obj.on == PB.on
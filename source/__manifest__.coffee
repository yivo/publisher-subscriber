PS = {}

# @include utils.coffee
# @include bind.coffee
# @include listenTo.coffee
# @include stopListening.coffee
# @include notify.coffee
# @include unbind.coffee

VERSION:         '1.0.9'
isNoisy:         isNoisy
isEventable:     isEventable
InstanceMembers: PS
included:        (Class) ->
  Class.initializer? 'publisher-subscriber', ->
    @oid ?= generateOID(); @_ps ?= {}; @_psTo ?= {}; return
  return
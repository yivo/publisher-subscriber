PS = {}

# @include utils.coffee
# @include bind.coffee
# @include listenTo.coffee
# @include stopListening.coffee
# @include notify.coffee
# @include unbind.coffee

VERSION:         '1.0.5'
isNoisy:         isNoisy
isEventable:     isEventable
InstanceMembers: PS
included:        (Class) ->
  Class.initializer? 'publisher-subscriber', -> @_ps ?= {}; @_psTo ?= {}; return
  return

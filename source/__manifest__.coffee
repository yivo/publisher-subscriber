PS = {}

# @include utils.coffee
# @include bind.coffee
# @include listenTo.coffee
# @include stopListening.coffee
# @include notify.coffee
# @include unbind.coffee

VERSION:         '1.0.3'
isNoisy:         isNoisy
isEventable:     isEventable
InstanceMembers: PS
included:        (Class) -> Class.initializer? -> @_ps = {}; @_psTo = {}; return

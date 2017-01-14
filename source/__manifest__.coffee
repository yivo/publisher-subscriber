PS = {}

# @include utils.coffee
# @include bind.coffee
# @include listenTo.coffee
# @include stopListening.coffee
# @include notify.coffee
# @include unbind.coffee

objectFreeze
  VERSION:         '1.0.12'
  isNoisy:         isNoisy
  isEventable:     isEventable
  InstanceMembers: objectFreeze(PS)

# TODO While loops: http://stackoverflow.com/questions/18640032/javascript-performance-while-vs-for-loops

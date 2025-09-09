exports.context = function() {
  return this
}

exports.exported = function() {
  return true
}

exports.default = async function(ctx) {
  return {
    id() {
      return ctx.auth.hash()
    }
  }
}
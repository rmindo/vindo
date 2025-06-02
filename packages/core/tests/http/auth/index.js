
exports.GET = function(req, res) {
  res.json({auth: true})
}


exports.sign = function(req, res) {
  return {
    POST() {
      res.json({checked: true})
    },
  }
}

exports.default = function(ctx) {
  return {
    verify(req, res) {
      res.json({verified: true})
    }
  }
}
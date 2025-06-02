
exports.GET = function(req, res) {
  res.result({code: 423245})
}


exports.check = function(req, res) {
  return {
    GET() {
      res.json({checked: true})
    },
    DELETE() {
    }
  }
}

exports.default = function(ctx) {
  return {
    POST(req, res) {

    },

    sign(req, res) {
      return {
        GET() {
          res.json({signed: true})
        }
      }
    },

    verify(req, res) {
      res.json({verified: true})
    }
  }
}
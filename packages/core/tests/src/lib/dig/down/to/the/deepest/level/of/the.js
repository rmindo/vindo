module.exports = async function directory(ctx) {
  return {
    greetings() {
      return ctx.greetings
    }
  }
}
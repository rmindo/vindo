/*
 * @vindo/exception
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


/**
 * Added status will be here
 */
exports.statuses = {}


/**
 * Create an error class
 * @param {number} status 
 * @param {string} name
 * @param {string | null} message
 */
const create = exports.createErrorSubClass = function createErrorSubClass(status, name, message = null) {
  exports.statuses[status] = {
    log: true,
    data: null,
    name,
    status,
    message
  }

  return class extends Error {
    constructor(args = {}, log = true) {
      if(typeof args == 'string') {
        args = {
          message: args
        }
      }
      const opt = {
        ...exports.statuses[status],
        log,
        ...args
      }

      /**
       * Use the name if no message provided.
       */
      if(!opt.message) {
        opt.message = opt.name
      }
      super(opt.message)

      /**
       * Essential details
       */
      this.name = opt.name
      this.data = opt.data
      this.status = opt.status

      /**
       * Server error should be logged regardless of the value log option.
       */
      this.log = opt.status == 500 ? true : opt.log
    }
  }
}


/**
 * Set error code and log option.
 * 
 * @param {object} e
 * @param {number} status 
 */
exports.error = function error(e, status = 500) {
  /**
   * All thrown errors will be treated as internal server errors by default.
   */
  if(exports.isErrorClass(e)) {
    const err = exports.statuses[status]

    if(err) {
      Object.assign(e, {status, log: err.log})
    }
  }
  return e
}


/**
 * Check if its either a subclass of Error or the Error class itself.
 */
exports.isErrorClass = function isErrorClass(e) {
  const pattern = /^(\w+)Error$/
  const cannotFindModule = e.message.match(/Cannot\sfind\smodule/g)

  if(e.name.match(pattern) && e instanceof Error || e.name == 'Error' && !cannotFindModule) {
    return true
  }
  return false
}

/**
 * Pre defined error exceptions
 */
exports.NotFoundException = create(404, 'NotFoundException', 'Not Found')
exports.ForbiddenException = create(403, 'ForbiddenException', 'Forbidden')
exports.BadRequestException = create(400, 'BadRequestException', 'Bad Request')
exports.UnauthorizedException = create(401, 'UnauthorizedException', 'Unauthorized')
exports.MethodNotAllowedException = create(405, 'MethodNotAllowedException', 'Method Not Allowed')
exports.InternalServerErrorException = create(500, 'InternalServerErrorException', 'Internal Sever Error')
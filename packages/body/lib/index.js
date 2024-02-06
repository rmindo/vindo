/*
 * @vindo/body
 * Copyright(c) 2023 Ruel Mindo
 * MIT Licensed
 */

'use strict'


const querystring = require('querystring')

/**
 * 
 * @param {*} type 
 * @returns 
 */
function getType(type) {
  if(type.match(/application\/json/g)) {
    return 'json'
  }
  if(type.match(/multipart\/form-data/g)) {
    return 'form'
  }
  if(type.match(/application\/x-www-form-urlencoded/g)) {
    return 'urlencoded'
  }
}

/**
 * 
 * @param {*} info 
 * @returns 
 */
function getJSON(data) {
  return JSON.parse(data)
}

/**
 * 
 * @param {*} info 
 * @returns 
 */
function getUrlencodedData(data) {
  return querystring.decode(data.toString())
}

/**
 * 
 * @param {*} info 
 * @returns 
 */
function parseBody(data, type) {
  var body = {}
  var type = getType(type)

  switch(type) {
    /**
     * Raw JSON
     * application/json
     */
    case 'json':
      body = getJSON(data)
      break
    /**
     * URL encoded
     * multipart/x-www-form-urlencoded
     */
    case 'urlencoded':
      body = getUrlencodedData(exert)
      break
  }
  return body
}

/**
 * 
 * @param {*} opts 
 * @returns 
 */
exports.parser = function(req, res, next) {
  const type = req.headers['content-type']

  
  if(!type || getType(type) == 'form') {
    return next()
  }

  const data = []
  req.on('data', (chunk) => {
    data.push(chunk)
  })

  req.on('close', () => {
    const body = parseBody(data, type)

    Object.defineProperty(req, 'body', {
      value: body,
      writable: false
    })
    next()
  })
}
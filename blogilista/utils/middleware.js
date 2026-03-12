const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    } else {
        request.token = null
    }
    next()
}
const userExtractor = async (request, response, next) => {
    if (!request.token) {
        return response.status(401).json({ error: 'token missing or invalid' })
  }
  let decodedToken
  try {
    decodedToken = jwt.verify(request.token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  request.user = user
  next()
}

module.exports = {
    tokenExtractor,
    userExtractor
}
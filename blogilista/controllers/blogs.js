const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({})
  .populate('user', { username: 1, name: 1 })
    response.json(blogs)
  })

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findOne({})

  if (!user) {
    return response.status(400).json({ error: 'no users in database' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})


blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})
blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body
    const blog = { title, author, url, likes }
    const updateBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        blog,
        { returnDocument: 'after', runValidators: true }
    )
    response.json(updateBlog)

})

module.exports = blogsRouter
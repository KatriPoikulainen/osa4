const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    response.json(blogs)
  })

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  try {
    const result = await blog.save()
    response.status(201).json(result)
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
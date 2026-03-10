const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'First test blog',
    author: 'Katri',
    url: 'https://example.com/1',
    likes: 5
  },
  {
    title: 'Second test blog',
    author: 'Someone',
    url: 'https://example.com/2',
    likes: 10
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb
}
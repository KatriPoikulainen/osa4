const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

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

beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of initialBlogs) {
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog posts have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]

  assert.strictEqual(blog.id !== undefined, true)
  assert.strictEqual(blog._id === undefined, true)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Async testing in Node',
    author: 'Katri',
    url: 'https://example.com/async',
    likes: 12
  }

  const blogsAtStart = await api.get('/api/blogs')

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await api.get('/api/blogs')

  assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length + 1)

  const titles = blogsAtEnd.body.map(blog => blog.title)
  assert(titles.includes('Async testing in Node'))
})

test('if likes is missing, it will default to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Katri',
    url: 'https://example.com/nolikes'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Katri',
    url: 'https://example.com/notitle',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Blog without url',
    author: 'Katri',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})
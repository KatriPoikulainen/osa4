const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')

const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

//test('all blogs are returned', async () => {
  //const response = await api.get('/api/blogs')

  //assert.strictEqual(response.body.length, 2)
//})

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

after(async () => {
  await mongoose.connection.close()
})
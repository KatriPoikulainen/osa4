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

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, 2)
})

after(async () => {
  await mongoose.connection.close()
})
test('blog posts have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]

  assert.strictEqual(blog.id !== undefined, true)
  assert.strictEqual(blog._id === undefined, true)
})
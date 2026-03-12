const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({
    username: 'root',
    name: 'Superuser',
    passwordHash})

const savedUser = await user.save()
const blogObjects = helper.initialBlogs.map(blog => new Blog({
    ...blog,
    user: savedUser._id
  }))

  const savedBlogs = []
  for (const blog of blogObjects) {
    const savedBlog = await blog.save()
    savedBlogs.push(savedBlog)}

  savedUser.blogs = savedBlogs.map(blog => blog._id)
  await savedUser.save()
})

const loginAndGetToken = async () => {
  const response = await api
    .post('/api/login')
    .send({
      username: 'root',
      password: 'sekret'
    })

  return response.body.token}

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blog posts have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]

  assert.strictEqual(blog.id !== undefined, true)
  assert.strictEqual(blog._id === undefined, true)
})

test('a valid blog can be added', async () => {
  const token = await loginAndGetToken()

  const newBlog = {
    title: 'Async testing in Node',
    author: 'Katri',
    url: 'https://example.com/async',
    likes: 12
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

const blogsAtEnd = await helper.blogsInDb()
assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
const titles = blogsAtEnd.map(blog => blog.title)
assert(titles.includes('Async testing in Node'))
})

test('if likes is missing, it will default to 0', async () => {
  const token = await loginAndGetToken()

  const newBlog = {
    title: 'Blog without likes',
    author: 'Katri',
    url: 'https://example.com/nolikes'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const token = await loginAndGetToken()

  const newBlog = {
    author: 'Katri',
    url: 'https://example.com/notitle',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('blog without url is not added', async () => {
  const token = await loginAndGetToken()

  const newBlog = {
    title: 'Blog without url',
    author: 'Katri',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('adding a blog fails with status code 401 if token is not provided', async () => {
  const newBlog = {
    title: 'No token blog',
    author: 'Katri',
    url: 'https://example.com/notoken',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('a blog can be deleted by the user who added it', async () => {
  const token = await loginAndGetToken()
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  const ids = blogsAtEnd.map(blog => blog.id)
  assert(!ids.includes(blogToDelete.id))
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('deleting a blog fails with status code 401 if token is not provided', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

test('deleting a blog fails with status code 403 if user is not the creator', async () => {
  const passwordHash = await bcrypt.hash('password', 10)
  const anotherUser = new User({
    username: 'anotheruser',
    name: 'Another User',
    passwordHash
  })

  await anotherUser.save()
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'anotheruser',
      password: 'password'
    })

  const token = loginResponse.body.token
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(403)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
})

test('a blog likes can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]
  const updatedBlog = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
})

after(async () => {
  await mongoose.connection.close()
})


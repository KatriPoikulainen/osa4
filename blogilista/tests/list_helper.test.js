const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '1',
      title: 'First blog',
      author: 'Author A',
      url: 'http://example.com/1',
      likes: 5
    },
    {
      _id: '2',
      title: 'Second blog',
      author: 'Author B',
      url: 'http://example.com/2',
      likes: 10
    },
    {
      _id: '3',
      title: 'Third blog',
      author: 'Author C',
      url: 'http://example.com/3',
      likes: 7
    }
  ]

  test('returns blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, blogs[1])
  })
})

describe('most blogs', () => {
  const blogs = [
    { author: 'Robert C. Martin', likes: 5 },
    { author: 'Edsger W. Dijkstra', likes: 3 },
    { author: 'Robert C. Martin', likes: 7 },
    { author: 'Robert C. Martin', likes: 2 }
  ]

  test('author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})
describe('most likes', () => {
  const blogs = [
    {
      author: 'Robert C. Martin',
      likes: 5
    },
    {
      author: 'Edsger W. Dijkstra',
      likes: 10
    },
    {
      author: 'Robert C. Martin',
      likes: 7
    },
    {
      author: 'Edsger W. Dijkstra',
      likes: 7
    }
  ]

  test('author with most total likes', () => {
    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})
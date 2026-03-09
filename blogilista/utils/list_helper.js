const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((favorite, blog) => {
        return blog.likes > favorite.likes ? blog : favorite
    })
}

const mostBlogs = (blogs) => {
    const counts = {}
    blogs.forEach(blog => {
        counts[blog.author] = (counts[blog.author] || 0) +1

    })
    let maxAuthor = null
    let maxBlogs = 0

    for (const author in counts) {
        if (counts[author] > maxBlogs) {
            maxBlogs = counts[author]
            maxAuthor = author
        }
    }
    return {
        author: maxAuthor,
        blogs: maxBlogs
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}

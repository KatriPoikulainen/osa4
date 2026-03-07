require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')

const app = express()





const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())
app.use('/api/blogs', blogsRouter)


const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
/* eslint-disable camelcase */
// require('newrelic')
require('dotenv').config()
const express = require('express')
const { promisify } = require('bluebird')
const cors = require('cors')
const db = require('../db')
const redis = require('redis')
const app = express()

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379
})

client.connect()
  .then(() => console.log('Redis is connected'))
  .catch((err) => console.log('Error ' + err))



app.use(cors())
app.use(express.json())

app.get('/reviews/:product_id', (req, res) => {
  const { product_id } = req.params
  client.exists(product_id)
    .then((result) => {
      if (result === 1) {
        client.get(product_id)
          .then((response) => {
            res.status(200).send({
              product: req.params.product_id,
              page: Number(req.query.page) || 1,
              count: Number(req.query.count) || 5,
              results: JSON.parse(response)
            })
          })
      } else {
        db.getReviews(req.params.product_id, req.query.page, req.query.count)
          .then(async (reviews) => {
            await client.set(product_id, JSON.stringify(reviews))
            res.status(200).send({
              product: req.params.product_id,
              page: Number(req.query.page) || 1,
              count: Number(req.query.count) || 5,
              results: reviews
            })
          })
          .catch(err => res.status(500).send(err))
      }
    })
  // if (existsAsync(product_id)) {
  //   console.log('redis')
  //   const response = getAsync(product_id)
  //   console.log('response', response)
  //  // res.status(200).send(JSON.parse(response))
  // }
  //   console.log('not redis')
  //   db.getReviews(req.params.product_id, req.query.page, req.query.count)
  //     .then(async (reviews) => {
  //       await client.set(product_id, JSON.stringify(reviews))
  //       res.status(200).send({
  //         product: req.params.product_id,
  //         page: Number(req.query.page) || 1,
  //         count: Number(req.query.count) || 5,
  //         results: reviews
  //       })
  //     })
  //     .catch(err => res.status(500).send(err))
})

app.get('/reviews/meta/:product_id/', (req, res) => {
  db.getMetaData(req.params.product_id)
    .then((data) => {
      data.product_id = req.params.product_id
      res.status(200).send(data)
    })
    .catch(err => res.status(500).send(err))
})

app.post('/reviews', (req, res) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body
  db.addReview(product_id, rating, summary, body, recommend, name, email, photos, characteristics)
    .then((data) => {
      res.status(201).send()
    })
    .catch(() => res.status(500).send())
})

app.put('/reviews/:review_id/helpful', (req, res) => {
  db.reviewHelpful(req.params.review_id)
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send())
})

app.put('/reviews/:review_id/report', (req, res) => {
  db.reviewReport(req.params.review_id)
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send())
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

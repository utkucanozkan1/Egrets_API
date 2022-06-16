/* eslint-disable camelcase */
// require('newrelic')
require('dotenv').config()
const express = require('express')
const Promise = require('bluebird')
const cors = require('cors')
const db = require('../db')
const app = express()
app.use(cors())
app.use(express.json())

// app.get('/reviews/:product_id', (req, res) => {
//   db.getReviews(req.params.product_id,req.query.count,req.query.page,req.query.sort)
//     .then((data) => res.status(200).send({
//       product: req.params.product_id,
//       page: Number(req.query.page) || 1,
//       count: Number(req.query.count) || 5,
//       results: data
//     }))
//     .catch(err => res.status(500).send(err))
// })

app.get('/reviews/:product_id', (req, res) => {
  db.getReviews(req.params.product_id, req.query.page, req.query.count)
    .then(reviews => res.status(200).send({
      product: req.params.product_id,
      page: Number(req.query.page) || 1,
      count: Number(req.query.count) || 5,
      results: reviews
    }))
    .catch(err => res.status(500).send(err))
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

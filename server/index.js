require('dotenv').config()
const express = require('express')
const Promise = require('bluebird')
const db = require('../db')
const app = express()
app.use(express.json())

app.get('/reviews/:product_id', (req, res) => {
  db.getReviews(req.params.product_id,req.query.count,req.query.page,req.query.sort)
    .then((data) => res.status(200).send({
      product: req.params.product_id,
      page: Number(req.query.page),
      count: Number(req.query.count),
      results: data
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

app.put('/reviews/:review_id/helpful', (req, res) => {
  console.log(req.params)
  db.reviewHelpful(req.params.review_id)
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send())
})

app.put('/reviews/:review_id/report', (req, res) => {
  console.log(req.params)
  db.reviewReport(req.params.review_id)
    .then(() => res.status(204).send())
    .catch(() => res.status(500).send())
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

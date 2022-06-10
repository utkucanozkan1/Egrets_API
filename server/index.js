require('dotenv').config()
const express = require('express')
const Promise = require('bluebird')
const db = require('../db')
const app = express()
app.use(express.json())

app.get('/reviews/:product_id/:count/:page/:sort', (req, res) => {
  console.log(req.params);
    db.getReviews(req.params.product_id,req.params.count,req.params.page,req.params.sort)
    .then((data) => res.status(200).send({
      product: req.params.product_id,
      page: Number(req.params.page),
      count: Number(req.params.count),
      results: data
    }))

})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

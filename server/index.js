require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())

app.get('/reviews/:product_id', (req, res) => {
  console.log(req.params);
  
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

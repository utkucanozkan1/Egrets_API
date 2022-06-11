/* eslint-disable camelcase */

const { Sequelize, DataTypes } = require('sequelize')
const Promise = require('bluebird')
require('dotenv').config()
// Option 1: Passing a connection URI
const sequelize = new Sequelize(`postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@localhost:${process.env.PGPORT}/sdc`)
sequelize.authenticate()
  .then(() => {
    console.log(`Connected to DB via Sequelize at Port ${process.env.PGPORT}`)
  }).catch((error) => {
    console.error('Unable to connect to the database: ', error)
  })

// MODALS for SEQUELIZE
const Reviews = sequelize.define('reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER
  },
  date: {
    type: DataTypes.BIGINT
  },
  summary: {
    type: DataTypes.TEXT
  },
  body: {
    type: DataTypes.TEXT
  },
  recommend: {
    type: DataTypes.BOOLEAN
  },
  reported: {
    type: DataTypes.BOOLEAN
  },
  reviewer_name: {
    type: DataTypes.STRING
  },
  reviewer_email: {
    type: DataTypes.STRING
  },
  response: {
    type: DataTypes.STRING
  },
  helpfulness: {
    type: DataTypes.INTEGER,
  }
}, {
  timestamps: false
})

const Photos = sequelize.define('photos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  review_id: {
    type: DataTypes.INTEGER
  },
  url: {
    type: DataTypes.STRING
  }
})

const Characteristics_Reviews = sequelize.define('characteristics_reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  characteristics_id: {
    type: DataTypes.INTEGER
  },
  review_id: {
    type: DataTypes.INTEGER
  },
  value: {
    type: DataTypes.INTEGER
  }
})

const Characteristics = sequelize.define('characteristics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  review_id: {
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING
  }
})

const Review = (data) => (
  {
    review_id: data.id,
    rating: data.rating,
    summary: data.summary,
    recommend: data.recommend,
    response: data.response,
    body: data.body,
    date: new Date(Number(data.date)).toISOString(),
    reviewer_name: data.reviewer_name,
    helpfulness: data.helpfulness,
    photos: []
  }
)

const Photo = (data) => (
  {
    id: data.id,
    url: data.url
  }
)

const Characteristics_Review = (data) => (
  {
    id: data.id,
    value: data.value
  }
)
// returns a photo array
const photosByReviewId = (review_id) => {
  const photos = []
  return Photos.findAll({
    attributes: ['id', 'url'],
    where: {
      review_id
    },
    benchmark: true,
    logging: console.log
  })
    .then(res => res.forEach((photo) => {
      photos.push(Photo(photo))
    }))
    .then(() => photos)
    .catch(err => console.log(err))
}
// returns a review object
const getReviewsByProductId = (product_id, count = 5, page = 1, sort = 'rating') => {
  return Reviews.findAll({
    attributes: ['id', 'rating', 'summary', 'recommend', 'response', 'body', 'date', 'reviewer_name', 'helpfulness'],
    where: {
      product_id,
      reported: false
    },
    offset: ((page - 1) * count),
    limit: count,
    order: [[sequelize.literal(`${sort}`), 'DESC']],
    subQuery: false,
    benchmark: true,
    logging: console.log
  })
    .then((res) => res.map((Review)))
    .catch(err => console.log(err))
}

// create a function that will run getReviewsByProductId first , have it return it's promise , take the reviewId
// run photosByReviewId and return the promise , finally combine the two and return the final array
const getReviews = (product_id, count = 5, page = 1, sort = 'relevant') => {
  let reviewArr = []
  if (sort === 'relevant') {
    sort = 'rating'
  } else if (sort === 'newest') {
    sort = 'date'
  } else if (sort === 'helpful') {
    sort = 'helpfulness'
  }
  return getReviewsByProductId(product_id, count, page, sort)
    .then((res) => {
      reviewArr = res
      const array = []
      reviewArr.forEach((rev) => {
        array.push(photosByReviewId(rev.review_id))
      })
      return Promise.all(array)
    })
    .then((res) => {
      res.forEach((photo, i) => {
        reviewArr[i].photos = photo
      })
      return reviewArr
    })
    .catch((err) => {
      console.log(err)
    })
}

/// META DATA QUERIES
const getMetaData = (product_id) => {
  const recommendedObj = {
    true: 0,
    false: 0
  }
  const ratingsObj = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  }
  const obj = {}
  return Reviews.findAll({
    attributes: ['product_id', 'recommend', 'rating'],
    where: {
      product_id
    },
    benchmark: true,
    logging: console.log
  })
    .then((res) => res.forEach((rec) => {
      recommendedObj[rec.recommend]++
      ratingsObj[rec.rating]++
    }))
    .then(() => {
      obj.ratings = ratingsObj
      obj.recommended = recommendedObj
    })
    .then(() => {
      return getCharByProductId(product_id)
        .then((res) => {
          obj.characteristics = res
        })
        .catch(err => console.log(err))
    })
    .then(() => obj)
    .catch(err => console.log(err))
}

const getCharReviewByCharId = (characteristics_id) => {
  const charObj = {
    id: 0,
    value: ''
  }
  return Characteristics_Reviews.findAll({
    attributes: ['id', 'value'],
    where: {
      characteristics_id
    }
  })
    .then((res) => res.forEach((char) => {
      charObj.id = char.id
      charObj.value = char.value
    }))
    .then(() => charObj)
}

const getCharByProductId = (product_id) => {
  const characteristics = {}
  return Characteristics.findAll({
    attributes: ['id', 'name'],
    where: {
      product_id
    }
  })
    .then(chars => {
      const result = []
      chars.forEach((char) => {
        characteristics[char.name] = {}


        result.push(getCharReviewByCharId(char.id))
      })
      return Promise.all(result)
    })
    .then((res) => {
      let count = 0
      for (const name in characteristics) {
        characteristics[name] = res[count]
        count++
      }
    }
    )
    .then(() => characteristics)
    .catch((err) => console.log(err))
}

// PUT REQUESTS

const reviewHelpful = (review_id) => {
 return Reviews.update(
    { helpfulness: sequelize.literal('helpfulness + 1') },
    {
      where: {
        id: review_id
      }
    },
    { timestamps: false },
    { benchmark: true },
    { logging: console.log }
  )
    .then((res) => res)
    .catch((err) => console.log(err))
}

//console.log(reviewHelpful(1))
module.exports = {
  getReviews, getMetaData, reviewHelpful
}

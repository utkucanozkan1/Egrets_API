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
    type: DataTypes.INTEGER
  }
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

const Characteristic_Reviews = sequelize.define('characteristic_reviews', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  characteristic_id: {
    type: DataTypes.INTEGER
  },
  review_id: {
    type: DataTypes.INTEGER
  },
  value: {
    type: DataTypes.INTEGER
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
    date: new Date(Number(data.date)).toISOString().substring(0, 10),
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
  return getReviewsByProductId(product_id,count,page,sort)
    .then((res) => {
      reviewArr = res
      const array = []
      reviewArr.forEach((rev) => {
        array.push(photosByReviewId(rev.review_id))
      })
      return Promise.all(array);
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

module.exports = {
  getReviews
}

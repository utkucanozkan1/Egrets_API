/* eslint-disable camelcase */

const { Sequelize, DataTypes } = require('sequelize')
const Promise = require('bluebird')
require('dotenv').config()
// Option 1: Passing a connection URI
const sequelize = new Sequelize(`postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@localhost:${process.env.PGPORT}/sdctest`)
// sequelize.authenticate()
//   .then(() => {
//     console.log(`Connected to DB via Sequelize at Port ${process.env.PGPORT}`)
//   }).catch((error) => {
//     console.error('Unable to connect to the database: ', error)
//   })

// MODALS for SEQUELIZE
const Reviews = sequelize.define('reviews', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
}, {
  freezeTableName: true,
  timestamps: false
})

const Photos = sequelize.define('photos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  review_id: {
    type: DataTypes.INTEGER
  },
  url: {
    type: DataTypes.STRING
  }
}, {
  freezeTableName: true,
  timestamps: false
})

const Characteristics_Reviews = sequelize.define('characteristics_reviews', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
}, {
  freezeTableName: true,
  timestamps: false
})

const Characteristics = sequelize.define('characteristics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  product_id: {
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

Reviews.hasMany(Photos, {
  foreignKey: 'review_id'
})
Reviews.belongsToMany(Characteristics, {
  through: Characteristics_Reviews,
  foreignKey: 'review_id',
  otherKey: 'characteristics_id'
})


// returns a photo array
// const photosByReviewId = (review_id) => {
//   const photos = []
//   return Photos.findAll({
//     attributes: ['id', 'url'],
//     where: {
//       review_id
//     }
//   })
//     .then(res => res.forEach((photo) => {
//       photos.push(Photo(photo))
//     }))
//     .then(() => photos)
//     .catch(err => 400)
// }
// returns a review object
// const getReviewsByProductId = (product_id, count = 5, page = 1, sort = 'rating') => {
//   return Reviews.findAll({
//     attributes: ['id', 'rating', 'summary', 'recommend', 'response', 'body', 'date', 'reviewer_name', 'helpfulness'],
//     where: {
//       product_id,
//       reported: false
//     },
//     offset: ((page - 1) * count),
//     limit: count,
//     order: [[sequelize.literal(`${sort}`), 'DESC']],
//     subQuery: false
//   })
//     .then((res) => res.map((Review)))
//     .catch(err => 400)
// }

// create a function that will run getReviewsByProductId first , have it return it's promise , take the reviewId
// run photosByReviewId and return the promise , finally combine the two and return the final array
// const getReviews = (product_id, count = 5, page = 1, sort = 'relevant') => {
//   let reviewArr = []
//   if (sort === 'relevant') {
//     sort = 'rating'
//   } else if (sort === 'newest') {
//     sort = 'date'
//   } else if (sort === 'helpful') {
//     sort = 'helpfulness'
//   }
//   return getReviewsByProductId(product_id, count, page, sort)
//     .then((res) => {
//       reviewArr = res
//       const array = []
//       reviewArr.forEach((rev) => {
//         array.push(photosByReviewId(rev.review_id))
//       })
//       return Promise.all(array)
//     })
//     .then((res) => {
//       res.forEach((photo, i) => {
//         reviewArr[i].photos = photo
//       })
//       return reviewArr
//     })
//     .catch((err) => {
//       400
//     })
// }

const getReviews = (id, page = 1, count = 5, sort = 'relevant') => {
  if (sort === 'relevant') {
    sort = 'rating'
  } else if (sort === 'newest') {
    sort = 'date'
  } else if (sort === 'helpful') {
    sort = 'helpfulness'
  }
  return Reviews.findAll({
    include: [
      {
        model: Photos,
        attributes: ['id', 'url']
      }
    ],
    where: {
      product_id: id,
      reported: false
    },
    limit: count,
    offset: (page - 1) * count,
    order: [[sequelize.literal(`${sort}`), 'DESC']]
  })
    .then(reviews => reviews.map(review => {
      return {
        review_id: review.id,
        rating: review.rating,
        summary: review.summary,
        recommend: review.recommend,
        response: review.response,
        body: review.body,
        date: new Date(Number(review.date)).toISOString(),
        reviewer_name: review.reviewer_name,
        helpfulness: review.helpfulness,
        photos: review.photos
      }
    }))
    .catch(err => 'err')
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
    }
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
    .catch((err) => 'err')
}

// PUT QUERIES

const reviewHelpful = (review_id) => {
  return Reviews.update(
    { helpfulness: sequelize.literal('helpfulness + 1') },
    {
      where: {
        id: review_id
      }
    },
    { timestamps: false }
  )
    .then((res) => res)
    .catch((err) => console.log(err))
}

const reviewReport = (review_id) => {
  return Reviews.update(
    { reported: true },
    {
      where: {
        id: review_id
      }
    },
    { timestamps: false }
  )
    .then((res) => res)
    .catch((err) => 'err')
}

// POST REVIEW
const addReview = (product_id, rating, summary, body, recommend, name, email, photos, characteristics) => {
  return Reviews.create({
    product_id,
    rating,
    date: Date.now(),
    body,
    summary,
    recommend,
    reported: false,
    reviewer_name: name,
    reviewer_email: email,
    response: null,
    helpfulness: 0
  }
  )
    .then((data) => {
      const photoArr = []
      if (photos.length > 0) {
        photos.forEach((photo) => (
          photoArr.push(Photos.create({
            review_id: data.id,
            url: photo
          }))
        ))
      }
      for (const key in characteristics) {
        // key is the characteristics_id , characteristics[key] is the value
        photoArr.push(Characteristics_Reviews.update({
          characteristics_id: key,
          review_id: data.id,
          value: sequelize.literal(` (value + ${characteristics[key]})/ 2`)
        },
        {
          where: {
            characteristics_id: key
          }
        })
        )
      }
      return Promise.all(photoArr)
    })
    .then(data => data)
    .catch(err => 'err')
}

module.exports = {
  getReviews, getMetaData, reviewHelpful, reviewReport, addReview
}


# Egrets - Ratings & Reviews API

Ratings & Reviews API for an E-Commerce Web Application


## Authors

- [@utkucanozkan1](https://www.github.com/utkucanozkan1)


## API Reference
#### Use of Parameters
In an HTTP GET request, parameters are sent as a query string:

```http
 http://example.com/page?parameter=value&also=another
```
In an HTTP POST or PUT request, the parameters are not sent along with the URL, but in the request body. Parameters noted for each route below follow this standard.
#### Get reviews

Returns a list of reviews for a particular product. This list does not include any reported reviews.
```http
  GET /reviews/:product_id/list
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `product_id` | `integer` | Specifies the product for which to retrieve reviews. |
| `page` | `integer` | Selects the page of results to return. Default 1. |
| `count` | `integer` | Specifies how many results per page to return. Default 5. |
| `sort` | `string` | Changes the sort order of reviews to be based on "newest", "helpful", or "relevant" |

Response

Status: 200 OK

```bash
{
  "product": "2",
  "page": 0,
  "count": 5,
  "results": [
    {
      "review_id": 5,
      "rating": 3,
      "summary": "I'm enjoying wearing these shades",
      "recommend": 0,
      "response": "",
      "body": "Comfortable and practical.",
      "date": "2019-04-14T00:00:00.000Z",
      "reviewer_name": "shortandsweeet",
      "helpfulness": 5,
      "photos": [{
          "id": 1,
          "url": "urlplaceholder/review_5_photo_number_1.jpg"
        },
        {
          "id": 2,
          "url": "urlplaceholder/review_5_photo_number_2.jpg"
        },
        // ...
      ]
    },
    {
      "review_id": 3,
      "rating": 4,
      "summary": "I am liking these glasses",
      "recommend": 0,
      "response": "Glad you're enjoying the product!",
      "body": "They are very dark. But that's good because I'm in very sunny spots",
      "date": "2019-06-23T00:00:00.000Z",
      "reviewer_name": "bigbrotherbenjamin",
      "helpfulness": 5,
      "photos": [],
    },
    // ...
  ]
}
```
#### Get Reviews Meta Data

```http
  GET /reviews/:product_id/meta
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `product_id`      | `integer` | **Required**. Id of product to fetch |


Response

Status: 200 OK

```bash
{
  "product_id": "2",
  "ratings": {
    2: 1,
    3: 1,
    4: 2,
    // ...
  },
  "recommended": {
    0: 5
    // ...
  },
  "characteristics": {
    "Size": {
      "id": 14,
      "value": "4.0000"
    },
    "Width": {
      "id": 15,
      "value": "3.5000"
    },
    "Comfort": {
      "id": 16,
      "value": "4.0000"
    },
    // ...
}
```

#### Add a Review

Adds a review for the given product.

```http
  POST /reviews/:product_id
```
Parameters

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `product_id`      | `integer` | **Required**. Id of product to post reviews for |

Body Parameters

 Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `rating`      | `integer` | 	Integer (1-5) indicating the review rating |
| `summary`      | `text` | Summary text of the review |
| `body`      | `text` | Continued or full text of the review |
| `recommend`      | `bool` | Value indicating if the reviewer recommends the product |
| `name`      | `text` | 	Username for question asker |
| `email`      | `text` | Email address for question asker|
| `photos`      | `[text]` | Array of text urls that link to images to be shown |
| `characteristics`      | `object` | Object of keys representing characteristic_id and values representing the review value for that characteristic. { "14": 5, "15": 5 //...} |

Response

Status: 201 CREATED


#### Mark Review as helpful
Updates a review to show it was found helpful.

```http
  PUT /reviews/helpful/:review_id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `review_id` | `integer` | 	Required ID of the review to update|

Response

Status: 204 NO CONTENT

#### Report a Review 

Updates a review to show it was reported. Note, this action does not delete the review, but the review will not be returned in the above GET request.

```http
  PUT /reviews/report/:review_id
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `review_id` | `integer` | 	Required ID of the review to report|

Response

Status: 204 NO CONTENT
## Optimizations

| Optimizations | Description|
| :-------- |  :------------------------- |
| `Indexing` |  Indexing of foreign keys , and columns that are filtered|
| `Associations` |  Associations between tables utilizing Sequelize|
| `Redis Caching` |  Caching of previously queried results|
| `Horizontal Scaling & Load Balancing` |  Scaling of server instances and utilizing NGINX to load balance between servers |

## Screenshots



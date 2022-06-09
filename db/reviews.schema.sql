

CREATE TABLE IF NOT EXISTS reviews (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "rating" INTEGER,
    "date" BIGINT,
    "summary" TEXT,
    "body" TEXT,
    "recommend" BOOLEAN,
    "reported" BOOLEAN,
    "reviewer_name" VARCHAR,
    "reviewer_email" VARCHAR,
    "response" VARCHAR,
    "helpfulness" INTEGER
);

CREATE TABLE IF NOT EXISTS photos (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "review_id" INTEGER REFERENCES reviews(id),
    "url" VARCHAR
);

CREATE TABLE IF NOT EXISTS characteristics (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "product_id" INTEGER REFERENCES reviews,
    "name" VARCHAR
);

CREATE TABLE IF NOT EXISTS characteristic_reviews (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "characteristic_id" INTEGER REFERENCES characteristics(id),
    "review_id" INTEGER REFERENCES reviews(id),
    "value" INTEGER
);

CREATE TABLE IF NOT EXISTS recommended (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "product_id" INTEGER REFERENCES reviews,
  "recommend" BOOLEAN
);

CREATE TABLE IF NOT EXISTS ratings (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "product_id" INTEGER REFERENCES reviews,
  "ratings" INTEGER
);

CREATE TABLE IF NOT EXISTS ratings (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY AUTOINCREMENT,
  "product_id" INTEGER REFERENCES reviews,
  "rating" INTEGER
);

COPY reviews
FROM
    '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/reviews.csv' csv header;

COPY photos
FROM '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/reviews_photos.csv' csv header;

COPY characteristics
FROM '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/characteristics.csv'
csv header;

COPY characteristic_reviews
FROM '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/characteristic_reviews.csv'
csv header;

COPY recommended
FROM '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/recommended.csv' csv header;

COPY ratings
FROM '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/ratings.csv' csv header;
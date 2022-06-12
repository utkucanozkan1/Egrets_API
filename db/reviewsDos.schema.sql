CREATE TABLE reviews(
    "id" SERIAL,
    "product_id" integer NOT NULL,
    "rating" integer NOT NULL,
    "date" bigint NOT NULL,
    "summary" text NOT NULL,
    "body" text,
    "recommend" boolean,
    "reported" boolean,
    "reviewer_name" VARCHAR NOT NULL,
    "reviewer_email" VARCHAR,
    "response" VARCHAR,
    "helpfulness" integer NOT NULL,
    CONSTRAINT "Primary key" PRIMARY KEY(id)
);

CREATE TABLE "characteristics"(
    "id" SERIAL,
    "product_id" integer NOT NULL,
    "name" VARCHAR,
    CONSTRAINT characteristics_pkey PRIMARY KEY(id)
);

CREATE TABLE characteristics_reviews(
    "id" SERIAL,
    "characteristics_id" integer,
    "review_id" integer,
    "value" integer
);

CREATE TABLE photos(
    "id" SERIAL,
    "review_id" integer NOT NULL,
    "url" VARCHAR
);

CREATE TABLE products( "id" integer NOT NULL UNIQUE );

ALTER TABLE
    characteristics_reviews
ADD
    CONSTRAINT characteristics_reviews_review_id_fkey FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE No action ON UPDATE No action;

ALTER TABLE
    characteristics_reviews
ADD
    CONSTRAINT characteristics_reviews_characteristics_id_fkey FOREIGN KEY (characteristics_id) REFERENCES "characteristics" (id);

ALTER TABLE
    photos
ADD
    CONSTRAINT photos_review_id_fkey FOREIGN KEY (review_id) REFERENCES reviews (id);

ALTER TABLE
    photos
ADD
    CONSTRAINT photos_id_pkey PRIMARY KEY (id);

ALTER TABLE
    characteristics_reviews
ADD
    CONSTRAINT characteristics_id_pkey PRIMARY KEY (id);

COPY reviews
FROM
    '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/reviews.csv' csv header;

COPY characteristics
FROM
    '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/characteristics.csv' csv header;

COPY characteristics_reviews
FROM
    '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/characteristic_reviews.csv' csv header;

COPY photos
FROM
    '/Users/utkucanozkan/Desktop/OtherProjects/Reviews/csv/reviews_photos.csv' csv header;

INSERT INTO products(id) SELECT DISTINCT product_id FROM reviews;

INSERT INTO
    products(id)
SELECT
    DISTINCT product_id
FROM
    characteristics ON CONFLICT (id) DO NOTHING;

ALTER TABLE
    reviews
ADD
    CONSTRAINT reviews_products_id_fkey FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE
    characteristics
ADD
    CONSTRAINT characteristics_products_id_fkey FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE
    products
ADD
    CONSTRAINT product_id_pkey PRIMARY KEY (id);

    CREATE INDEX reviews_product_index ON reviews (product_id);
    CREATE INDEX photos_review_index ON photos (review_id);
    CREATE INDEX characteristics_review_char_index ON characteristics_reviews (characteristics_id);
    CREATE INDEX characteristics_review_review_index ON characteristics_reviews (review_id);
    CREATE INDEX characteristics_product_id_index ON characteristics (product_id);


SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('photos_id_seq', (SELECT MAX(id) FROM photos));
SELECT setval('characteristics_id_seq', (SELECT MAX(id) FROM characteristics_reviews));

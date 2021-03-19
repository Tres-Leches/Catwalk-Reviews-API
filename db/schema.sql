-- CREATE DATABASE IF NOT EXISTS reviews_api;
-- USE reviews_api;

CREATE TABLE IF NOT EXISTS reviews(
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  rating INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary VARCHAR(255) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  recommend BOOLEAN DEFAULT false,
  reported BOOLEAN DEFAULT false,
  reviewer_name VARCHAR(60) NOT NULL,
  reviewer_email VARCHAR(60) NOT NULL,
  response VARCHAR(1000),
  helpfulness INT DEFAULT 0
)

CREATE TABLE IF NOT EXISTS reviews_photos(
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL,
  url VARCHAR(255)
)

CREATE TABLE IF NOT EXISTS characteristic_reviews(
  id SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  value INT DEFAULT 0
)

CREATE TABLE IF NOT EXISTS characteristics(
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(20) NOT NULL
)
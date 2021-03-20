const db = require('./index.js');

const dbMethods = {
  getAllReviews: (params, callback) => {
    let sort, page;
    switch (params.sort) {
      case 'newest':
        sort = 'date';
        break;
      case 'helpful':
      case 'relevant':
        sort = 'helpfulness';
        break;
      default:
        sort = 'review_id';
        break;
    }
    switch(true) {
      case (params.page > 1):
        page = params.page - 1;
        break;
      case (params.page <= 1):
        page = 0;
        break;
    }
    let object = {
      product: params.product_id,
      page: page || 0,
      count: params.count || 5,
    };

    const query = `
      WITH response AS (
        SELECT r.id AS review_id,
          r.rating,
          r.summary,
          r.recommend,
          r.response,
          r.body,
          r.date,
          r.reviewer_name,
          r.helpfulness,
          COALESCE(json_agg(
            json_build_object('photo_id', p.id, 'url', p.url)) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
        FROM reviews r
        LEFT JOIN reviews_photos p ON r.id = p.review_id
        WHERE r.product_id = ${object.product}
        GROUP BY r.id
        OFFSET ${object.page * object.count} ROWS
        FETCH FIRST ${object.count} ROWS ONLY
      )
      SELECT * FROM response ORDER BY ${sort} DESC
    `;
    db.query(query)
      .then((res) => {
        object.results = res.rows;
        callback(null, object)})
      .catch((err) => callback(err));
  },

  getMetadataById: (params, callback) => {
    let object = {
      product_id: params.product_id,
    };
    const ratingsQuery = `
      WITH ratings AS (
        SELECT rating, COUNT(rating)
        FROM reviews
        WHERE product_id = ${params.product_id}
        GROUP BY rating
        ORDER BY rating ASC
        )

      SELECT json_object_agg(rating, count) AS ratings
      FROM ratings;
    `;
    const recommendedQuery = `
      WITH recommended AS (
        SELECT recommend, COUNT(recommend)
        FROM reviews
        WHERE product_id = ${params.product_id}
        GROUP BY recommend
        ORDER BY recommend ASC
        )

      SELECT json_object_agg(recommend, count) AS recommended
      FROM recommended;
    `;
    const characteristicsQuery = `
      WITH characteristics AS (
        SELECT
          cr.characteristic_id,
          c.name,
          AVG(cr.value)::numeric(10,2) as value
        FROM characteristic_reviews cr
          JOIN reviews r ON cr.review_id = r.id
          JOIN characteristics c ON c.id = cr.characteristic_id
        WHERE r.product_id = ${params.product_id}
        GROUP BY c.name, cr.characteristic_id
        ORDER BY cr.characteristic_id ASC
        )
      SELECT
        json_object_agg(name, json_build_object('id', characteristic_id, 'value', value))
        AS characteristics
      FROM characteristics;
    `;
  db.query(ratingsQuery)
    .then((res) => {
      object.ratings = res.rows[0].ratings;
     })
     .then(() => {
       db.query(recommendedQuery)
       .then((res) => {
         object.recommended = res.rows[0].recommended;
       })
     })
     .then(() => {
      db.query(characteristicsQuery)
      .then((res) => {
        object.characteristics = res.rows[0].characteristics;
        callback(null, object)
      })
    })
    .catch((err) => callback(err));
  },

  postReviewById: (req_body, callback) => {
    const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req_body;
    const insReviewsQuery = `
      INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email)
      VALUES (${product_id}, ${rating}, '${summary}', '${body}', ${recommend}, '${name}', '${email}')
    `;
    console.log('photos', photos);
    if (photos.length > 0) {
      var insPhotosQuery = `INSERT INTO reviews_photos(review_id, url) VALUES`;
      for (let i = 0; i < photos.length; i++) {
        if (i === photos.length - 1) {
          insPhotosQuery += ` \ (currval(pg_get_serial_sequence('reviews', 'id')), '${photos[i]}')`;
        } else {
          insPhotosQuery += ` \ (currval(pg_get_serial_sequence('reviews', 'id')), '${photos[i]}'),`;
        }
      }
    } else {
      var insPhotosQuery = null;
    }

    console.log(insPhotosQuery);
    db.query(insReviewsQuery)
      .then(() => {
        console.log('l146', insPhotosQuery);
        if (insPhotosQuery) {
          console.log('l148', insPhotosQuery)
          db.query(insPhotosQuery);
        }
      })
      .then(() => callback(null, 'CREATED'))
      .catch((err) => console.log('err',err));
  },

  markReviewAsHelpful: (callback) => {
    callback(null, 'markReviewAsHelpful')
  },

  reportReview: (callback) => {
    callback(null, 'reportReview')
  },
}

module.exports = dbMethods;
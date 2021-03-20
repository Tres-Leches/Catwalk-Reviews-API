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
            json_build_object('id', p.id, 'url', p.url)) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
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
    console.log(product_id);
    const insReviewsQuery = `
      INSERT INTO reviews(product_id, rating, summary, body, recommend, reviewer_name, reviewer_email)
      VALUES (${product_id}, ${rating}, '${summary}', '${body}', ${recommend}, '${name}', '${email}')
    `;

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

    const len = Object.keys(characteristics).length;
    if (len > 0) {
      let i = 0;
      var insCharQuery = `INSERT INTO characteristics_reviews(characteristic_id, review_id, value) VALUES`;
      for (let id in characteristics) {
        if (i === len - 1) {
          insCharQuery += ` \ (${id}, currval(pg_get_serial_sequence('reviews', 'id')), ${characteristics[id]})`;
        } else {
          insCharQuery += ` \ (${id}, currval(pg_get_serial_sequence('reviews', 'id')), ${characteristics[id]}),`;
        }
        i++;
      }
    } else {
      var insCharQuery = null;
    }

    db.query(insReviewsQuery)
      .then(() => {
        if (insPhotosQuery) {
          db.query(insPhotosQuery);
        }
      })
      .then(() => {
        if (insCharQuery) {
          db.query(insCharQuery);
        }
      })
      .then(() => callback(null, 'CREATED'))
      .catch((err) => callback(err));
  },

  markReviewAsHelpful: (review_id, callback) => {
    const helpfulQuery = `
      UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${review_id}
    `;
    db.query(helpfulQuery)
      .then(() => callback(null))
      .catch((err) => callback(err));
  },

  reportReview: (review_id, callback) => {
    const reportQuery = `
      UPDATE reviews SET reported = true WHERE id = ${review_id}
    `;
    db.query(reportQuery)
      .then(() => callback(null))
      .catch((err) => callback(err));
  },
}

module.exports = dbMethods;
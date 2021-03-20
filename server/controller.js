const dbMethods = require('../db/dbMethods.js');

const controller = {
  getAllReviews: (req, res) => {
    const params = req.query;
    !params.product_id ?
      res.status(422).send('Error: Invalid product_id provided') :
      dbMethods.getAllReviews(params, (err, results) => {
        err ? res.status(400).send(err) : res.status(200).send(results);
      });
  },

  getMetadataById: (req, res) => {
    const params = req.query;
    !params.product_id ?
      res.status(422).send('Error: Invalid product_id provided') :
      dbMethods.getMetadataById(params, (err, results) => {
        err ? res.status(400).send(err) : res.status(200).send(results)
      })
  },

  postReviewById: (req, res) => {
    const body = req.body;
    !body ?
      res.status(422).send('Error: Invalid product_id provided') :
      dbMethods.postReviewById(body, (err, results) => {
        err ? res.status(400).send(err) : res.status(200).send(results)
      })
  },

  markReviewAsHelpful: (req, res) => {
    dbMethods.markReviewAsHelpful((err, results) => {
      err ? res.status(400).send(err) : res.status(200).send(results)
    })
  },

  reportReview: (req, res) => {
    dbMethods.reportReview((err, results) => {
      err ? res.status(400).send(err) : res.status(200).send(results)
    })
  },
}

module.exports = controller;
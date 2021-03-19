const dbMethods = require('../db/dbMethods.js');

const controller = {
  getAllReviews: (req, res) => {
    const params = req.query;
    dbMethods.getAllReviews(params, (err, results) => {
      err ? res.status(400).send(err) : res.status(200).send(results)
    })
  },

  getMetadataById: (req, res) => {
    const params = req.query;
    dbMethods.getMetadataById(params, (err, results) => {
      err ? res.status(400).send(err) : res.status(200).send(results)
    })
  },

  postReviewById: (req, res) => {
    dbMethods.postReviewById((err, results) => {
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
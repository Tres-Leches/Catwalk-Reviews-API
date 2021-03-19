const router = require('express').Router();
const controller = require('./controller.js')

router.route('/reviews')
  .get(controller.getAllReviews)
  .post(controller.postReviewById);

router.route('/reviews/meta')
  .get(controller.getMetadataById);

router.route('/reviews/:review_id/helpful')
  .put(controller.markReviewAsHelpful);

router.route('/reviews/:review_id/report')
  .put(controller.reportReview);

module.exports = router;
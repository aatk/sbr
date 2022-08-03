const router = require('express').Router();
const TestController = require('../controllers/Test.controller');

router.route('/:id').get(TestController.get)
router.route('/test').post(TestController.post)
router.route('/:id').put(TestController.put)
router.route('/:id').delete(TestController.del)

module.exports = router;

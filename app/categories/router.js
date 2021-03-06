const router = require('express').Router();
const multer = require('multer');
const categoryController = require('./controller');

router.post('/categories', multer().none(), categoryController.store);
router.get('/categories', categoryController.index);
router.put('/categories/:id', multer().none(), categoryController.update);
router.delete('/categories/:id', multer().none(), categoryController.destroy);

module.exports = router;
const router = require('express').Router();
const multer = require('multer');
const tagController = require('./controller');

router.post('/tags', multer().none(), tagController.store);
router.get('/tags', tagController.index);
router.put('/tags/:id', multer().none(), tagController.update);
router.delete('/tags/:id', tagController.destroy);

module.exports = router;
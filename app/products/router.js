// Import Router Dari Express
const router = require('express').Router();

// Import Multer Supaya Bisa Store Pakai FormData
const multer = require('multer');
const os = require('os');

// Import Product Controller
const productController = require('./controller');

// Pasangkan Route EndPoint dengan Method 'store'
// router.post('/products', multer().none(), productController.store);

// Menyesuaikan Router Untuk Upload Image
router.post('/products', multer({ dest: os.tmpdir() }).single('image'), productController.store);
router.get('/products', productController.index);
router.put('/products/:id', multer({ dest: os.tmpdir() }).single('image'), productController.update);
router.delete('/products/:id', productController.destroy);

module.exports = router;
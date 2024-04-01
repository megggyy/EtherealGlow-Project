const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadOptions } = require('../utils/cloudinary');

router.get(`/getProductCountByCategory`, productController.getProductCountByCategory);
router.get(`/`, productController.getProductList);
router.get(`/:id`, productController.getProductById);
router.post(`/`, uploadOptions.array('image', 5), productController.createProduct);
router.put('/:id', uploadOptions.array('image', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
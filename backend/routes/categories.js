const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { uploadOptions } = require('../utils/cloudinary');

router.get(`/`, categoryController.getCategoryList);
router.get('/:id', categoryController.getCategoryById);
router.post(`/`, uploadOptions.array('image', 5), categoryController.createCategory);
router.put('/:id', uploadOptions.array('image', 5), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
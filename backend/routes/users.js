const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadOptions } = require('../utils/cloudinary');

router.post('/wishlist/:id', userController.createWish);
router.post('/wishlist', userController.getUserWishlist);
router.get('/usersPerMonth', userController.getUsersPerMonth);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.post('/login', userController.loginUser);
router.post('/register', uploadOptions.single('image'), userController.registerUser);
router.delete('/:id', userController.deleteUser);
router.get('/get/count', userController.getUserCount);

// Wishlist
// router
//   .route('/wishlist')
  // .post(userController.createWish)
//   .get(userController.getUserWishlist);

// router.get('/wishlist/:id', userController.getWish);
// router.delete('/wishlist/:id', userController.deleteWish);


module.exports = router;


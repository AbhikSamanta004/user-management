const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { userCreateValidation, userUpdateValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect); 

router
  .route('/')
  .get(authorize('Admin', 'Manager'), getUsers)
  .post(authorize('Admin'), userCreateValidation, createUser);

router
  .route('/:id')
  .get(getUser)
  .put(userUpdateValidation, updateUser)
  .delete(authorize('Admin'), deleteUser);

module.exports = router;

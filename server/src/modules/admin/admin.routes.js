const express = require('express');
const adminController = require('./admin.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { rbacMiddleware } = require('../../middleware/rbac.middleware');

const router = express.Router();

// Gate all routes below under Auth and RBAC Admin role constraints
router.use(authMiddleware, rbacMiddleware('admin'));

router.get('/dashboard', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserBlock);

module.exports = router;

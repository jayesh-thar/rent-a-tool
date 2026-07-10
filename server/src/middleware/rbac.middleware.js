// Checks if the authenticated user has one of the allowed roles for this route.
// Must be used AFTER authMiddleware (which attaches req.user with roles).
// Usage: router.get('/admin/dashboard', authMiddleware, rbacMiddleware('admin'), handler)
function rbacMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        message: 'Access denied — insufficient permissions',
      });
    }

    next();
  };
}

module.exports = { rbacMiddleware };

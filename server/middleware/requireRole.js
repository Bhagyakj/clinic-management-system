// Use after authMiddleware. authMiddleware puts { id, role } on req.user
// (role is the raw designation string, e.g. "Manager", "Senior Doctor").
export default function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: `This action requires one of: ${allowed.join(', ')}` });
    }
    next();
  };
}

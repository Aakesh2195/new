// Reserved for future resource-level authorization.
const ownershipMiddleware = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);
  if (!req.user || String(ownerId) !== String(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  }
  next();
};

export default ownershipMiddleware;

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send('Token has expired');
    }
    return res.status(401).send('Invalid Token');
  }
  return next();
};

module.exports = auth;

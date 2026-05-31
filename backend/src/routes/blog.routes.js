const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getPosts, getPostBySlug, createPost, updatePost, deletePost } = require('../controllers/blog.controller');

// Public can list/view published posts (auth optional)
router.get('/', (req, res, next) => {
  // Try to authenticate but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return auth(req, res, next);
  }
  next();
}, getPosts);

router.get('/:slug', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) return auth(req, res, next);
  next();
}, getPostBySlug);

router.post('/', auth, authorize('admin', 'teacher'), createPost);
router.put('/:id', auth, authorize('admin', 'teacher'), updatePost);
router.delete('/:id', auth, authorize('admin'), deletePost);

module.exports = router;

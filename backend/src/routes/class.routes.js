const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/class.controller');

router.get('/me', auth, c.myClasses);
router.get('/', auth, authorize('admin', 'teacher'), c.listClasses);
router.get('/:id', auth, c.getClass);
router.post('/', auth, authorize('admin'), c.createClass);
router.put('/:id', auth, authorize('admin'), c.updateClass);
router.delete('/:id', auth, authorize('admin'), c.deleteClass);
router.post('/:id/students', auth, authorize('admin'), c.addStudent);
router.delete('/:id/students/:studentId', auth, authorize('admin'), c.removeStudent);

module.exports = router;

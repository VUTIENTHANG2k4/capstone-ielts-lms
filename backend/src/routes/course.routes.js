const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse } = require('../controllers/course.controller');

router.get('/', auth, getCourses);
router.get('/:id', auth, getCourseById);
router.post('/', auth, authorize('admin'), createCourse);
router.put('/:id', auth, authorize('admin'), updateCourse);
router.delete('/:id', auth, authorize('admin'), deleteCourse);
router.post('/:id/enroll', auth, authorize('student'), enrollCourse);

module.exports = router;

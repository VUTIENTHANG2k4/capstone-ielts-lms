const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getSections, getSectionById, createSection, updateSection, deleteSection } = require('../controllers/section.controller');

router.get('/unit/:unitId', auth, getSections);
router.get('/:id', auth, getSectionById);
router.post('/', auth, authorize('admin'), createSection);
router.put('/:id', auth, authorize('admin'), updateSection);
router.delete('/:id', auth, authorize('admin'), deleteSection);

module.exports = router;

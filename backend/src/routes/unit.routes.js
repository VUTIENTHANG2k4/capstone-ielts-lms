const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getUnits, getUnitById, createUnit, updateUnit, deleteUnit } = require('../controllers/unit.controller');

router.get('/course/:courseId', auth, getUnits);
router.get('/:id', auth, getUnitById);
router.post('/', auth, authorize('admin'), createUnit);
router.put('/:id', auth, authorize('admin'), updateUnit);
router.delete('/:id', auth, authorize('admin'), deleteUnit);

module.exports = router;

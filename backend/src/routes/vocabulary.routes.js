const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getMyLists, getPublicLists, createList, updateList, deleteList,
  getItems, addItem, updateItem, deleteItem,
  getDueItems, reviewItem
} = require('../controllers/vocabulary.controller');

// Lists
router.get('/my-lists', auth, getMyLists);
router.get('/public', auth, getPublicLists);
router.post('/lists', auth, authorize('student', 'teacher', 'admin'), createList);
router.put('/lists/:id', auth, updateList);
router.delete('/lists/:id', auth, deleteList);

// Items
router.get('/lists/:listId/items', auth, getItems);
router.post('/lists/:listId/items', auth, addItem);
router.put('/items/:id', auth, updateItem);
router.delete('/items/:id', auth, deleteItem);

// Spaced repetition
router.get('/due', auth, getDueItems);
router.post('/review', auth, reviewItem);

module.exports = router;

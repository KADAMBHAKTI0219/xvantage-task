const express = require('express');
const { 
  getAllContacts, 
  getContactById, 
  createContact, 
  updateContact, 
  deleteContact 
} = require('../controllers/contactcontrollers');

const router = express.Router();

// GET /api/contacts - Get all contacts
router.get('/', getAllContacts);

// GET /api/contacts/:id - Get single contact
router.get('/:id', getContactById);

// POST /api/contacts - Create new contact
router.post('/', createContact);

// PUT /api/contacts/:id - Update contact
router.put('/:id', updateContact);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', deleteContact);

module.exports = router;
const Contact = require('../models/contact');

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Get total count for pagination
    const totalCount = await Contact.countDocuments(query);
    
    // Get paginated contacts
    const contacts = await Contact.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNumber)
      .lean();
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// Get single contact by ID
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

// Create new contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if contact with same email already exists
    const existingContact = await Contact.findOne({ email: email.toLowerCase() });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists'
      });
    }
    
    const contact = new Contact({ name, email, phone });
    await contact.save();
    
    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating contact',
      error: error.message
    });
  }
};

// Update contact
const updateContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if email already exists for another contact
    if (email) {
      const existingContact = await Contact.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Another contact with this email already exists'
        });
      }
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};
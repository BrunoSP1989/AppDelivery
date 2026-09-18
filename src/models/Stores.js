const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  cnpj:{
    type: String,
    required: true
  },
  fantasia:{
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  password: { 
    type: String, 
    required: true 
  },
  slug:{
    type: String,
    required: true,
  },
  role: { 
    type: String, 
    enum: ['manager', 'admin'], 
    default: 'manager' 
  }
});

module.exports = mongoose.model('Store', storeSchema, 'Store');

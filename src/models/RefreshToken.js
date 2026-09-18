const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  refreshToken: { 
    type: String, 
    required: true, 
    unique: true 
  },
  storeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: '7d'
  }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema,'RefreshTokens');

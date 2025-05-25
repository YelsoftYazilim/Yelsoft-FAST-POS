const mongoose = require('mongoose');

const anaGrupSchema = new mongoose.Schema({
  ad: { 
    type: String, 
    required: true 
  },
  aciklama: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('AnaGrup', anaGrupSchema);
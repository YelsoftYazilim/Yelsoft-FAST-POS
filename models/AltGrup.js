const mongoose = require('mongoose');

const altGrupSchema = new mongoose.Schema({
  ad: { 
    type: String, 
    required: true 
  },
  anaGrupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AnaGrup',
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

module.exports = mongoose.model('AltGrup', altGrupSchema);
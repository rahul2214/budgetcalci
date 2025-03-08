const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v); // Validate 10-digit phone number
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

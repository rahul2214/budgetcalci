// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
  },
  enterprise: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMode: {
    type: String,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Reference to the Client model
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;

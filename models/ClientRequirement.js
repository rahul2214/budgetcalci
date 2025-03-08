const mongoose = require('mongoose');

// Define the schema for Client Requirement
const clientRequirementSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Reference to the Client model
    required: true,
  },
  sourceOfWork: {
    type: String,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
},
{
    timestamps: true, // This will add createdAt and updatedAt fields
});

// Create the model from the schema
const ClientRequirement = mongoose.model('ClientRequirement', clientRequirementSchema);

module.exports = ClientRequirement;

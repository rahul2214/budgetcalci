const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ClientRequirement = require('./models/ClientRequirement');
const Client = require('./models/Client'); // Import the Client model
const Vendor = require('./models/Vendor');
const app = express();
const port = 8000;
const cors = require('cors');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());


mongoose
  .connect('mongodb+srv://dyrahulnaik22:gugulothu@cluster0.nj8t10b.mongodb.net/')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.log('Error connecting to MongoDB', error);
  });

  app.listen(port, () => {
    console.log(`server is running on ${port}`);
  });
  
// Assuming you have a Client model in the backend (Express.js example)
app.post('/api/clients', async (req, res) => {
  try {
    const { name, gender, phoneNumber, location } = req.body;

    const newClient = new Client({ name, gender, phoneNumber, location });
    await newClient.save();

    // Respond with the saved client
    res.status(201).json({
      success: true,
      client: newClient,  // Return the client data
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to add client' });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find();  // Fetch all clients from the database
    res.status(200).json({
      success: true,
      clients: clients,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to fetch clients' });
  }
});

app.post('/api/client-requirements', async (req, res) => {
  const { clientName, sourceOfWork, amountPaid, paymentMethod, description } = req.body;

  try {
    // Find the client by name (assuming 'name' is unique for simplicity, otherwise use the client ID)
    const client = await Client.findOne({ name: clientName });

    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Create a new client requirement entry
    const newClientRequirement = new ClientRequirement({
      client: client._id,  // Use the client ID
      sourceOfWork,
      amountPaid,
      paymentMethod,
      description,
    });

    // Save the client requirement to the database
    await newClientRequirement.save();

    // Respond with the saved data
    res.status(201).json({
      success: true,
      clientRequirement: newClientRequirement,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to add client requirement' });
  }
});

// GET method for fetching all client requirements
app.get('/api/client-requirements', async (req, res) => {
  try {
    const clientRequirements = await ClientRequirement.find()
      .populate('client', 'name') // Populate the client details (only name in this case)
      .exec();

    res.status(200).json({
      success: true,
      clientRequirements, // Return the list of all client requirements
    });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to fetch client requirements' });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const { vendorName, enterprise, amountPaid, paymentMode, clientName, description } = req.body;

    // Find the client by name and get the client's ID
    const client = await Client.findOne({ name: clientName });
    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }

    // Create a new vendor entry
    const newVendor = new Vendor({
      vendorName,
      enterprise,
      amountPaid,
      paymentMode,
      client: client._id, // Store the client ID, not the name
      description,
    });

    await newVendor.save();

    res.status(201).json({
      success: true,
      vendor: newVendor,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

app.get('/api/vendors', async (req, res) => {
  try {
    // Populate the client reference with client name (optional)
    const vendors = await Vendor.find().populate('client', 'name'); // 'name' is the field to populate from the Client model

    res.status(200).json({
      vendors,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Fetch transactions for a specific client and calculate the balance
app.get('/api/transactions', async (req, res) => {
  try {
    const clientName = req.query.clientName;  // Get client name from query params
    const client = await Client.findOne({ name: clientName }); // Find client by name

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Fetch vendor transactions related to the found client by client._id
    const vendors = await Vendor.find({ client: client._id })
      .populate('client', 'name'); // Populate client name

    // Fetch client requirements for the same client
    const clientRequirements = await ClientRequirement.find({ client: client._id })
      .populate('client', 'name'); // Populate client name

    // Calculate the total amount paid by the client
    const totalClientAmount = clientRequirements.reduce((sum, req) => sum + req.amountPaid, 0);
    
    // Calculate the total amount paid to vendors
    const totalVendorAmount = vendors.reduce((sum, vendor) => sum + vendor.amountPaid, 0);

    // Calculate the balance (client amount - vendor amount)
    const balance = totalClientAmount - totalVendorAmount;

    // Determine the color based on the balance (positive = green, negative = red)
    const balanceColor = balance >= 0 ? 'green' : 'red';

    res.status(200).json({
      success: true,
      vendors: vendors, // Vendor transactions
      clientRequirements: clientRequirements, // Client requirements
      balance: balance,  // Total balance
      balanceColor: balanceColor, // Color for balance (green or red)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction data' });
  }
});

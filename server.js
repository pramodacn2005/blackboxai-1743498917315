const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory databases
let products = [];
let users = [];

// Auth Routes
app.post('/api/signup', async (req, res) => {
  const { name, fathersName, dob, branch, rollNo, section, address, mobileNo, password } = req.body;
  
  // Validate required fields
  if (!name || !rollNo || !password) {
    return res.status(400).json({ error: 'Name, Roll No and Password are required' });
  }

  // Check if user exists
  if (users.some(user => user.rollNo === rollNo)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = {
    name,
    fathersName,
    dob,
    branch,
    rollNo,
    section,
    address,
    mobileNo,
    password: hashedPassword
  };

  users.push(user);
  return res.status(201).json({ message: 'User created successfully' });
});

app.post('/api/signin', async (req, res) => {
  const { rollNo, password } = req.body;

  // Find user
  const user = users.find(user => user.rollNo === rollNo);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign({ rollNo: user.rollNo }, 'secret_key', { expiresIn: '1h' });
  return res.json({ token });
});

// Product Routes
app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product.title || !product.price) {
    return res.status(400).json({ error: 'Title and price are required' });
  }
  products.push(product);
  return res.status(201).json(product);
});

app.get('/api/products', (req, res) => {
  return res.json(products);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
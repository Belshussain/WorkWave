require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // Import db.js
const cors = require('cors'); // Import CORS middleware
const multer = require('multer'); // For handling file uploads
const path = require('path');
const session = require('express-session'); // Import express-session
const fs = require('fs'); // Import fs to check if uploads folder exists

const app = express();
const port = process.env.PORT || 5001;


app.use(express.static(path.join(__dirname, 'public')));


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Check 'uploads' directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir); // Create the uploads folder if doesn't exist
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Save images in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file renam
    }
});
const upload = multer({ storage: storage });


app.use(session({
  secret: 'your-session-secret',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

// Test Route
app.get('/test', (req, res) => {
    res.send('Test route working!');
});

// Register Route
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: 'Error creating account' });
                res.status(201).json({ message: 'Account created successfully' });
            });
    });
});

// Login Route (Modified to check admin status)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.is_admin }, 
            'your_jwt_secret', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            isAdmin: user.is_admin === 1 // Send isAdmin field to frontend
        });
    });
});


// Request Service Route (With Image Upload)
app.post('/request-service', upload.single('serviceImage'), (req, res) => {
    const { email, serviceType, description, location } = req.body;
    const serviceImage = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

    // Ensure that the required fields are provided
    if (!email || !serviceType || !description || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // If a file was uploaded, ensure serviceImage is set
    if (!serviceImage) {
        return res.status(400).json({ message: 'Service image is required' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found. Please create an account first!' });
        }

        const userId = results[0].id;
        db.query('INSERT INTO service_requests (user_id, service_type, description, location, status, service_image) VALUES (?, ?, ?, ?, ?, ?)', 
            [userId, serviceType, description, location, 'pending', serviceImage], (err) => {
                if (err) return res.status(500).json({ message: 'Error submitting request' });
                res.status(201).json({ message: 'Service request submitted successfully' });
            });
    });
});

// Admin retrieves all service requests
app.get('/admin/service-requests', (req, res) => {
    db.query('SELECT sr.id, sr.service_type, sr.description, sr.location, sr.status, sr.service_image, u.first_name, u.last_name, u.email FROM service_requests sr JOIN users u ON sr.user_id = u.id', 
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(200).json(results);
        });
});

// Admin approves a service request
app.post('/admin/approve/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE service_requests SET status = "approved" WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error approving request' });
        res.status(200).json({ message: 'Service request approved' });
    });
});

// Admin rejects a service request
app.post('/admin/reject/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE service_requests SET status = "rejected" WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error rejecting request' });
        res.status(200).json({ message: 'Service request rejected' });
    });
});

// Admin retrieves only approved service requests (Including Images)
app.get('/services', (req, res) => {
    db.query('SELECT sr.id, sr.service_type, sr.description, sr.location, sr.status, sr.service_image, u.first_name, u.last_name, u.email FROM service_requests sr JOIN users u ON sr.user_id = u.id WHERE sr.status = "approved"', 
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(200).json(results);  // The column name service_image is used here
        });
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    cart: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    rating: {
        rate: Number,
        count: Number
    }
}));

app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('User not found');
    
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header('auth-token', token).send(token);
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/cart', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.cart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/cart', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart.push(req.body.product);
        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

function authenticate(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
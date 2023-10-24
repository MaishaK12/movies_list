const express = require('express');
const app = express();

const { body, validationResult } = require('express-validator');

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/movies', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.log('MongoDB connection error:', err);
});

// Set view engine to Pug
app.set('view engine', 'pug');

// Home page route
app.get('/', (req, res) => {
    res.render('layouts', { title: 'Home Page' });
});

// Start server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

// Require Movie model
const Movie = require('./models/movie');

// Require moviesRouter
const moviesRouter = require('./routes/movies');

// Route for register page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Validate user registration input and handle user registration
app.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', { title: 'Register', errors: errors.array() });
    } else {
        // Handle user registration
    }
});

// Middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Import bcrypt for password hashing and verification
const bcrypt = require('bcrypt');

// Define a route for login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Import bcrypt for password hashing and verification
const bcrypt = require('bcrypt');

// Define a route for login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Handle login form submission
app.post('/login', [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are validation errors, render the login page with error messages
        res.render('login', { title: 'Login', errors: errors.array() });
    } else {
        try {
            // Find user by email
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                // User not found
                return res.render('login', {
                    title: 'Login',
                    errors: [{ msg: 'Invalid email or password' }]
                });
            }         // Compare password
            const match = await bcrypt.compare(req.body.password, user.password);
            if (!match) {
                // Password doesn't match
                return res.render('login', {
                    title: 'Login',
                    errors: [{ msg: 'Invalid email or password' }]
                });
            }

            // Login successful, set session and redirect to home page
            req.session.user = user;
            res.redirect('/');
        } catch (error) {
            // Catch any unexpected errors and send a 500 response with an error message
            console.error(error);
            res.status(500).send('Something went wrong!');
        }
    }
});

// Catch-all error handler middleware to handle any unexpected errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Define a route for login form submission
app.post('/login', [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Render login page with error messages
        res.render('login', { title: 'Log in', errors: errors.array() });
    } else {
        // Handle user authentication
    }
});

// Define a route for login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Log in' });
});

// Define a route for logout
app.get('/logout', (req, res) => {
    // Destroy session to log out user
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Something went wrong!');
        } else {
            res.redirect('/');
        }
    });
});

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    // Redirect to login page if user is not logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }
    // Call the next middleware function if user is logged in
    next();
};

// Route for add movie form
app.get('/movies/new', requireLogin, (req, res) => {
    res.render('add-movie', { title: 'Add Movie' });
});

// Middleware function to check if user is authorized to edit/delete movie
const isAuthorized = async (req, res, next) => {
    // Get the movie ID from the request parameters
    const movieId = req.params.id;
    // Find the movie by ID
    const movie = await Movie.findById(movieId);

    // If the movie is not found, return a 404 error
    if (!movie) {
        return res.status(404).render('error', {
            title: 'Error',
            message: 'Movie not found'
        });
    }

    // If the user is logged in and is the owner of the movie, proceed to the next middleware function
    if (req.session.user && movie.user.toString() === req.session.user._id.toString()) {
        next();
    } else {
        // Otherwise, return a 403 error
        return res.status(403).render('error', {
            title: 'Error',
            message: 'You are not authorized to perform this action'
        });
    }
};

// Route for editing a movie
app.get('/movies/edit/:id', isAuthorized, async (req, res) => {
    const movieId = req.params.id;
    const movie = await Movie.findById(movieId);
    res.render('edit', { title: 'Edit Movie', movie });
});

// Route for deleting a movie
app.post('/movies/delete/:id', isAuthorized, async (req, res) => {
    const movieId = req.params.id;
    await Movie.findByIdAndDelete(movieId);

    res.redirect('/');
});

// Mount moviesRouter middleware
app.use('/movies', moviesRouter);

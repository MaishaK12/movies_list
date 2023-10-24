const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');

// GET /movies - display a list of movies
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find({});
        res.render('movies/index', { movies });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// GET /movies/new - display form for adding a new movie
router.get('/new', (req, res) => {
    res.render('movies/new');
});

// POST /movies - add a new movie
router.post('/', async (req, res) => {
    try {
        const movie = await Movie.create(req.body.movie);
        res.redirect(`/movies/${movie.id}`);
    } catch (err) {
        console.log(err);
        res.render('movies/new', { movie: req.body.movie, error: err.errors });
    }
});

// GET /movies/:id - display movie details
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.render('movies/show', { movie });
    } catch (err) {
        res.redirect('/movies');
    }
});

// GET /movies/:id/edit - display form for editing a movie
router.get('/:id/edit', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.render('movies/edit', { movie });
    } catch (err) {
        res.redirect('/movies');
    }
});

// PUT /movies/:id - update a movie
router.put('/:id', async (req, res) => {
    try {
        await Movie.findByIdAndUpdate(req.params.id, req.body.movie);
        res.redirect(`/movies/${req.params.id}`);
    } catch (err) {
        console.log(err);
        res.render('movies/edit', { movie: req.body.movie, error: err.errors });
    }
});

// DELETE /movies/:id - delete a movie
router.delete('/:id', async (req, res) => {
    try {
        await Movie.findByIdAndRemove(req.params.id);
        res.redirect('/movies');
    } catch (err) {
        console.log(err);
        res.redirect('/movies');
    }
});

// POST /movies/search - search for movies
router.post('/search', (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.render('movies/search', { error: 'Please enter a name to search for' });
    } else {
        Movie.find({ name: { $regex: new RegExp(name, 'i') } }, (err, movies) => {
            if (err) {
                console.log(err);
                res.redirect('/movies');
            } else {
                res.render('movies/index', { movies, search: name });
            }
        });
    }
});

// GET /movies/:id/edit - show form to edit movie
router.get('/:id/edit', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        res.render('movies/edit', { movie });
    } catch (err) {
        res.redirect('/movies');
    }
});

// POST /movies/:id - update movie details
router.post('/:id', async (req, res) => {
    const { name, description, year, genres, rating } = req.body;

    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, {
            name,
            description,
            year,
            genres,
            rating
        });
        res.redirect(`/movies/${movie.id}`);
    } catch (err) {
        const movie = await Movie.findById(req.params.id);
        res.render('movies/edit', { movie, error: err.message });
    }
});

// GET /movies/:id/recipe - show movie recipe
router.get('/:id/recipe', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        const recipeUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}/watch?locale=en-US`;
        res.render('movies/recipe', { recipeUrl });
    } catch (err) {
        res.redirect('/movies');
    }
});

module.exports = router;

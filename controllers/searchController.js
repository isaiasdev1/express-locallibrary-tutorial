var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');

const { body, validationResult } = require('express-validator/check');

var async = require('async');

exports.search_result = function (req, res, next) {
    body('search', 'Pesquisa não digitada!').isLength({ min: 1 }).trim()
    var busca = req.body.search;
    // process.stdout.write(String(busca) + '\n');
    async.parallel({
        book: function (callback) {
            Book.find({
                'title': { $regex: '.*' + busca + '.*' }
            }, 'title author ')
                .populate('author').exec(callback);
        },
        author: function (callback) {
            Author.find({ 'name': { $regex: '.*' + busca + '.*' } })
                .sort([['family_name', 'ascending']])
                .exec(callback);
        },
        genre: function (callback) {
            Genre.find({ 'name': { $regex: '.*' + busca + '.*' } })
                .sort([['name', 'ascending']])
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Successful, so render.
        process.stdout.write(String(results.author) + '\n');
        res.render('result_search', { title: 'Result Search', books: results.book, authors: results.author, genres: results.genre });
    });
};
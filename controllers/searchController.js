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
                'title': { $regex: new RegExp(".*" + busca.toLowerCase() + '.*', "i") }
            }, 'title author ')
                .populate('author').exec(callback);
        },
        author: function (callback) {
            Author.find({ $or: [{ 'first_name': { $regex: new RegExp(".*" + busca.toLowerCase() + '.*', "i") } }, { 'family_name': { $regex: new RegExp(".*" + busca.toLowerCase() + '.*', "i") } }] })
                .sort([['family_name', 'ascending']])
                .exec(callback);
        },
        genre: function (callback) {
            Genre.find({ 'name': { $regex: new RegExp(".*" + busca.toLowerCase() + '.*', "i") } })
                .sort([['name', 'ascending']])
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Successful, so render.
        res.render('result_search', { title: 'Search Result', books: results.book, authors: results.author, genres: results.genre, busca: busca });
    });
};
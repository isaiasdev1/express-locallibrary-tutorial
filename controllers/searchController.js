var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');

var async = require('async');

exports.search_result = function (req, res, next) {
    var busca = req.query.search;
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
        if (results.book == null) { // No results.
            results.book = 'Nenhum livro encontrado!';
        }
        if (results.author == null) { // No results.
            results.author = 'Nenhum autor encontrado!';
        }
        if (results.genre == null) { // No results.
            results.genre = 'Nenhum gênero encontrado!';
        }
        // Successful, so render.
        res.render('result_search', { title: 'Result Search', books: results.book, authors: results.author, genres: results.genre });
    });
};
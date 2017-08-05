var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var dialog = require('dialog');

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

router.route('/')
    //GET all movies
    .get(function(req, res, next) {
        //retrieve all movies from Monogo
        mongoose.model('movie').find({}, function (err, movies) {
              if (err) {
                  return console.error(err);
              } else {
                  res.format({
                    html: function(){
                        res.render('movies/index', {
                              title: 'All my movies',
                              "movies" : movies
                          });
                    },
                    json: function(){
                        res.json(movies);
                    }
                });
              }     
        });
    })

    //Add a new movie
    .post(function(req, res) {
        var title = req.body.title;
        var rating = req.body.rating;
        var watched = req.body.watched;

        if ((!title) || (rating<1) || (rating>5)) {
            dialog.err('Input error! A title is needed and Rating is from 1 to 5', 'Error', function(exitCode) {
                if (exitCode == 0) console.log('User clicked OK');
            })
            res.redirect("/movies/new");
        } else {

            mongoose.model('movie').create({
                title: title,
                rating: rating,
                watched: watched
            }, function (err, movie) {
                if (err) {
                    res.send("Error inserting");
                } else {
                    //movie has been created
                    console.log('POST creating new movie: ' + movie);
                    res.format({

                        html: function () {

                            res.location("movies");

                            res.redirect("/movies");
                        },

                        json: function () {
                            res.json(movie);
                        }
                    });
                }
            })
        }
    });

/* GET New movie page. */
router.get('/new', function(req, res) {
    res.render('movies/new', { title: 'Add New movie' });
});

router.param('id', function(req, res, next, id) {
    mongoose.model('movie').findById(id, function (err, movie) {
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        } else {
            console.log(movie);
            req.id = id;
            next();
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('movie').findById(req.id, function (err, movie) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + movie._id);
        res.format({
          html: function(){
              res.render('movies/show', {
                "movie" : movie
              });
          },
          json: function(){
              res.json(movie);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	.get(function(req, res) {
	    mongoose.model('movie').findById(req.id, function (err, movie) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            console.log('GET Retrieving ID: ' + movie._id);
	            res.format({
	                html: function(){
	                       res.render('movies/edit', {
	                          title: 'movie' + movie._id,
	                          "movie" : movie
	                      });
	                 },
	                json: function(){
	                       res.json(movie);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a movie by ID
	.put(function(req, res) {
	    var title = req.body.title;
	    var rating = req.body.rating;
	    var watched = req.body.watched;

	    mongoose.model('movie').findById(req.id, function (err, movie) {
	        movie.update({
	            title : title,
	            rating : rating,
	            watched : watched
	        }, function (err, movieID) {
	          if (err) {
	              res.send("Error updating database: " + err);
	          } 
	          else {
	                  res.format({
	                      html: function(){
	                           res.redirect("/movies/" + movie._id);
	                     },
	                    json: function(){
	                           res.json(movie);
	                     }
	                  });
	           }
	        })
	    });
	})

	//DELETE a movie by ID
	.delete(function (req, res){
	    mongoose.model('movie').findById(req.id, function (err, movie) {
	        if (err) {
	            return console.error(err);
	        } else {
	            movie.remove(function (err, movie) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    console.log('DELETE removing ID: ' + movie._id);
	                    res.format({
	                          html: function(){
	                               res.redirect("/movies");
	                         },
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : movie
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;
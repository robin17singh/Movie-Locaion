var express = require("express");
var router = express.Router();
var Location = require("../models/location");
var newsRouter = express.Router()
var axios = require('axios')
var middleware = require("../middleware");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "robinsingh1219",
  api_key: 797668159821388,
  api_secret: "7ZFUtpYPCHP1ah0ZvWDLs_C2P1o"
});

var Fuse = require("fuse.js");

// INDEX - show all locations
router.get("/", function(req, res) {
  var noMatch = null;
  if (req.query.search) {
    Location.find({}, function(err, allLocations) {
      if (err) {
        console.log(err);
      } else {        
        var options = {
          shouldSort: true,
          threshold: 0.5,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: ["name", "location"]
        };
        var fuse = new Fuse(allLocations, options);
        var result = fuse.search(req.query.search);
        if (result.length < 1) {
          noMatch = req.query.search;
        }
        res.render("locations/index", {
          locations: result,
          noMatch: noMatch
        });
      }
    });
  } else if (req.query.sortby) {
    if (req.query.sortby === "rateAvg") {
      Location.find({})
        .sort({
          rateCount: -1,
          rateAvg: -1
        })
        .exec(function(err, allLocations) {
          if (err) {
            console.log(err);
          } else {
            res.render("locations/index", {
              locations: allLocations,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "rateCount") {
      Location.find({})
        .sort({
          rateCount: -1
        })
        .exec(function(err, allLocations) {
          if (err) {
            console.log(err);
          } else {
            res.render("locations/index", {
              locations: allLocations,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "priceLow") {
      Location.find({})
        .sort({
          price: 1,
          rateAvg: -1
        })
        .exec(function(err, allLocations) {
          if (err) {
            console.log(err);
          } else {
            res.render("locations/index", {
              locations: allLocations,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else {
      Location.find({})
        .sort({
          price: -1,
          rateAvg: -1
        })
        .exec(function(err, allLocations) {
          if (err) {
            console.log(err);
          } else {
            res.render("locations/index", {
              locations: allLocations,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    }
  } else {
    Location.find({}, function(err, allLocations) {
      if (err) {
        console.log(err);
      } else {
        res.render("locations/index", {
          locations: allLocations,
          currentUser: req.user,
          noMatch: noMatch
        });
      }
    });
  }
});

// CREATE - add new location to db
router.post("/", middleware.isLoggedIn, upload.single("image"), function(
  req,
  res
) {
  cloudinary.v2.uploader.upload(
    req.file.path,
    {
      width: 1500,
      height: 1000,
      crop: "scale"
    },
    function(err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
      req.body.location.image = result.secure_url;
      req.body.location.imageId = result.public_id;
      req.body.location.booking = {
        start: req.body.location.start,
        end: req.body.location.end
      };
      //req.body.loaction.tags = req.body.location.tags.split(",");
      req.body.location.author = {
        id: req.user._id,
        username: req.user.username
      };
 
        Location.create(req.body.location, function(err, location) {
          if (err) {
            req.flash("error", err.message);
            return res.render("error");
          }
          res.redirect("/locations");
        });

    },
    {
      moderation: "webpurify"
    }
  );
});

// NEW - show form to create new location
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("locations/new");
});

// SHOW - shows more information about one location
router.get("/:id", function(req, res) {
  Location.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundLocation) {
      if (err || !foundLocation) {
        console.log(err);
        req.flash("error", "Sorry, that location does not exist!");
        return res.render("error");
      }
      var ratingsArray = [];

      foundLocation.comments.forEach(function(rating) {
        ratingsArray.push(rating.rating);
      });
      if (ratingsArray.length === 0) {
        foundLocation.rateAvg = 0;
      } else {
        var ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating;
        });
        foundLocation.rateAvg = ratings / foundLocation.comments.length;
        foundLocation.rateCount = foundLocation.comments.length;
      }
      foundLocation.save();
      res.render("locations/show", {
        location: foundLocation
      });
    });
});

// EDIT Location ROUTE
router.get(
  "/:id/edit",
  middleware.isLoggedIn,
  middleware.checkLocationOwnership,
  function(req, res) {
    res.render("locations/edit", {
      location: req.location
    });
  }
);

//News
router.get('', async(req, res) => {
  try {
      const newsAPI = await axios.get(`https://raddy.co.uk/wp-json/wp/v2/posts/`)
      res.render('locations/show', { location : newsAPI.data })
  } catch (err) {
      if(err.response) {
          res.render('locations/show', { location : null })
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
      } else if(err.request) {
          res.render('locations/show', { location : null })
          console.log(err.request)
      } else {
          res.render('locations/show', { location : null })
          console.error('Error', err.message)
      }
  } 
})

// UPDATE LOCATION ROUTE
router.put(
  "/:id",
  upload.single("image"),
  middleware.checkLocationOwnership,
  function(req, res) {
      if (err || !data.length) {
        req.flash("error", "Invalid address");
        return res.redirect("back");
      }
      req.body.location.lat = data[0].latitude;
      req.body.location.lng = data[0].longitude;
      req.body.location.location = data[0].formattedAddress;
      req.body.location.booking = {
        start: req.body.location.start,
        end: req.body.location.end
      };
      req.body.location.tags = req.body.location.tags.split(",");
      Location.findByIdAndUpdate(
        req.params.id,
        req.body.location,
        async function(err, location) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("back");
          } else {
            if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(location.imageId);
                var result = await cloudinary.v2.uploader.upload(
                  req.file.path,
                  {
                    width: 1500,
                    height: 1000,
                    crop: "scale"
                  },
                  {
                    moderation: "webpurify"
                  }
                );
                location.imageId = result.public_id;
                location.image = result.secure_url;
              } catch (err) {
                req.flash("error", err.message);
                return res.render("error");
              }
            }
            location.save();
            req.flash("success", "Successfully updated your location!");
            res.redirect("/locations/" + req.params.id);
          }
        }
      );

  }
);

// DESTROY Location ROUTE
router.delete("/:id", middleware.checkLocationOwnership, function(req, res) {
  Location.findById(req.params.id, async function(err, location) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(location.imageId);
      location.remove();
      res.redirect("/locations");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
    }
  });
});

module.exports = router;

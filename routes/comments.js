var express = require("express");
var router = express.Router({ mergeParams: true });
var Location = require("../models/location");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
  Location.findById(req.params.id, function(err, location) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { location: location });
    }
  });
});

// Comments create
router.post("/", middleware.isLoggedIn, function(req, res) {
  Location.findById(req.params.id, function(err, found) {
    if (err) {
      console.log(err);
    }
    var ratedArray = [];
    found.hasRated.forEach(function(rated) {
      ratedArray.push(String(rated));
    });
    if (ratedArray.includes(String(req.user._id))) {
      req.flash(
        "error",
        "You've already reviewed this location, please edit your review instead."
      );
      res.redirect("/locations/" + req.params.id);
    } else {
      Location.findById(req.params.id, function(err, location) {
        if (err) {
          console.log(err);
          res.redirect("/locations");
        } else {
          var newComment = req.body.comment;
          Comment.create(newComment, function(err, comment) {
            if (err) {
              req.flash("error", "Something went wrong.");
              res.render("error");
            } else {
              // add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              location.hasRated.push(req.user._id);
              location.rateCount = location.comments.length;
              // save comment
              comment.save();
              location.comments.push(comment);
              location.save();
              req.flash("success", "Successfully added review!");
              res.redirect("/locations/" + location._id);
            }
          });
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get(
  "/:comment_id/edit",
  middleware.isLoggedIn,
  middleware.checkCommentOwnership,
  function(req, res) {
    res.render("comments/edit", {
      location_id: req.params.id,
      comment: req.comment
    });
  }
);

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Review updated!");
      res.redirect("/locations/" + req.params.id);
    }
  });
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      Location.findByIdAndUpdate(
        req.params.id,
        { $pull: { comments: { $in: [req.params.comment_id] } } },
        function(err) {
          if (err) {
            console.log(err);
          }
        }
      );
      Location.findByIdAndUpdate(
        req.params.id,
        { $pull: { hasRated: { $in: [req.user._id] } } },
        function(err) {
          if (err) {
            console.log(er);
          }
        }
      );
      req.flash("success", "Review deleted!");
      res.redirect("/locations/" + req.params.id);
    }
  });
});

module.exports = router;

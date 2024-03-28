const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { listingSchema } = require("./schema.js")
const path = require('path');
const wrapAsync = require("./utils/wrapasync.js")
const ExpressError = require("./utils/ExpressError.js")
const MONGO_URL = 'mongodb://127.0.0.1:27017/project'
app = express();

app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main()
     .then(() => {
          console.log("Connected TO DB");
     }).catch(err => {
          console.log(err);
     });
async function main() {
     await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
     res.send("working");
});

const validateListing = (req, res, next) => {
     let { error } = listingSchema.validate(req.body);
     if (error) {
          let errMsg = error.details.map((el)=>el.message).join(",");
          throw new ExpressError(400, errMsg);
     }
     else {
          next()
     }
};

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
     const allListing = await Listing.find({});
     res.render("listings/index.ejs", { allListing })
}));

//New Route
app.get("/listings/new", (req, res) => {
     res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
     let { id } = req.params;
     const listing = await Listing.findById(id);
     res.render("listings/show.ejs", { listing })
}));


//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
     const newListing = new Listing(re.body.listing);
     await newListing.save();
     res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
     let { id } = req.params;
     const listing = await Listing.findById(id);
     res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
     if (!req.body.listing) {
          throw new ExpressError(400, "Send some valid data for listing")
     }
     let { id } = req.params;
     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
     res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
     let { id } = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     res.redirect("/listings")
}));

// app.get("/test", async (req, res) => {
//      let sampleListing = new Listing({
//           title: "Ghar Ghar",
//           description: "Ghar me raho maze lo",
//           price: 7000000,
//           location: " Ghar me ",
//           country: "Uganda"
//      });
//      await sampleListing.save();
//      console.log("Sample was saved");
//      res.send("Done");
// });

app.all("*", (req, res, next) => {
     next(new ExpressError(404, "Page not found!"))
});

app.use((err, req, res, next) => {
     let { statusCode = 500, message = "Something Went Wrong" } = err;
     res.status(statusCode).render("listings/error.ejs", { err })
     // res.status(statusCode).send(message);
});

app.listen(8080, () => console.log(`App is running on port 8080`));
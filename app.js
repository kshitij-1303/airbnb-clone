require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const joi = require("joi");
const wrapAsync = require("./utils/asyncWrap");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema");

const PORT = process.env.PORT || 8080;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.get("/", (req, res) => {
  res.send(
    '<a style="text-decoration: none; font-size: 2rem" href="/listings">Go to all listings</a>'
  );
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  let errMsg = error.details.map((el) => el.message).join(",");

  if (error) {
    throw new ExpressError(400, "errMsg");
  } else {
    next();
  }
};

// Index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New route
app.get(
  "/listings/new",
  wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
  })
);

app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);

// Edit route

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// Update route

app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!req.body.listing) {
      new ExpressError(400, "Enter valid data for listing");
    }
    const newListing = req.body;
    await Listing.findByIdAndUpdate(id, newListing);
    res.redirect("/listings");
  })
);

// Destroy route

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(PORT, () => {
  console.log(`app is listening to port ${PORT}`);
});

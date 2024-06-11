require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");

const PORT = process.env.PORT || 8080;

const app = express();

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("welcome");
});

app.get("/testListing", async (req, res) => {
  let sampleListing = new Listing({
    title: "New home",
    description: "Big villa with beautiful view",
    price: 1200,
    location: "Panaji, Goa",
    country: "India",
  });

  await sampleListing.save();
  console.log(sampleListing);
  res.send("Listing saved");
});

app.listen(PORT, () => {
  console.log(`app is listening to port ${PORT}`);
});

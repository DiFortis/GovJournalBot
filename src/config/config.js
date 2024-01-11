require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URL, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  mongoose,
};

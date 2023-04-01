require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");

const app = express();
app.use(express.json());
app.use("/api", routes);


// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const database = mongoose.connection;

database.on("error", (err) => console.log(err));

database.on("connected", () => console.log("Database Connected"));

// Start server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

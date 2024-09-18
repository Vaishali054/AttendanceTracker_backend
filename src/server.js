const AuthRouter = require('./routes/auth');
const AdminRouter=require('./routes/admin')
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose=require('mongoose');
const axios = require('axios');
const dotenv= require('dotenv')
dotenv.config()

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const mongodb_url = process.env.MONGO_URL;

if (!mongodb_url) {
  console.error("MONGODB_URL environment variable is not defined.");
} else {
  mongoose.connect(mongodb_url, { dbName: "AttendanceTracker" });

  const db = mongoose.connection;

  db.once("open", () => {
    console.log("MongoDB connected");

    const PORT= parseInt(process.env.API_PORT || "8000", 10);

    app.listen(PORT, () => {
      console.log("Server listening on port:", PORT);
    });
  });

  db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
}

app.get("/", (req, res) => {
  console.log('hi')
  res.send("everything goood");
});


app.use("/auth", AuthRouter)
app.use("/admin",AdminRouter)

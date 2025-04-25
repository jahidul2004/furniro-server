const express = require("express");
require("dotenv").config();
const cors = require("cors");

//Create an express app
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/", (req, res) => {
    res.send({ welcomeMessage: "Furniro server is running" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB(){
    try{
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connected successfully");
    }catch{
        console.error("Databse connection failed:",error);
        process.exit(1);
    }
}

module.exports = connectDB;
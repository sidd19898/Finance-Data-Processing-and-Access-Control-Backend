const mongoose = require("mongoose");
const {Schema,model} = mongoose;

const recordSchema = new mongoose.Schema({
  Amount: {
    type: Number,
    required: true
  },
  Type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },
  Category: {
    type: String,
    required: true
  },
  Date: {
    type: Date,
    default: Date.now
  },
  Description: {
    type: String
  }
});

const Record = model('record', recordSchema);
module.exports = Record;
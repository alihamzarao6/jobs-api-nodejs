require("dotenv").config();
const monoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new monoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minLength: [3, "Name should be at least 3 characters"],
    maxLength: [50, "Name should be at most 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password should be at least 6 characters"],
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  //   next();                            // in mongoose 5.x we don't need next() to call
});

// mongoose middleware insatance
userSchema.methods.createJWT = function () {
  return jwt.sign({ userID: this._id, name: this.name }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

userSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = monoose.model("User", userSchema);

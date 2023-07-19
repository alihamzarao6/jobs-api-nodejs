const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  /* We can check the errors using our controllers but in this projet we will check errors from mongoose and will return 
   the response message and statusCode according to that mongoose error. Here I'm checking error from controller
  just as sample/practice purpose.
   const {name, email, password} = req.body;
   if(!name || !email || !password){
     throw new BadRequestError("Please provide name, email and password");
   }; */

  // We will get the errors from mongoose if we miss any entity which we are passing here in {...req.body}
  const user = await User.create({ ...req.body });

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // checking error in controller
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // find user in DB by his/her email
  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  // compare hashed password with password coming with request inside userSchema file
  const isPasswordCorrect = await user.comparePassword(password); // it'll return true/false

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  // generate token using mongoose instance methods in Schema file
  const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};

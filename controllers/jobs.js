const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userID }).sort("createdAt");

  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const createJob = async (req, res) => {
  /* here we are getting 'req.user' (user's data) because we use 'auth' on every route of Jobs and by using that 'auth'
   function we get token, decode it, get info and set that info in req.user object. We're passing that 'auth' function
   inside app.js where we doing app.use("/api/v1/jobs", auth, jobsRouter) */
  const { userID, name } = req.user;

  req.body.createdBy = userID; // defined in jobSchema and we are setting it manually

  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ job });
};

const getJob = async (req, res) => {
  const {
    user: { userID }, // {userID} = req.user
    params: { id: jobID }, // {id} = req.params  --> jobID = id;
  } = req;

  const job = await Job.findOne({ _id: jobID, createdBy: userID });

  if (!job) {
    throw new NotFoundError(`No Job with id ${jobID}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position }, // {company, position} = req.body
    user: { userID }, // {userID} = req.user
    params: { id: jobID }, // {id} = req.params  --> jobID = id;
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("Company or Position field cannot be empty");
  }

  const job = await Job.findOneAndUpdate(
    { _id: jobID, createdBy: userID },
    req.body,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new NotFoundError(`No Job with id ${jobID}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userID },
    params: { id: jobID },
  } = req;

  const job = await Job.findOneAndRemove({ _id: jobID, createdBy: userID });

  if (!job) {
    throw new NotFoundError(`No Job with id ${jobID}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Job successfully removed" });
};

module.exports = {
  getAllJobs,
  createJob,
  getJob,
  updateJob,
  deleteJob,
};

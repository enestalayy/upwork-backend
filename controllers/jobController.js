const Job = require("../models/jobModel");

exports.getJobsByFilter = async (req, res) => {
  const { filterId } = req.params;
  try {
    const jobs = await Job.find({ filterId }).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "İş ilanları alınırken hata oluştu",
        error: error.message,
      });
  }
};

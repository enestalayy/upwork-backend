const Job = require("../models/jobModel");

exports.getJobsByFilter = async (req, res) => {
  const { filterId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Toplam iş sayısını al
    const totalJobs = await Job.countDocuments({ filterId });

    // Sayfalanmış işleri al
    const jobs = await Job.find({ filterId })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);

    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalJobs / limit);

    // Daha fazla sayfa olup olmadığını kontrol et
    const hasMore = page < totalPages;
    console.log("jobs :>> ", {
      jobs,
      currentPage: page,
      totalPages,
      hasMore,
      totalJobs,
    });
    res.json({
      jobs,
      currentPage: page,
      totalPages,
      hasMore,
      totalJobs,
    });
  } catch (error) {
    res.status(400).json({
      message: "İş ilanları alınırken hata oluştu",
      error: error.message,
    });
  }
};
exports.getJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findById(jobId);
    job
      ? res.json(job)
      : res.status(404).json({ message: "Couldn't find the job" });
  } catch (error) {
    res.status(400).json({
      message: "İş ilanları alınırken hata oluştu",
      error: error.message,
    });
  }
};

// Router yapınızda endpoint'i şu şekilde güncelleyin:
// router.get("/jobs/:filterId", getJobsByFilter);

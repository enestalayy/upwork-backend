const { scrapeJobList, closeBrowser } = require("./scrape");
const Job = require("../models/jobModel");
const User = require("../models/userModel");
const { generateCoverLetter } = require("../utils/geminiHelper");
const { sendNewJobsEmail } = require("./emailHelper");

async function scrapeAndSaveJobs() {
  try {
    // Tüm kullanıcıları getir
    const users = await User.find();
    if (users.length === 0) {
      console.error("Hiç kullanıcı bulunamadı");
      return;
    }

    // Her kullanıcı için döngü
    for (const user of users) {
      console.log(`Processing user: ${user.email}`);
      let newJobsForUser = [];

      // Her filtre için scraping işlemini gerçekleştir
      for (const filter of user.filters) {
        console.log(`Scraping jobs for filter: ${filter.name}`);
        try {
          const jobs = await scrapeJobList(filter.url);
          console.log(`Found ${jobs.length} jobs for filter: ${filter.name}`);

          // Her iş ilanı için
          for (const jobData of jobs) {
            try {
              // Eğer aynı link'e sahip iş ilanı yoksa, yeni iş ilanı oluştur
              const existingJob = await Job.findOne({ link: jobData.link });
              if (!existingJob) {
                // Gemini AI ile cover letter oluştur
                const coverLetter = await generateCoverLetter(
                  jobData.title,
                  jobData.description
                );

                const newJob = new Job({
                  ...jobData,
                  filterId: filter._id,
                  coverLetter: coverLetter,
                });
                await newJob.save();
                console.log(`New job added with cover letter: ${newJob.title}`);
                newJobsForUser.push(newJob);
              }
            } catch (jobError) {
              console.error(`Error processing job: ${jobError.message}`);
            }
          }
        } catch (filterError) {
          console.error(
            `Error scraping filter ${filter.name}: ${filterError.message}`
          );
        }
      }

      // Her kullanıcı için yeni işleri e-posta ile gönder
      if (newJobsForUser.length > 0) {
        const emailSent = await sendNewJobsEmail(newJobsForUser);
        if (emailSent) {
          console.log(
            `${newJobsForUser.length} yeni iş ilanı ${user.email} adresine e-posta ile gönderildi.`
          );
        } else {
          console.error(`${user.email} adresine e-posta gönderilemedi.`);
        }
      } else {
        console.log(`${user.email} için yeni iş ilanı bulunamadı.`);
      }
    }

    console.log("Tüm kullanıcılar için iş ilanları başarıyla güncellendi");
    await closeBrowser();
  } catch (error) {
    console.error("Scraping ve kaydetme işlemi sırasında hata:", error);
    throw error;
  }
}

module.exports = scrapeAndSaveJobs;

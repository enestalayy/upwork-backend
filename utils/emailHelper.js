const nodemailer = require("nodemailer");

async function sendNewJobsEmail(newJobs) {
  // Zoho Mail SMTP ayarları
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 587,
    secure: false, // TLS kullanımı
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // E-posta içeriğini oluştur
  let jobListHtml = newJobs
    .map(
      (job) => `
    <li>
      <strong>${job.title}</strong><br>
      Budget: ${job.budget}<br>
      Skills: ${job.skills.join(", ")} <br/> 
      Link: <a href="${job.link}">${job.link}</a> <br/>
      Description: <p>${job.description}</p> <br/>
      Cover Letter: <p>${job.coverLetter}</p> <br/>
    </li>
  `
    )
    .join("");

  let mailOptions = {
    from: `"Job Scraper" <${process.env.EMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL, // Alıcı e-postasını .env dosyasından al
    subject: `${newJobs.length} Yeni İş İlanı Bulundu`,
    html: `
      <h1>Yeni İş İlanları</h1>
      <p>Toplam ${newJobs.length} yeni iş ilanı bulundu:</p>
      <ul>
        ${jobListHtml}
      </ul>
    `,
  };

  try {
    // E-postayı gönder
    let info = await transporter.sendMail(mailOptions);
    console.log("E-posta gönderildi: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("E-posta gönderimi sırasında hata oluştu:", error);
    return false;
  }
}

module.exports = { sendNewJobsEmail };

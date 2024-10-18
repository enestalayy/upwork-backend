const mongoose = require("mongoose");

// User Şeması
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // E-posta
  createdAt: { type: Date, default: Date.now },
  filters: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      url: { type: String, required: true }, // İş URL'si
      name: { type: String, required: true }, // Filtre adı
      description: { type: String }, // Filtre açıklaması
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

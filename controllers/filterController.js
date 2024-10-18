const User = require("../models/userModel");
const Job = require("../models/jobModel");

// Filtre Ekleme (Create)
exports.addFilter = async (req, res) => {
  const { userId } = req.params;
  try {
    const { url, name, description } = req.body;
    const user = await User.findOneAndUpdate(
      { userId },
      { $push: { filters: { url, name, description } } },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user.filters[user.filters.length - 1]);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Filtre ekleme hatası", error: error.message });
  }
};

// Filtreleri Listeleme (Read)
exports.getFilters = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user.filters);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Filtreleri getirme hatası", error: error.message });
  }
};

// Filtre Güncelleme (Update)
exports.updateFilter = async (req, res) => {
  const { userId, filterId } = req.params;
  try {
    const { url, name, description } = req.body;
    const user = await User.findOneAndUpdate(
      { userId, "filters._id": filterId },
      {
        $set: {
          "filters.$.url": url,
          "filters.$.name": name,
          "filters.$.description": description,
        },
      },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Filtre bulunamadı" });
    }
    const updatedFilter = user.filters.find(
      (filter) => filter._id.toString() === filterId
    );
    res.json(updatedFilter);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Filtre güncelleme hatası", error: error.message });
  }
};

// Filtre Silme (Delete)
exports.deleteFilter = async (req, res) => {
  const { userId, filterId } = req.params;
  try {
    // Filtreye bağlı tüm işleri sil
    await Job.deleteMany({ filterId });

    // Kullanıcıdan filtreyi kaldır
    const user = await User.findOneAndUpdate(
      { userId },
      { $pull: { filters: { _id: filterId } } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "Kullanıcı veya filtre bulunamadı" });
    }

    res.json({ message: "Filtre ve bağlı tüm işler başarıyla silindi" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Filtre silme hatası", error: error.message });
  }
};

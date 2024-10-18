const User = require("../models/userModel");
const Job = require("../models/jobModel");

exports.createUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.create({ userId, ...req.body });
    res.status(201).json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Kullanıcı oluşturma hatası", error: error.message });
  }
};

exports.getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { name, surname, email } = req.body;
    const user = await User.findOneAndUpdate(
      { userId },
      { name, surname, email },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "Güncellenecek kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Güncelleme hatası", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcıyı bul ve filtrelerini al
    const user = await User.findOne({ userId }).populate("filters");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcının filtrelerinin ID'lerini topla
    const filterIds = user.filters.map((filter) => filter._id);

    // Filtrelere ait işleri sil
    await Job.deleteMany({ filterId: { $in: filterIds } });

    // Kullanıcıyı sil
    await User.findOneAndDelete({ userId });

    res.json({ message: "Kullanıcı ve ilgili işler başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

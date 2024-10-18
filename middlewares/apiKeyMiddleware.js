const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.X_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: "Geçersiz API anahtarı" });
  }

  next();
};

module.exports = apiKeyMiddleware;

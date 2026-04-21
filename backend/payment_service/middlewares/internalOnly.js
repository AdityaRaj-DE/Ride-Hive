module.exports.internalOnly = (req, res, next) => {
    const key = req.headers["x-internal-key"];
  
    if (!process.env.INTERNAL_SERVICE_KEY) {
      console.error("❌ INTERNAL_SERVICE_KEY is missing in .env");
      return res.status(500).json({ message: "Server misconfigured: INTERNAL_SERVICE_KEY missing" });
    }

    if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
      console.warn(`⚠️ Internal access denied. Key mismatch.`);
      return res.status(403).json({ message: "Forbidden: internal access only" });
    }
  
    next();
};

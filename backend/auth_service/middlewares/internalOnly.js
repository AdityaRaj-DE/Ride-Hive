module.exports.internalOnly = (req, res, next) => {
    const key = req.headers["x-internal-key"];
  
    if (!process.env.INTERNAL_SERVICE_KEY) {
      return res.status(500).json({ message: "Server misconfigured: INTERNAL_SERVICE_KEY missing" });
    }
    console.log("Internal key:", process.env.INTERNAL_SERVICE_KEY);
    console.log("external key:", key);

    if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
      return res.status(403).json({ message: "Forbidden: internal access only" });
    }
  
    next();
  };
  
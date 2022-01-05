module.exports = serverError = (res, error) => res.status(500).json({ error });

function errorHandler(err, req, res, next) {
    if (err.status && err.message) {
        return res.status(err.status).json({
            error: err.message,
            details: err.errors || []
        });
    }
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor" });
}

module.exports = errorHandler;
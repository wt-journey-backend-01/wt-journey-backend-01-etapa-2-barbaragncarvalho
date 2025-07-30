function errorHandler(err, req, res, next) {
    if (err.status) {
        res.status(err.status).json({ message: err.message, errors: err.errors || [] });
    } else {
        res.status(500).json({ message: "Erro interno do servidor." });
    }
}

module.exports = errorHandler;
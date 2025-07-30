function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || 'Erro interno do servidor';
    const errors = err.errors || [];
    res.status(status).json({ message, errors });
}

module.exports = errorHandler;
module.exports = (err, req, res, next) => {
    if (err.status && err.errors) {
        return res.status(err.status).json({ 
            status: err.status, 
            message: err.message,
            errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ status: 500, message: 'Erro interno do servidor.' });
};
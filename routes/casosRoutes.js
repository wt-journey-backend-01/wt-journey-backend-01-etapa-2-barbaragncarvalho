const express = require('express')
const router = express.Router();
const casosController = require('../controllers/casosController');

// define a rota para /casos usando o método GET
router.get('/casos', casosController.seuMetodo)
router.get('/casos/:id', casosController.seuMetodo)
router.post('/casos', casosController.seuMetodo)
router.put('/casos/:id', casosController.seuMetodo)
router.patch('/casos/:id', casosController.seuMetodo)
router.delete('/casos/:id', casosController.seuMetodo)

module.exports = router
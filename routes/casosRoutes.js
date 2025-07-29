const express = require('express')
const router = express.Router();
const casosController = require('../controllers/casosController');

router.get('/casos', casosController.getAllCasos);
router.get('/casos/:id', casosController.getCaso);
router.post('/casos', casosController.createCaso);
router.put('/casos/:id', casosController.putCaso);
router.patch('/casos/:id', casosController.patchCaso);
router.delete('/casos/:id', casosController.removeCaso);
router.get('/casos/:id/agente', casosController.getAgenteOfCaso);

module.exports = router
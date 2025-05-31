const express = require('express');
const db = require('../db');  // Importamos la conexión a la base de datos
const router = express.Router();

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     tags:
 *       - Doctores
 *     summary: Obtiene una lista de todos los doctores
 *     responses:
 *       200:
 *         description: Lista de doctores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   doctor_id:
 *                     type: integer
 *                     example: 1
 *                   first_name:
 *                     type: string
 *                     example: "Juan"
 *                   last_name:
 *                     type: string
 *                     example: "Pérez"
 *                   phone_number:
 *                     type: string
 *                     example: "5551234567"
 *                   availability:
 *                     type: boolean
 *                     example: true
 *                   specialty_id:
 *                     type: integer
 *                     example: 2
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-29T12:00:00.000Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-05-29T12:00:00.000Z"
 *       500:
 *         description: Error al obtener los doctores
 */
router.get('/', async (req, res) => {
  try {
    const doctors = await db.any('SELECT * FROM doctors');
    res.json(doctors);
  } catch (error) {
    console.error('Error al obtener los doctores:', error);
    res.status(500).json({ mensaje: 'Error al obtener los doctores' });
  }
});

/**
* @swagger
* /api/doctors/{doctor_id}/details:
*   get:
*     tags:
*       - Doctores  
*     summary: Obtiene información detallada de un doctor
*     description: Retorna información detallada de un doctor, incluyendo especialidad, dirección, y su imagen.
*     parameters:
*       - in: path
*         name: doctor_id
*         required: true
*         description: El ID del doctor del cual obtener información detallada
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Información detallada del doctor
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 doctor_id:
*                   type: integer
*                   example: 10
*                 first_name:
*                   type: string
*                   example: "Carlos"
*                 last_name:
*                   type: string
*                   example: "Gómez"
*                 phone_number:
*                   type: string
*                   example: "5559876543"
*                 availability:
*                   type: boolean
*                   example: true
*                 specialty_name:
*                   type: string
*                   example: "Cardiología"
*                 address:
*                   type: object
*                   properties:
*                     street_address:
*                       type: string
*                       example: "123 Calle Principal"
*                     city:
*                       type: string
*                       example: "Ciudad de México"
*                     state:
*                       type: string
*                       example: "CDMX"
*                     postal_code:
*                       type: string
*                       example: "01000"
*                     country:
*                       type: string
*                       example: "México"
*                 image_url:
*                   type: string
*                   example: "http://example.com/image.jpg"
*       404:
*         description: Doctor no encontrado
*       500:
*         description: Error al obtener la información detallada
*/
router.get('/:doctor_id/details', async (req, res) => {
  const { doctor_id } = req.params;
 
  try {
    const doctorDetails = await db.oneOrNone(
      `SELECT 
        d.doctor_id,
        d.first_name,
        d.last_name,
        d.phone_number,
        d.availability,
        s.name AS specialty_name,
        a.street_address,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        di.image_url
      FROM 
        doctors d
      JOIN 
        specialties s ON d.specialty_id = s.specialty_id
      LEFT JOIN 
        addresses a ON d.doctor_id = a.doctor_id
      LEFT JOIN 
        doctor_images di ON d.doctor_id = di.doctor_id
      WHERE 
        d.doctor_id = $1`,
      [doctor_id]
    );
 
    if (!doctorDetails) {
      return res.status(404).json({ mensaje: 'Doctor no encontrado' });
    }
 
    res.json(doctorDetails);
  } catch (error) {
    console.error('Error al obtener la información detallada del doctor:', error);
    res.status(500).json({ mensaje: 'Error al obtener la información detallada del doctor' });
  }
 });

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     tags:
 *       - Doctores
 *     summary: Crea un nuevo doctor
 *     description: Crea un nuevo doctor en el sistema con los datos proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Carlos"
 *               last_name:
 *                 type: string
 *                 example: "Gómez"
 *               phone_number:
 *                 type: string
 *                 example: "5559876543"
 *               availability:
 *                 type: boolean
 *                 example: true
 *               specialty_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Doctor creado correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       500:
 *         description: Error al crear el doctor
 */
router.post('/', async (req, res) => {
    const { first_name, last_name, phone_number, availability, specialty_id } = req.body;
    const createdAt = new Date().toISOString(); // Establecemos la fecha y hora de creación
  
    // Verificar si todos los datos requeridos están presentes
    if (!first_name || !last_name || !phone_number || availability === undefined || !specialty_id) {
      return res.status(400).json({ mensaje: 'Faltan datos necesarios para crear el doctor.' });
    }
  
    try {
      const newDoctor = await db.one(
        `INSERT INTO doctors(first_name, last_name, phone_number, availability, specialty_id, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
        [first_name, last_name, phone_number, availability, specialty_id, createdAt]
      );
  
      res.status(201).json(newDoctor); // Respondemos con los datos del nuevo doctor creado
    } catch (error) {
      console.error('Error al crear el doctor:', error);
      res.status(500).json({ mensaje: 'Error al crear el doctor' });
    }
  });

  
/**
 * @swagger
 * /api/doctors/{doctor_id}:
 *   put:
 *     tags:
 *       - Doctores  # Aquí asignamos el tag para agrupar esta ruta en la sección "Doctores"
 *     summary: Actualiza la información de un doctor
 *     description: Actualiza los detalles de un doctor específico basado en su `doctor_id`.
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: El ID del doctor a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               availability:
 *                 type: boolean
 *               specialty_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Doctor actualizado correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error al actualizar el doctor
 */
router.put('/:doctor_id', async (req, res) => {
    const { doctor_id } = req.params;
    const { first_name, last_name, phone_number, availability, specialty_id } = req.body;
  
    if (!first_name || !last_name || !phone_number || availability === undefined || !specialty_id) {
      return res.status(400).json({ mensaje: 'Faltan datos necesarios para actualizar el doctor.' });
    }
  
    const updatedAt = new Date().toISOString();  // Establecemos la fecha y hora actuales para `updated_at`
  
    try {
      const updatedDoctor = await db.one(
        `UPDATE doctors SET first_name = $1, last_name = $2, phone_number = $3, availability = $4, specialty_id = $5, updated_at = $6 
         WHERE doctor_id = $7 RETURNING *`,
        [first_name, last_name, phone_number, availability, specialty_id, updatedAt, doctor_id]
      );
  
      if (!updatedDoctor) {
        return res.status(404).json({ mensaje: 'Doctor no encontrado' });
      }
  
      res.json(updatedDoctor); // Respondemos con los datos actualizados del doctor
    } catch (error) {
      console.error('Error al actualizar el doctor:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el doctor' });
    }
  });

 /**
 * @swagger
 * /api/doctors/{doctor_id}:
 *   delete:
 *     tags:
 *       - Doctores  # Aquí asignamos el tag para agrupar esta ruta en la sección "Doctores"
 *     summary: Elimina un doctor
 *     description: Elimina un doctor específico del sistema basado en su `doctor_id`.
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: El ID del doctor a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor eliminado correctamente
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error al eliminar el doctor
 */
router.delete('/:doctor_id', async (req, res) => {
    const { doctor_id } = req.params;
  
    try {
      // Intentamos eliminar el doctor con el doctor_id proporcionado
      const deletedDoctor = await db.result(
        'DELETE FROM doctors WHERE doctor_id = $1 RETURNING *',
        [doctor_id]
      );
  
      // Si no se encontró el doctor, respondemos con un error 404
      if (deletedDoctor.rowCount === 0) {
        return res.status(404).json({ mensaje: 'Doctor no encontrado' });
      }
  
      // Respondemos con un mensaje de éxito
      res.status(200).json({ mensaje: `Doctor con ID ${doctor_id} eliminado correctamente.` });
    } catch (error) {
      console.error('Error al eliminar el doctor:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el doctor' });
    }
  });
  
  
  module.exports = router;

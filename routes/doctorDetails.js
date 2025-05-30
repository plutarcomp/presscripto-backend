const express = require('express');
const db = require('../db');  // Importamos la conexión a la base de datos
const router = express.Router();

/**
* @swagger
* /api/doctors/{doctor_id}/details:
*   get:
*     tags:
*       - Detalles de los Doctores  # Aquí asignamos el tag para agrupar esta ruta en su propia sección
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
module.exports = router;

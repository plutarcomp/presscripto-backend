const express = require('express');
const db = require('../db');  // Importamos la conexión a la base de datos
const router = express.Router();

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     tags:
 *       - Especialidades  # Usamos un tag para agrupar esta ruta
 *     summary: Obtiene todas las especialidades
 *     description: Retorna todas las especialidades con su imagen asociada.
 *     responses:
 *       200:
 *         description: Lista de especialidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   specialty_id:
 *                     type: integer
 *                     example: 1
 *                   specialty_name:
 *                     type: string
 *                     example: "Cardiología"
 *                   specialty_description:
 *                     type: string
 *                     example: "Especialidad médica que se ocupa del estudio y tratamiento de enfermedades del corazón."
 *                   image_url:
 *                     type: string
 *                     example: "http://example.com/specialty-image.jpg"
 *       500:
 *         description: Error al obtener las especialidades
 */
router.get('/', async (req, res) => {
  try {
    const specialties = await db.any(
      `SELECT 
        s.specialty_id,
        s.name AS specialty_name,
        s.description AS specialty_description,
        si.image_url
      FROM 
        specialties s
      JOIN 
        specialty_images si ON s.specialty_id = si.specialty_id`
    );

    res.json(specialties);
  } catch (error) {
    console.error('Error al obtener las especialidades:', error);
    res.status(500).json({ mensaje: 'Error al obtener las especialidades' });
  }
});

/**
 * @swagger
 * /api/specialties/{specialty_id}:
 *   get:
 *     tags:
 *       - Especialidades  # Agrupamos esta ruta en la sección "Especialidades"
 *     summary: Obtiene una especialidad por su ID
 *     description: Retorna la especialidad con el ID especificado junto con su imagen asociada.
 *     parameters:
 *       - in: path
 *         name: specialty_id
 *         required: true
 *         description: El ID de la especialidad que deseas consultar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información de la especialidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 specialty_id:
 *                   type: integer
 *                   example: 1
 *                 specialty_name:
 *                   type: string
 *                   example: "Cardiología"
 *                 specialty_description:
 *                   type: string
 *                   example: "Especialidad médica que se ocupa del estudio y tratamiento de enfermedades del corazón."
 *                 image_url:
 *                   type: string
 *                   example: "http://example.com/specialty-image.jpg"
 *       404:
 *         description: Especialidad no encontrada
 *       500:
 *         description: Error al obtener la especialidad
 */
router.get('/:specialty_id', async (req, res) => {
    const { specialty_id } = req.params;
  
    try {
      const specialty = await db.oneOrNone(
        `SELECT 
          s.specialty_id,
          s.name AS specialty_name,
          s.description AS specialty_description,
          si.image_url
        FROM 
          specialties s
        JOIN 
          specialty_images si ON s.specialty_id = si.specialty_id
        WHERE 
          s.specialty_id = $1`,
        [specialty_id]
      );
  
      if (!specialty) {
        return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
      }
  
      res.json(specialty);
    } catch (error) {
      console.error('Error al obtener la especialidad:', error);
      res.status(500).json({ mensaje: 'Error al obtener la especialidad' });
    }
  });

  /**
 * @swagger
 * /api/specialties:
 *   post:
 *     tags:
 *       - Especialidades  # Agrupamos esta ruta en la sección "Especialidades"
 *     summary: Crea una nueva especialidad
 *     description: Crea una nueva especialidad en el sistema junto con su imagen asociada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty_name:
 *                 type: string
 *                 example: "Neurología"
 *               specialty_description:
 *                 type: string
 *                 example: "Especialidad médica que se ocupa del diagnóstico y tratamiento de trastornos del sistema nervioso."
 *               image_url:
 *                 type: string
 *                 example: "http://example.com/specialty-image.jpg"
 *     responses:
 *       201:
 *         description: Especialidad creada correctamente
 *       400:
 *         description: Datos incorrectos
 *       500:
 *         description: Error al crear la especialidad
 */
router.post('/', async (req, res) => {
    const { specialty_name, specialty_description, image_url } = req.body;
  
    // Verificación básica de que los datos requeridos están presentes
    if (!specialty_name || !specialty_description || !image_url) {
      return res.status(400).json({ mensaje: 'Faltan datos necesarios para crear la especialidad.' });
    }
  
    try {
      // Insertamos la especialidad en la tabla specialties
      const newSpecialty = await db.one(
        `INSERT INTO specialties(name, description)
         VALUES($1, $2) RETURNING specialty_id`,
        [specialty_name, specialty_description]
      );
  
      // Ahora insertamos la imagen de la especialidad en specialty_images
      await db.none(
        `INSERT INTO specialty_images(specialty_id, image_url)
         VALUES($1, $2)`,
        [newSpecialty.specialty_id, image_url]
      );
  
      // Respondemos con la nueva especialidad creada
      res.status(201).json({
        specialty_id: newSpecialty.specialty_id,
        specialty_name,
        specialty_description,
        image_url,
      });
    } catch (error) {
      console.error('Error al crear la especialidad:', error);
      res.status(500).json({ mensaje: 'Error al crear la especialidad' });
    }
  });

  /**
 * @swagger
 * /api/specialties/{specialty_id}:
 *   put:
 *     tags:
 *       - Especialidades  # Agrupamos esta ruta en la sección "Especialidades"
 *     summary: Actualiza una especialidad por su ID
 *     description: Actualiza completamente los detalles de una especialidad por su ID.
 *     parameters:
 *       - in: path
 *         name: specialty_id
 *         required: true
 *         description: El ID de la especialidad que deseas actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty_name:
 *                 type: string
 *                 example: "Neurología"
 *               specialty_description:
 *                 type: string
 *                 example: "Especialidad médica que se ocupa del diagnóstico y tratamiento de trastornos del sistema nervioso."
 *               image_url:
 *                 type: string
 *                 example: "http://example.com/specialty-image.jpg"
 *     responses:
 *       200:
 *         description: Especialidad actualizada correctamente
 *       400:
 *         description: Datos incorrectos
 *       404:
 *         description: Especialidad no encontrada
 *       500:
 *         description: Error al actualizar la especialidad
 */
router.put('/:specialty_id', async (req, res) => {
    const { specialty_id } = req.params;
    const { specialty_name, specialty_description, image_url } = req.body;
  
    // Verificación de que los datos estén completos
    if (!specialty_name || !specialty_description || !image_url) {
      return res.status(400).json({ mensaje: 'Faltan datos para actualizar la especialidad.' });
    }
  
    try {
      // Verificamos si la especialidad existe
      const specialty = await db.oneOrNone('SELECT * FROM specialties WHERE specialty_id = $1', [specialty_id]);
  
      if (!specialty) {
        return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
      }
  
      // Actualizamos la especialidad en la tabla specialties
      await db.none(
        `UPDATE specialties SET name = $1, description = $2 WHERE specialty_id = $3`,
        [specialty_name, specialty_description, specialty_id]
      );
  
      // Actualizamos la imagen en specialty_images
      await db.none(
        `UPDATE specialty_images SET image_url = $1 WHERE specialty_id = $2`,
        [image_url, specialty_id]
      );
  
      // Respondemos con la especialidad actualizada
      res.status(200).json({
        specialty_id,
        specialty_name,
        specialty_description,
        image_url,
      });
    } catch (error) {
      console.error('Error al actualizar la especialidad:', error);
      res.status(500).json({ mensaje: 'Error al actualizar la especialidad' });
    }
  });

  /**
 * @swagger
 * /api/specialties/{specialty_id}:
 *   delete:
 *     tags:
 *       - Especialidades  # Agrupamos esta ruta en la sección "Especialidades"
 *     summary: Elimina una especialidad por su ID
 *     description: Elimina la especialidad con el ID especificado junto con su imagen asociada.
 *     parameters:
 *       - in: path
 *         name: specialty_id
 *         required: true
 *         description: El ID de la especialidad que deseas eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Especialidad eliminada correctamente
 *       404:
 *         description: Especialidad no encontrada
 *       500:
 *         description: Error al eliminar la especialidad
 */
router.delete('/:specialty_id', async (req, res) => {
    const { specialty_id } = req.params;
  
    try {
      // Primero, eliminamos la imagen asociada a la especialidad
      await db.none('DELETE FROM specialty_images WHERE specialty_id = $1', [specialty_id]);
  
      // Luego, eliminamos la especialidad de la tabla specialties
      const result = await db.result('DELETE FROM specialties WHERE specialty_id = $1 RETURNING specialty_id', [specialty_id]);
  
      if (result.rowCount === 0) {
        // Si no encontramos ninguna especialidad con ese ID
        return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
      }
  
      // Respondemos con el mensaje de éxito
      res.status(200).json({ mensaje: `Especialidad con ID ${specialty_id} eliminada correctamente.` });
    } catch (error) {
      console.error('Error al eliminar la especialidad:', error);
      res.status(500).json({ mensaje: 'Error al eliminar la especialidad' });
    }
  });
module.exports = router;

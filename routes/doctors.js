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
 * /api/doctors/{doctor_id}:
 *   get:
 *     tags:
 *       - Doctores  # Agrupamos esta ruta bajo "Doctores"
 *     summary: Obtiene un doctor por su ID
 *     description: Retorna los detalles de un doctor específico, incluyendo sus especialidades, direcciones e imagen.
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: El ID del doctor que deseas consultar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información del doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctor_id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: "Juan"
 *                 last_name:
 *                   type: string
 *                   example: "Pérez"
 *                 phone_number:
 *                   type: string
 *                   example: "5551234567"
 *                 availability:
 *                   type: boolean
 *                   example: true
 *                 specialties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       specialty_id:
 *                         type: integer
 *                         example: 1
 *                       specialty_name:
 *                         type: string
 *                         example: "Cardiología"
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       address_id:
 *                         type: integer
 *                         example: 101
 *                       street_address:
 *                         type: string
 *                         example: "Av. Siempre Viva 123"
 *                       city:
 *                         type: string
 *                         example: "Springfield"
 *                       state:
 *                         type: string
 *                         example: "Illinois"
 *                       postal_code:
 *                         type: string
 *                         example: "62701"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                 image_url:
 *                   type: string
 *                   example: "http://example.com/doctor-image.jpg"
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error al obtener el doctor
 */
router.get('/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    // Obtener los datos del doctor
    const doctor = await db.oneOrNone(
      `SELECT * FROM doctors WHERE doctor_id = $1`,
      [doctor_id]
    );

    if (!doctor) {
      return res.status(404).json({ mensaje: 'Doctor no encontrado' });
    }

    // Obtener las especialidades asociadas al doctor
    const specialties = await db.any(
      `SELECT s.specialty_id, s.name AS specialty_name
       FROM doctors_specialties ds
       JOIN specialties s ON ds.specialty_id = s.specialty_id
       WHERE ds.doctor_id = $1`,
      [doctor_id]
    );

    // Obtener las direcciones asociadas al doctor
    const addresses = await db.any(
      `SELECT a.address_id, a.street_address, a.city, a.state, a.postal_code, a.country
       FROM doctor_addresses da
       JOIN addresses a ON da.address_id = a.address_id
       WHERE da.doctor_id = $1`,
      [doctor_id]
    );

    // Obtener la imagen asociada al doctor
    const image = await db.oneOrNone(
      `SELECT image_url FROM doctor_images WHERE doctor_id = $1`,
      [doctor_id]
    );

    // Responder con toda la información del doctor
    res.status(200).json({
      doctor_id: doctor.doctor_id,
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      phone_number: doctor.phone_number,
      availability: doctor.availability,
      specialties,
      addresses,
      image_url: image ? image.image_url : null
    });

  } catch (error) {
    console.error('Error al obtener los detalles del doctor:', error);
    res.status(500).json({ mensaje: 'Error al obtener los detalles del doctor' });
  }
});


/**
 * @swagger
 * /api/doctors:
 *   post:
 *     tags:
 *       - Doctores  # Agrupamos esta ruta bajo "Doctores"
 *     summary: Crea un nuevo doctor con varias direcciones
 *     description: Crea un nuevo doctor en la base de datos junto con sus especialidades, varias direcciones e imagen.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Juan"
 *               last_name:
 *                 type: string
 *                 example: "Pérez"
 *               phone_number:
 *                 type: string
 *                 example: "5551234567"
 *               availability:
 *                 type: boolean
 *                 example: true
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1  # El ID de la especialidad
 *               address:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     street_address:
 *                       type: string
 *                       example: "Av. Siempre Viva 123"
 *                     city:
 *                       type: string
 *                       example: "Springfield"
 *                     state:
 *                       type: string
 *                       example: "Illinois"
 *                     postal_code:
 *                       type: string
 *                       example: "62701"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *               image_url:
 *                 type: string
 *                 example: "http://example.com/doctor-image.jpg"
 *     responses:
 *       201:
 *         description: Doctor creado correctamente
 *       400:
 *         description: Datos incorrectos o incompletos
 *       500:
 *         description: Error al crear el doctor
 */
router.post('/', async (req, res) => {
  const { first_name, last_name, phone_number, availability, specialties, address, image_url } = req.body;

  // Verificación básica de los datos
  if (!first_name || !last_name || !phone_number || !availability || !specialties || !address || address.length === 0) {
    return res.status(400).json({ mensaje: 'Faltan datos necesarios para crear el doctor o las direcciones.' });
  }

  try {
    // Insertamos el doctor en la tabla doctors
    const result = await db.one(
      `INSERT INTO doctors(first_name, last_name, phone_number, availability)
       VALUES($1, $2, $3, $4) RETURNING doctor_id`,
      [first_name, last_name, phone_number, availability]
    );

    const doctor_id = result.doctor_id;

    // Insertamos las especialidades en la tabla doctors_specialties
    for (let specialty_id of specialties) {
      await db.none(
        `INSERT INTO doctors_specialties(doctor_id, specialty_id)
         VALUES($1, $2)`,
        [doctor_id, specialty_id]
      );
    }

    // Insertamos las direcciones en la tabla addresses y asociamos al doctor
    for (let addr of address) {
      // Insertamos la dirección en la tabla addresses
      const addressResult = await db.one(
        `INSERT INTO addresses(street_address, city, state, postal_code, country)
         VALUES($1, $2, $3, $4, $5) RETURNING address_id`,
        [addr.street_address, addr.city, addr.state, addr.postal_code, addr.country]
      );

      const address_id = addressResult.address_id;

      // Vinculamos la dirección con el doctor en la tabla doctor_addresses
      await db.none(
        `INSERT INTO doctor_addresses(doctor_id, address_id)
         VALUES($1, $2)`,
        [doctor_id, address_id]
      );
    }

    // Insertamos la imagen del doctor si existe
    if (image_url) {
      await db.none(
        `INSERT INTO doctor_images(doctor_id, image_url)
         VALUES($1, $2)`,
        [doctor_id, image_url]
      );
    }

    // Respondemos con la información del doctor creado
    res.status(201).json({
      doctor_id,
      first_name,
      last_name,
      phone_number,
      availability,
      specialties,
      address,
      image_url
    });

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
 *       - Doctores  # Agrupamos esta ruta bajo "Doctores"
 *     summary: Actualiza un doctor por su ID
 *     description: Actualiza los detalles de un doctor, sus especialidades, direcciones e imagen.
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: El ID del doctor que deseas actualizar
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
 *                 example: "Juan"
 *               last_name:
 *                 type: string
 *                 example: "Pérez"
 *               phone_number:
 *                 type: string
 *                 example: "5551234567"
 *               availability:
 *                 type: boolean
 *                 example: true
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1  # El ID de la especialidad
 *               address:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     street_address:
 *                       type: string
 *                       example: "Av. Siempre Viva 123"
 *                     city:
 *                       type: string
 *                       example: "Springfield"
 *                     state:
 *                       type: string
 *                       example: "Illinois"
 *                     postal_code:
 *                       type: string
 *                       example: "62701"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *               image_url:
 *                 type: string
 *                 example: "http://example.com/doctor-image.jpg"
 *     responses:
 *       200:
 *         description: Doctor actualizado correctamente
 *       400:
 *         description: Datos incorrectos o incompletos
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error al actualizar el doctor
 */
router.put('/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;
  const { first_name, last_name, phone_number, availability, specialties, address, image_url } = req.body;

  // Verificación básica de los datos
  if (!first_name || !last_name || !phone_number || !availability || !specialties || !address || address.length === 0) {
    return res.status(400).json({ mensaje: 'Faltan datos para actualizar el doctor o las direcciones.' });
  }

  try {
    // Verificamos si el doctor existe
    const doctor = await db.oneOrNone('SELECT * FROM doctors WHERE doctor_id = $1', [doctor_id]);

    if (!doctor) {
      return res.status(404).json({ mensaje: 'Doctor no encontrado' });
    }

    // Actualizamos los datos del doctor en la tabla doctors
    await db.none(
      `UPDATE doctors SET first_name = $1, last_name = $2, phone_number = $3, availability = $4
       WHERE doctor_id = $5`,
      [first_name, last_name, phone_number, availability, doctor_id]
    );

    // Eliminar las especialidades existentes y luego agregar las nuevas en la tabla doctors_specialties
    await db.none('DELETE FROM doctors_specialties WHERE doctor_id = $1', [doctor_id]);

    for (let specialty_id of specialties) {
      await db.none(
        `INSERT INTO doctors_specialties(doctor_id, specialty_id)
         VALUES($1, $2)`,
        [doctor_id, specialty_id]
      );
    }

    // Eliminar las direcciones existentes y luego agregar las nuevas en la tabla doctor_addresses
    await db.none('DELETE FROM doctor_addresses WHERE doctor_id = $1', [doctor_id]);

    for (let addr of address) {
      // Insertamos la nueva dirección en la tabla addresses
      const addressResult = await db.one(
        `INSERT INTO addresses(street_address, city, state, postal_code, country)
         VALUES($1, $2, $3, $4, $5) RETURNING address_id`,
        [addr.street_address, addr.city, addr.state, addr.postal_code, addr.country]
      );

      const address_id = addressResult.address_id;

      // Asociamos la dirección al doctor en la tabla doctor_addresses
      await db.none(
        `INSERT INTO doctor_addresses(doctor_id, address_id)
         VALUES($1, $2)`,
        [doctor_id, address_id]
      );
    }

    // Si se proporciona una nueva URL de imagen, actualizamos la tabla doctor_images
    if (image_url) {
      await db.none(
        `UPDATE doctor_images SET image_url = $1 WHERE doctor_id = $2`,
        [image_url, doctor_id]
      );
    }

    // Respondemos con la información del doctor actualizado
    res.status(200).json({
      doctor_id,
      first_name,
      last_name,
      phone_number,
      availability,
      specialties,
      address,
      image_url
    });

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
 *       - Doctores
 *     summary: Elimina un doctor y todos los registros relacionados por su ID
 *     description: Elimina un doctor de la base de datos y borra todas las relaciones en las tablas asociadas como especialidades, direcciones e imágenes.
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         description: El ID del doctor que deseas eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor eliminado correctamente junto con todos los registros asociados
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error al eliminar el doctor y sus registros relacionados
 */
router.delete('/:doctor_id', async (req, res) => {
  const { doctor_id } = req.params;

  try {
    // Verificamos si el doctor existe
    const doctor = await db.oneOrNone('SELECT * FROM doctors WHERE doctor_id = $1', [doctor_id]);

    if (!doctor) {
      return res.status(404).json({ mensaje: 'Doctor no encontrado' });
    }

    // Eliminar especialidades del doctor en la tabla doctors_specialties
    await db.none('DELETE FROM doctors_specialties WHERE doctor_id = $1', [doctor_id]);

    // Eliminar direcciones del doctor en la tabla doctor_addresses
    await db.none('DELETE FROM doctor_addresses WHERE doctor_id = $1', [doctor_id]);

    // Eliminar direcciones asociadas del doctor en la tabla addresses si no son usadas por otro doctor
    await db.none(`
      DELETE FROM addresses 
      WHERE address_id IN (
        SELECT address_id FROM doctor_addresses WHERE doctor_id = $1
      ) AND address_id NOT IN (
        SELECT address_id FROM doctor_addresses WHERE address_id = addresses.address_id
      )`, [doctor_id]);

    // Eliminar imágenes asociadas al doctor en la tabla doctor_images
    await db.none('DELETE FROM doctor_images WHERE doctor_id = $1', [doctor_id]);

    // Finalmente, eliminar el doctor de la tabla doctors
    await db.none('DELETE FROM doctors WHERE doctor_id = $1', [doctor_id]);

    // Responder con mensaje de éxito
    res.status(200).json({ mensaje: `Doctor con ID ${doctor_id} y sus registros relacionados han sido eliminados correctamente.` });

  } catch (error) {
    console.error('Error al eliminar el doctor:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el doctor y sus registros relacionados' });
  }
});

 /**
 * @swagger
 * /api/doctors/filter:
 *   post:
 *     tags:
 *       - Doctores
 *     summary: Filtra doctores por especialidad
 *     description: Retorna una lista de doctores que están asociados con una especialidad específica.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialty_id:
 *                 type: integer
 *                 description: El ID de la especialidad para filtrar los doctores.
 *                 example: 2  # Aquí puedes poner un ejemplo del specialty_id
 *     responses:
 *       200:
 *         description: Lista de doctores que tienen asignada la especialidad
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
 *       400:
 *         description: El parámetro `specialty_id` es requerido y debe ser un número válido.
 *       404:
 *         description: No se encontraron doctores para esta especialidad.
 *       500:
 *         description: Error al realizar el filtro de doctores.
 */

  
  router.post('/filter', async (req, res) => {
    const { specialty_id } = req.body;
    
    if (!specialty_id || isNaN(specialty_id)) {
      return res.status(400).json({ mensaje: 'El parámetro specialty_id es requerido y debe ser un número válido.' });
    }
  
    try {
      // Consultar los doctores que están asociados con la especialidad
      const doctors = await db.any(
        `SELECT d.doctor_id, d.first_name, d.last_name, d.phone_number, d.availability
         FROM doctors d
         JOIN doctors_specialties ds ON d.doctor_id = ds.doctor_id
         WHERE ds.specialty_id = $1`,
        [specialty_id]
      );
  
      if (doctors.length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron doctores para esta especialidad.' });
      }
  
      res.status(200).json(doctors);
  
    } catch (error) {
      console.error('Error al filtrar los doctores:', error);
      res.status(500).json({ mensaje: 'Error al realizar el filtro de doctores' });
    }
  });
  
  
  
  
  module.exports = router;

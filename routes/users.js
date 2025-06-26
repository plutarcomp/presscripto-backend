const express = require("express");
const db = require("../db"); // Importamos la conexión a la base de datos
const router = express.Router();

// Get all users
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Usuarios  # Agrupamos esta ruta bajo "Usuarios"
 *     summary: Obtiene todos los usuarios con su rol
 *     description: Retorna una lista de todos los usuarios.
 *     responses:
 *       200:
 *         description: Lista de usuarios con su rol
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   first_name:
 *                     type: string
 *                     example: "Juan"
 *                   last_name:
 *                     type: string
 *                     example: "Pérez"
 *                   email:
 *                     type: string
 *                     example: "juan.perez@example.com"
 *                   phone_number:
 *                     type: string
 *                     example: "5551234567"
 *                   role_name:
 *                     type: string
 *                     example: "Usuario"
 *       500:
 *         description: Error al obtener los usuarios
 */
router.get("/", async (req, res) => {
    try {
      // Consulta para obtener todos los usuarios con su rol
      const users = await db.any(`
        SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number, r.role_id, r.name AS role_name
        FROM users u
        
        LEFT JOIN roles r ON u.role_id = r.role_id
        
        WHERE r.role_id = 2
      `);
  
      // Responder con la lista de usuarios
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      res.status(500).json({ mensaje: "Error al obtener los usuarios" });
    }
  });

// Get user by ID
/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtiene los detalles de un usuario por su ID
 *     description: Retorna los detalles de un usuario específico, incluyendo su rol, perfil, dirección y programación.
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: El ID del usuario que deseas consultar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: "Juan"
 *                 last_name:
 *                   type: string
 *                   example: "Pérez"
 *                 email:
 *                   type: string
 *                   example: "juan.perez@example.com"
 *                 phone_number:
 *                   type: string
 *                   example: "5551234567"
 *                 role_id:
 *                   type: integer
 *                   example: 1
 *                 role_name:
 *                   type: string
 *                   example: "Admin"
 *                 birthdate:
 *                   type: string
 *                   format: date
 *                   example: "1980-12-25"
 *                 gender:
 *                   type: string
 *                   example: "Masculino"
 *                 blood_type:
 *                   type: string
 *                   example: "O+"
 *                 profile_names:
 *                   type: string
 *                   example: "Juan Carlos"
 *                 profile_last_name:
 *                   type: string
 *                   example: "Pérez"
 *                 profile_last_name_2:
 *                   type: string
 *                   example: "González"
 *                 user_address:
 *                   type: string
 *                   example: "Av. Siempre Viva 123"
 *                 user_address_ext:
 *                   type: string
 *                   example: "456"
 *                 user_address_int:
 *                   type: string
 *                   example: "789"
 *                 schedule_day_of_week:
 *                   type: string
 *                   example: "Lunes"
 *                 schedule_start_time:
 *                   type: string
 *                   format: time
 *                   example: "09:00"
 *                 schedule_end_time:
 *                   type: string
 *                   format: time
 *                   example: "17:00"
 *                 schedule_is_available:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el usuario
 */

router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
  
    try {
      // Ejecutar la consulta para obtener los detalles del usuario
      const user = await db.oneOrNone(`
        SELECT 
          u.user_id, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.phone_number, 
          r.role_id,
          r.name AS role_name,
          up.birthdate,
          up.gender,
          up.blood_type,
          up.names AS profile_names,
          up.last_name AS profile_last_name,
          up.last_name_2 AS profile_last_name_2,
          a.address AS user_address,
          a.number_ext AS user_address_ext,
          a.number_int AS user_address_int,
          s.day_of_week AS schedule_day_of_week,
          s.start_time AS schedule_start_time,
          s.end_time AS schedule_end_time,
          s.is_available AS schedule_is_available
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN addresses a ON up.address_id = a.address_id
        LEFT JOIN schedule s ON u.user_id = s.userid
        WHERE u.user_id = $1
      `, [user_id]);
  
      if (!user) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
  
      // Responder con la información del usuario
      res.status(200).json(user);
    } catch (error) {
      console.error("Error al obtener los detalles del usuario:", error);
      res.status(500).json({ mensaje: "Error al obtener los detalles del usuario" });
    }
  });

// Update user by ID
  /**
   * @swagger
   * /api/users/{user_id}:
   *   put:
   *     tags:
   *       - Usuarios
   *     summary: Actualiza los detalles de un usuario por su ID
   *     description: Actualiza los detalles de un usuario específico, incluyendo su rol, perfil, dirección y programación.
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         description: El ID del usuario que deseas actualizar
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
   *               email:
   *                 type: string
   *                 example: "juan.perez@example.com"
   *               phone_number:
   *                 type: string
   *                 example: "5551234567"
   *               role_id:
   *                 type: integer
   *                 example: 1  # El ID del rol
   *               birthdate:
   *                 type: string
   *                 format: date
   *                 example: "1980-12-25"
   *               gender:
   *                 type: string
   *                 example: "Masculino"
   *               blood_type:
   *                 type: string
   *                 example: "O+"
   *               address:
   *                 type: object
   *                 properties:
   *                   address:
   *                     type: string
   *                     example: "Av. Siempre Viva 123"
   *                   number_ext:
   *                     type: string
   *                     example: "456"
   *                   number_int:
   *                     type: string
   *                     example: "789"
   *               schedule:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     day_of_week:
   *                       type: string
   *                       example: "Lunes"
   *                     start_time:
   *                       type: string
   *                       format: time
   *                       example: "09:00"
   *                     end_time:
   *                       type: string
   *                       format: time
   *                       example: "17:00"
   *                     is_available:
   *                       type: boolean
   *                       example: true
   *     responses:
   *       200:
   *         description: Usuario actualizado correctamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user_id:
   *                   type: integer
   *                   example: 1
   *                 first_name:
   *                   type: string
   *                   example: "Juan"
   *                 last_name:
   *                   type: string
   *                   example: "Pérez"
   *                 email:
   *                   type: string
   *                   example: "juan.perez@example.com"
   *                 phone_number:
   *                   type: string
   *                   example: "5551234567"
   *                 role_id:
   *                   type: integer
   *                   example: 1
   *                 role_name:
   *                   type: string
   *                   example: "Admin"
   *                 birthdate:
   *                   type: string
   *                   format: date
   *                   example: "1980-12-25"
   *                 gender:
   *                   type: string
   *                   example: "Masculino"
   *                 blood_type:
   *                   type: string
   *                   example: "O+"
   *                 profile_names:
   *                   type: string
   *                   example: "Juan Carlos"
   *                 profile_last_name:
   *                   type: string
   *                   example: "Pérez"
   *                 profile_last_name_2:
   *                   type: string
   *                   example: "González"
   *                 user_address:
   *                   type: string
   *                   example: "Av. Siempre Viva 123"
   *                 user_address_ext:
   *                   type: string
   *                   example: "456"
   *                 user_address_int:
   *                   type: string
   *                   example: "789"
   *                 schedule_day_of_week:
   *                   type: string
   *                   example: "Lunes"
   *                 schedule_start_time:
   *                   type: string
   *                   format: time
   *                   example: "09:00"
   *                 schedule_end_time:
   *                   type: string
   *                   format: time
   *                   example: "17:00"
   *                 schedule_is_available:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Datos incorrectos o incompletos
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error al actualizar el usuario
   */
  
 
  router.put("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone_number,
      role_id,
      birthdate,
      gender,
      blood_type,
      address,
      schedule,
    } = req.body;
  
    // Verificación básica de los datos
    if (!first_name || !last_name || !email || !phone_number || !role_id) {
      return res.status(400).json({
        mensaje: "Faltan datos para actualizar el usuario.",
      });
    }
  
    try {
      // Verificamos si el usuario existe
      const user = await db.oneOrNone("SELECT * FROM users WHERE user_id = $1", [
        user_id,
      ]);
      if (!user) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
  
      // Verificar si el correo electrónico ha cambiado
      if (email !== user.email) {
        const existingEmail = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (existingEmail) {
          return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
        }
      }
  
      // Actualizar solo los campos que han sido enviados
      const updates = [];
      const values = [];
  
      if (first_name) {
        updates.push('first_name = $' + (updates.length + 1));
        values.push(first_name);
      }
      if (last_name) {
        updates.push('last_name = $' + (updates.length + 1));
        values.push(last_name);
      }
      if (email) {
        updates.push('email = $' + (updates.length + 1));
        values.push(email);
      }
      if (phone_number) {
        updates.push('phone_number = $' + (updates.length + 1));
        values.push(phone_number);
      }
      if (role_id) {
        updates.push('role_id = $' + (updates.length + 1));
        values.push(role_id);
      }
  
      // Actualizar en la tabla users
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${values.length + 1} RETURNING *`;
      values.push(user_id);
      const updatedUser = await db.one(updateQuery, values);
  
      // Actualizamos los detalles del perfil de usuario
      if (birthdate || gender || blood_type) {
        await db.none(
          `UPDATE user_profile SET birthdate = $1, gender = $2, blood_type = $3 WHERE user_id = $4`,
          [birthdate, gender, blood_type, user_id]
        );
      }
  
      // Actualizamos la dirección del usuario
      if (address) {
        await db.none(
          `UPDATE addresses SET address = $1, number_ext = $2, number_int = $3
           WHERE address_id = (SELECT address_id FROM user_profile WHERE user_id = $4)`,
          [
            address.address,
            address.number_ext,
            address.number_int,
            user_id,
          ]
        );
      }
  
      // Actualizamos el horario del usuario
      if (schedule) {
        for (let scheduleItem of schedule) {
          await db.none(
            `UPDATE schedule SET day_of_week = $1, start_time = $2, end_time = $3, is_available = $4
             WHERE userid = $5 AND address_id = (SELECT address_id FROM user_profile WHERE user_id = $6)`,
            [
              scheduleItem.day_of_week,
              scheduleItem.start_time,
              scheduleItem.end_time,
              scheduleItem.is_available,
              user_id,
              user_id,
            ]
          );
        }
      }
  
      // Devolvemos la información actualizada
      res.status(200).json({
        user_id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        role_id: updatedUser.role_id,
        birthdate,
        gender,
        blood_type,
        address,
        schedule,
      });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ mensaje: "Error al actualizar el usuario" });
    }
  });


// Delete user by ID
/**
 * @swagger
 * /api/users/{user_id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Elimina un usuario por su ID
 *     description: Elimina un usuario y todos los registros relacionados (perfil, dirección y programación).
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: El ID del usuario que deseas eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar el usuario
 */

router.delete("/:user_id", async (req, res) => {
    const { user_id } = req.params;
  
    try {
      // Verificar si el usuario existe
      const user = await db.oneOrNone("SELECT * FROM users WHERE user_id = $1", [
        user_id,
      ]);
  
      if (!user) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }
  
      // Eliminar la programación del usuario
      await db.none("DELETE FROM schedule WHERE userid = $1", [user_id]);
  
      // Eliminar el perfil del usuario
      await db.none("DELETE FROM user_profile WHERE user_id = $1", [user_id]);
  
      // Eliminar la dirección asociada al usuario
      await db.none("DELETE FROM doctor_addresses WHERE doctor_id = $1", [user_id]);
      await db.none("DELETE FROM addresses WHERE address_id = $1", [
        user.address_id,
      ]);
  
      // Eliminar el usuario de la tabla users
      await db.none("DELETE FROM users WHERE user_id = $1", [user_id]);
  
      // Responder con mensaje de éxito
      res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ mensaje: "Error al eliminar el usuario" });
    }
  });
  
module.exports = router;
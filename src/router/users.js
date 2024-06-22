import { Router } from "express";
import {
  auth,
  createUsers,
  getData,
  logIn,
  addMateria,
  cursar,
  getMateriaById,
} from "../controller/users";

const routerUsers = Router();

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Loguear usuario
 *
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Usuario no existe
 *       401:
 *         description: Contraseña incorrecta
 *       500:
 *         description: Error del servidor
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /user/usersp:
 *   post:
 *     summary: Crear usuario
 *
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *       500:
 *         description: Error del servidor
 */
routerUsers.post("/user/usersp", createUsers);

/**
 * @swagger
 * /user/getData:
 *   get:
 *     summary: Devuelve las materias de un usuario determinado
 *
 */
routerUsers.get("/user/getData", auth, getData);

/**
 * @swagger
 * /user/addMateria:
 *   post:
 *     summary: Agregar una nueva materia
 *
 *     responses:
 *       200:
 *         description: Materia agregada exitosamente
 *       500:
 *         description: Error del servidor
 */
routerUsers.post("/user/addMateria", addMateria);

/**
 * @swagger
 * /user/cursar:
 *   post:
 *     summary: Relacionar un usuario con una materia
 *
 *     responses:
 *       200:
 *         description: Materia asignada exitosamente
 *       500:
 *         description: Error del servidor
 */
routerUsers.post("/user/cursar", cursar);

/**
 * @swagger
 * /user/getMateriaById/{dni}:
 *   get:
 *     summary: ODevolver las materias que cursa un alumno determinado
 *     tags: [Usuarios, Materias]
 *     parameters:
 *       - in: path
 *         name: dni
 *         schema:
 *           type: string
 *         required: true
 *         description: DNI del usuario
 *     responses:
 *       200:
 *         description: Lista de materias cursadas
 *       404:
 *         description: No se encontraron materias
 *       500:
 *         description: Error del servidor
 */
routerUsers.get("/user/getMateriaById/:dni", getMateriaById);

export default routerUsers;

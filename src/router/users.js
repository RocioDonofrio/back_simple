//archivo para manejar las rutas de usuarios

import { Router } from "express";
import {
  auth,
  createUsers,
  getMateriasbyDni,
  logIn,
} from "../controller/users";

//objeto para manejo de url
const routerUsers = Router();

//Enpoint para loguear usuario
/**
 * @swagger
 * /user/login:
 *  post:
 *      sumary: loguear usuario
 */
routerUsers.post("/user/login", logIn);

/**
 * @swagger
 * /usersp:
 *  post:
 *      sumary: crea usuarios
 */
routerUsers.post("/user/usersp", createUsers);

/**
 * @swagger
 * /getMaterias:
 *  get:
 *      sumary: devuelve las materias para un usuario determinado
 */
routerUsers.get("/user/getMaterias", auth, getMateriasbyDni);
export default routerUsers;

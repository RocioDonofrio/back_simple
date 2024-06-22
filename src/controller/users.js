import { connect } from "../databases";
import jwt from "jsonwebtoken";
const claveSecreta = process.env.SECRET_KEY;

export const logIn = async (req, res) => {
  try {
    //obtener los datos de la request - PASO 1
    const { dni, password } = req.body;

    //obtener el objeto conexión - PASO 2
    const cnn = await connect();

    const q = `SELECT pass FROM alumno WHERE dni=?`;
    const value = [dni];

    const [result] = await cnn.query(q, value);

    if (result.length > 0) {
      //el usuario existe
      //comprar las contraseñas
      if (result[0].pass === password) {
        const token = getToken({ dni: dni });
        return res
          .status(200)
          .json({ message: "correcto", success: true, token: token });
      } else {
        return res
          .status(400)
          .json({ message: "la contraseña no coincide", success: false });
      }
    } else {
      return res
        .status(400)
        .json({ message: "user no existe", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "fallo en chatch", error: error });
  }
};

const validate = async (campo, valor, tabla, cnn) => {
  const q = `SELECT * FROM ${tabla} WHERE ${campo}=?`;
  const value = [valor];

  const [result] = await cnn.query(q, value);

  return result.length === 1; 
};

export const createUsers = async (req, res) => {
  try {
    const cnn = await connect();
    const { dni, nombre, password } = req.body;

    const userExist = await validate("dni", dni, "alumno", cnn);

    if (userExist)
      return res.status(400).json({ message: "el usuario ya existe" });

    const [result] = await cnn.query(
      "INSERT INTO alumno ( dni, nombre, pass) VALUE (?,?,?)",
      [dni, nombre, password]
    );

    if (result.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "se creo el usuario", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "no se creo el usuario", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

//funcion para autenticar el token
export const auth = (req, res, next) => {
  const tokenFront = req.headers["auth"];

  //verificar que hay un token
  if (!tokenFront) return res.status(400).json({ message: "no hay token" });

  jwt.verify(tokenFront, claveSecreta, (error, payload) => {
    if (error) {
      return res.status(400).json({ message: " el token no es valido" });
    } else {
      req.payload = payload;
      next();
    }
  });
};

export const getMateriasbyDni = (req, res) => {

  const dni = req.payload;
  console.log(dni);
  const materias = [
    { id: 1, nombre: "so2" },
    { id: 2, nombre: "web" },
    { id: 3, nombre: "arquitectura" },
  ];

  return res.status(200).json(materias);
};

//funcion que devuelte el token
const getToken = (payload) => {
  const token = jwt.sign(payload, claveSecreta, { expiresIn: "1m" });
  return token;
};

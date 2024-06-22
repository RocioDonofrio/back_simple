import { connect } from "../databases";
import jwt from "jsonwebtoken";
const secreto = process.env.SECRET_KEY;

export const logIn = async (req, res) => {
  try {
    const { dni, pass } = req.body;
    const cnn = await connect();

    const q = "SELECT pass FROM alumno WHERE dni=?";
    const parametros = [dni];

    const [row] = await cnn.query(q, parametros);
    if (row.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "usuario no existe" });

    if (pass === row[0].pass) {
      const token = getToken({ sub: dni });
      return res
        .status(200)
        .json({ success: true, message: "Correcto", token: token });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.log("error de login", error.message);
    return res.status(500).json({ message: "error", error: error });
  }
};

const userExist = async (cnn, tabla, atributo, valor) => {
  try {
    const [row] = await cnn.query(
      `SELECT * FROM ${tabla} WHERE ${atributo}=?`,
      [valor]
    );
    return row.length > 0;
  } catch (error) {
    console.log("userExist", error);
  }
};

export const createUsers = async (req, res) => {
  try {
    const cnn = await connect();
    const { nombre, dni, pass } = req.body;

    const dniExist = await userExist(cnn, "alumno", "dni", dni);

    if (dniExist) {
      return res.json({ message: "ya existe el usuario" });
    } else {
      const [row] = await cnn.query(
        "INSERT INTO alumno( nombre, dni, pass ) values ( ?, ?, ?)",
        [nombre, dni, pass]
      );

      if (row.affectedRows === 1) {
        res.json({ message: "se creo el alumno con exito", success: true });
      } else {
        return res.status(500).json({ message: "no se creo el usuario" });
      }
    }
  } catch (error) {
    console.log("create user", error);
    res.json({
      message: "No se pudo conectar con la base de datos",
      success: false,
    });
  }
};

export const publico = (req, res) => {};

export const privado = (req, res) => {
  //validar el token
};

export const getToken = (payload) => {
  try {
    const token = jwt.sign(payload, secreto);
    return token;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getData = (req, res) => {
  const user = req.user;
  const materias = [
    { id: 10, nombre: "web dinamica" },
    { id: 12, nombre: "so" },
    { id: 15, nombre: "arquitectura" },
  ];
  return res.status(200).json({ materias: materias, usuario: user });
};

export const auth = (req, res, next) => {
  const token = req.headers["auth"];

  if (!token) return res.status(400).json({ message: "sin token" });

  jwt.verify(token, secreto, (error, user) => {
    if (error) {
      return res.status(400).json({ message: "token invalido" });
    } else {
      req.user = user;
      next();
    }
  });
};

// addMateria: Cargar una nueva materia
export const addMateria = async (req, res) => {
  try {
    const connection = await connect();
    const { nombre } = req.body;

    const [result] = await connection.query(
      "INSERT INTO materia (nombre_materia) VALUES (?)",
      [nombre]
    );

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Materia creada", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "No se creó la materia", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

// Relacionar usuario con materia
export const cursar = async (req, res) => {
  try {
    const { dni, idMateria } = req.body;
    const connection = await connect();

    // Verificar si el alumno y la materia existen
    const [alumnoResult] = await connection.query(
      "SELECT * FROM alumno WHERE dni = ?",
      [dni]
    );
    if (alumnoResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Alumno no encontrado", success: false });
    }

    const [materiaResult] = await connection.query(
      "SELECT * FROM materia WHERE id_m = ?",
      [idMateria]
    );
    if (materiaResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Materia no encontrada", success: false });
    }

    // Insertar la relación en la tabla cursar
    const [row] = await connection.query(
      "INSERT INTO cursar (dni, id_m) VALUES (?, ?)",
      [dni, idMateria]
    );

    if (row.affectedRows === 1) {
      return res
        .status(200)
        .json({ message: "Relación creada con éxito", success: true });
    } else {
      return res
        .status(500)
        .json({ message: "No se pudo crear la relación", success: false });
    }
  } catch (error) {
    console.error("Error en la función cursar:", error);
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false });
  }
};

// Obtener materias de un alumno por ID
export const getMateriaById = async (req, res) => {
  try {
    const { dni } = req.params;
    const connection = await connect();

    // Verificar si el alumno existe
    const [alumnoResult] = await connection.query(
      "SELECT * FROM alumno WHERE dni = ?",
      [dni]
    );
    if (alumnoResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Alumno no encontrado", success: false });
    }

    // Obtener las materias que cursa el alumno
    const [materiasResult] = await connection.query(
      "SELECT m.id_m, m.nombre_materia FROM materia m INNER JOIN cursar c ON m.id_m = c.id_m WHERE c.dni = ?",
      [dni]
    );

    if (materiasResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "El alumno no cursa ninguna materia",
      });
    }

    return res.status(200).json({ success: true, materias: materiasResult });
  } catch (error) {
    console.error("Error en la función getMateriasByDni:", error);
    return res
      .status(500)
      .json({ message: "Error en el servidor", success: false });
  }
};

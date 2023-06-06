const express = require("express");
const app = express();

//Variables de entorno
const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });

//Motor de plantillas
app.set("view engine", "ejs");

//Variable de sesion
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Invocar conexion a la base de datos
const conection = require("./database/db.js");

//Invocar bcryptjs para generar contraseñas
const bcryptjs = require("bcryptjs");

//urlenconded para capturar datos
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const user = req.body.user;
  const name = req.body.name;
  const rol = req.body.rol;
  const pass = req.body.pass;
  var salt = bcryptjs.genSaltSync(10);
  var passwordHaash = bcryptjs.hashSync(pass, salt);

  //let passwordHaash = await bcryptjs.hash(pass);
  //Registrar usuarios
  console.log({
    user,
    name,
    rol,
    pass,
    passwordHaash,
  });

  try {
    conection.query(
      "INSERT INTO usuarios(usuario, nombre, rol, password) VALUES(?, ?, ?, ?)",
      [user, name, rol, passwordHaash]
    );
    res.render("register", {
      alert: true,
      alertTitle: "Registrado",
      alertMessage: "El usuario fue registrado con éxito",
      alertIcon: "success",
      showConfirmButton: false,
      timer: 1500,
      ruta: "",
    });
  } catch (error) {
    console.log(error);
  }
});

//Iniciar sesion
app.post("/auth", async (req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;
  var salt = bcryptjs.genSaltSync(10);
  var passwordHaash = await bcryptjs.hashSync(pass, salt);
  console.log({
    user,
    pass,
  });

  if (user && pass) {
    conection.query(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [user],
      async (error, results) => {
        if (
          results.length == 0 ||
          !(await bcryptjs.compare(pass, results[0].password))
        ) {
          res.render("login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Usuario y/o password incorrectos",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "login",
          });
        } else {
          //console.log(results);
          req.session.loggedin = true;
          req.session.name = results[0].usuario;
          console.log(results[0].usuario);
          res.render("login", {
            alert: true,
            alertTitle: "Conecxion Exitosa",
            alertMessage: "Login correcto",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: "",
          });
        }
      }
    );
  }
});

app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

//Validar sesiones
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    res.render("index", {
      login: true,
      name: req.session.name,
    });
  } else {
    res.render("index", {
      login: false,
      name: "Debe iniciar sesión",
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(3000, (req, res) => {
  console.log("Server Running in port 3000");
});

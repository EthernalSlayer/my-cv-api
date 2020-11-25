require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.set("trust proxy", 1);

//methode transport mail
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS,
  },
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.post(
  "/api/contact",
  [
    body("email").isEmail(),
    body("nom").isLength({ min: 3 }),
    body("prenom").isLength({ min: 3 }),
    body("objet").isLength({ min: 3 }),
    body("message").isLength({ min: 10 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    transporter.sendMail(
      {
        from: `${req.body.nom} ${req.body.prenom} <my.cv@gmail.com`,
        to: "guillaume.b.a@protonmail.com",
        subject: req.body.objet,
        text: `${req.body.message} ${req.body.email}`,
      },
      (error, response) => {
        console.log(response);
        if (error) {
          res.status(500).send(error);
        } else {
          res.send({ message: "email envoyer" });
        }
      }
    );
  }
);

app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    throw new Error("Something bad happened...");
  }
  console.log(`Server is listening on ${process.env.PORT}`);
});

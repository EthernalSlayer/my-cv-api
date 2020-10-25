require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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
  max: 10, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.post("/api/contact", (req, res) => {
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
        res.sendStatus(500);
      } else {
        console.log("Message sent: " + response.message);
        res.send({ message: "email envoyer" });
      }
    }
  );
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    throw new Error("Something bad happened...");
  }
  console.log(`Server is listening on ${process.env.PORT}`);
});

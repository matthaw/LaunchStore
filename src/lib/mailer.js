const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "bc346bfd0aeed0",
    pass: "6aaa83e86fbade"
  }
});
const nodemailer = require('nodemailer');

const options = {
    host: process.env.NODEMAILER_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.NODEMAILER_PORT) || 2525,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
    },
};

const mailer = nodemailer.createTransport(options);

module.exports = mailer;
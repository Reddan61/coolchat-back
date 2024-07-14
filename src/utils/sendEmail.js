const mailer = require("../core/mailer");


module.exports.sendEmail = ({
    emailFrom,
    emailTo,
    subject,
    html
}) => {
    return new Promise((resolve, reject) => {
        mailer.sendMail(
            {
                from: emailFrom,
                to: emailTo,
                subject: subject,
                html: html,
            },
            (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info)
                }
            }
        );
    })
};


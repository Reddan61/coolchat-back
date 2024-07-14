const validator = require("express-validator");

module.exports.fargotPasswordValidation = [validator.body('email', "Write E-Mail")
    .isEmail()
    .withMessage("Wrong E-Mail")];


module.exports.resetPasswordValidation = [
    validator.body('password', 'Write password')
        .isString()
        .isLength({
            min:6
        })
        .withMessage('Password must be minimum 6 characters')
        .custom((value, {req}) => {
            if(value !== req.body.password2) {
                throw new Error("Password mismatch")
            } else {
                return value;
            }
         })
]
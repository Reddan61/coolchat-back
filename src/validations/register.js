const validator = require("express-validator");


module.exports.registerValidations = [
    validator.body('email', "Write E-Mail")
        .isEmail()
        .withMessage("Wrong E-Mail"),
    validator.body("username", 'Write username')
        .isString()
        .isLength({
            min:2,
            max:20
        })
        .withMessage('Username length must match 2-20 characters'),
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
];


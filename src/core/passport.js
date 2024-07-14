const passport = require('passport');

const {Strategy : LocalStrategy} =  require("passport-local");
const {Strategy : JWTstrategy, ExtractJwt} = require("passport-jwt")
const { UserModel } = require('../models/UserModel');
const { generateMD5 } = require('../utils/generateHash');



passport.use(new LocalStrategy(async (username,password,done) => {
    try{
        const user = await UserModel.findOne({ username }).exec()

        if(!user) {
            return done(null, false)
        } 

        if(user.password === generateMD5(password + process.env.SECRET_KEY)) {
            return done(null, user)
        } else {
            return done(null, false)
        }

    } catch(e) {
        done(e, false);
    }
}))

passport.use( new JWTstrategy(
    {
        secretOrKey:process.env.SECRET_KEY,
        jwtFromRequest:ExtractJwt.fromHeader('token')
    },
    async (payload, done) => {
        try {
            const user = await UserModel.findById(payload.data._id).exec();
            
            if(user) {
                done(null,user);
                return;
            }

            done(null,false)
        }
        catch (e) {
            done(e,false);
        }
    }

))




passport.serializeUser((user,done) => {
    done(null,user._id);
});

passport.deserializeUser(function(id,done) {
    UserModel.findById(id,(err,user) => {
        done(err,user);
    })
});

module.exports =  {passport}
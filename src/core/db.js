const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/chat',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:true
});


const db = mongoose.connection;

db.on('error', console.error.bind(console,'connection error:'));


module.exports =  {db,mongoose};




const express = require('express')//import express
const app = express()//menjalankan perintah express
const expressMongoDb = require('express-mongo-db'); //import express-mongodb
const bodyParser = require('body-parser')// import body-parser
const methodOverride = require('method-override')// import method-override
const expressValidator = require('express-validator') //import express validator
const flash = require('express-flash') // import express flash
//const cookieParser = require('cookie-parser);
const session = require('express-session'); // import express session
const config = require('./config') //import file config.js
const admin = require('./routes/admin') //import file admin.js

app.use(expressMongoDb(config.database.url)); //menjalankan fungsi mongodb untuk menyambungkan ke database
app.use(express.static("public"));
app.set('view engine', 'ejs') //mengeset template view yang digunakan berformat ejs
app.use(expressValidator()) //mambuat express untuk dapat menjalankan validasi
app.use(bodyParser.urlencoded({extended: true})) //
app.use(bodyParser.json()) //mengubah request data berbentuk json

app.use(methodOverride(function (req, res){ //mengubah method request post get menjadi sesuai dengan request yang ditentukan spt put delete
    if (req.body && typeof req.body === 'object' && '_method' in req.body){ 
        const method = req.body._method
        delete req.body._method
        return method 
    }
}))
//app.use(cookieParser('keyboard cat))
app.use(session({ //mengeset express dpt menggunakan session
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000}
}))
app.use(flash()) //untuk menampilkan pesan error/success
app.use('/', admin)
app.use('/admin', admin)
app.listen(config.server.port, function() {
    console.log(`Server running at port ${config.server.port}: http://${config.server.host}:${config.server.port}`)
})
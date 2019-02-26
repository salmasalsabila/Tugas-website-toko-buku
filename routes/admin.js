const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/sampul/')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({storage: storage})

app.get('/', function(req, res){
    //render(menampilkan) to views/index.ejs template file
    res.render('./index', {title:"TOKO BUKU"});
});

//Tampilkan data
app.get('/tampil', function(req, res, next){
    //mengambil data dari database secara descending
    req.db.collection('coba').find().sort({"_id": -1}).toArray(function(err, result){ //mengambil data di database XIR6 collection coba
        
        if (err) { 
            req.flash('error', err)
            res.render('user/list', {
                title:'Data Buku',
                data: ''
            })
        }else {
            //menampilkan views list.ejs
            res.render('user/list', {
                title: 'Data Buku',
                data : result
            })
        }
    })
})

//tampilkan form input
app.get('/add', function(req, res, next){
    //tampilkan views add.ejs
    res.render('user/add', {
        title : 'Tambah Data Buku',
        sampul : '',
        judul : '',
        namapenerbit : '',
        tahunterbit : '',
        jumlahhalaman: ''
    })
})

//proses input data
app.post('/add', upload.single('sampul'), function(req, res, next){
    //req.assert('sampul', 'Sampul is required').notEmpty()
    req.assert('judul', 'Judul is required').notEmpty()
    req.assert('namapenerbit', 'Nama Penerbit is required').notEmpty()
    req.assert('tahunterbit', 'Tahun Terbit is required').isNumeric()
    req.assert('jumlahhalaman', 'Jumlah Halaman is required').isNumeric()
    
    var errors = req.validationErrors()
    
    if (!errors) {
        var user = {
            sampul: req.file.filename,
            judul: req.sanitize('judul').escape().trim(),
            namapenerbit: req.sanitize('namapenerbit').escape().trim(),
            tahunterbit: req.sanitize('tahunterbit').escape().trim(),
            jumlahhalaman: req.sanitize('jumlahhalaman').escape().trim()
        }
        
        req.db.collection('coba').insert(user, function(err, result){
            if(err) {// jika error saat memasukkan data maka akan tetap menampilkan isi form
                //render to views/user/ad.ejs
                res.render('user/add', {
                    title: 'Tambah Data Buku',
                    sampul : user.sampul,
                    judul : user.judul,
                    namapenerbit : user.namapenerbit,
                    tahunterbit : user.tahunterbit,
                    jumlahhalaman: user.jumlahhalaman
                })
            } else {
                req.flash('Berhasil', 'Data Buku berhasil ditambah!')
                
                //redirect to user list page
                res.redirect('/tampil')
            }
        })
    }
    else {  //Display errors to user
        var error_msg='' //membuat error menjadi satu string
        errors.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        res.render('user/add', {
            title : 'Tambah Data Buku',
            sampul: '',
            judul: req.body.judul,
            namapenerbit : req.body.namapenerbit,
            tahunterbit : req.body.tahunterbit,
            jumlahhalaman : req.body.jumlahhalaman
        })
    }
})

//SHOW EDIT USER FROM
app.get('/edit/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err, result){
        if(err) return console.log(err)
        
        //jika data tidak ada
        if(!result) {
            req.flash('error', "User not found with id = " + req.params.id)
            releaseEvents.redirect('/admin')
        }
        else {//jika data ada
            // tampilkan views/user/edit.ejs
            res.render('user/edit', {
                title: 'EDIT DATA BUKU',
                //dat: rows[0]
                id: result[0]._id,
                sampul : result[0].sampul,
                judul : result[0].judul,
                namapenerbit : result[0].namapenerbit,
                tahunterbit : result[0].tahunterbit,
                jumlahhalaman : result[0].jumlahhalaman
            })
        }
    })
})

//EDIT USER DATA ACTION
app.post('/edit/(:id)', upload.single('sampul'), function(req, res, next) {
    req.assert('judul', 'Judul is required').notEmpty()
    req.assert('namapenerbit', 'Nama Penerbit is required').notEmpty()
    req.assert('tahunterbit', 'Tahun Terbit is required').notEmpty()
    req.assert('jumlahhalaman', 'Jumlah Halaman is required').notEmpty()
    
    var errors = req.validationErrors()
    
    if(!errors) { //jika form validation benar
        if (req.file.filename) {    
            var user = { 
                sampul : req.file.filename,
                judul: req.sanitize('judul').escape().trim(),
                namapenerbit: req.sanitize('namapenerbit').escape().trim(),
                tahunterbit: req.sanitize('tahunterbit').escape().trim(),
                jumlahhalaman: req.sanitize('jumlahhalaman').escape().trim()
            }
        } else {
            var user = { 
                judul: req.sanitize('judul').escape().trim(),
                namapenerbit: req.sanitize('namapenerbit').escape().trim(),
                tahunterbit: req.sanitize('tahunterbit').escape().trim(),
                jumlahhalaman: req.sanitize('jumlahhalaman').escape().trim()
            }
        }
        
        var o_id = new ObjectId(req.params.id)
        req.db.collection('coba').update({"_id" : o_id}, user, function(err, result){
            if(err) { 
                req.flash('error', err)
                
                //render to views/user/edit.ejs
                res.render('user/edit', {
                    title : 'EDIT DATA BUKU',
                    id : req.params.id,
                    sampul : '',
                    judul : req.body.judul,
                    namapenerbit : req.body.namapenerbit,
                    tahunterbit :req.body.tahunterbit,
                    jumlahhalaman : req.body.jumlahhalaman
                })
            } else {
                req.flash('Berhasil', 'Data Buku berhasil di update')
                res.redirect('/tampil')
            }
        })
    }
    else { //Display error to user
        var error_msg = ''
        errors.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        res.render('user/edit', {
            title : 'EDIT DATA BUKU',
            id : req.params.id,
            judul : req.body.judul,
            namapenerbit : req.body.namapenerbit,
            tahunterbit : req.body.tahunterbit,
            jumlahhalaman : req.body.jumlahhalaman
        })
    }
})

app.get('/detail/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err, result){
        if(err) return console.log(err)
        
        //jika data tidak ada
        if(!result) {
            req.flash('error', "User not found with id = " + req.params.id)
            releaseEvents.redirect('/admin')
        }
        else {//jika data ada
            // tampilkan views/user/edit.ejs
            res.render('user/detail', {
                title: 'DETAIL DATA BUKU',
                //dat: rows[0]
                id: result[0]._id,
                sampul : result[0].sampul,
                judul : result[0].judul,
                namapenerbit : result[0].namapenerbit,
                tahunterbit : result[0].tahunterbit,
                jumlahhalaman : result[0].jumlahhalaman
            })
        }
    })
})

//DELETE USER 
app.delete('/delete/(:id)', function(req, res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').remove({"_id": o_id}, function(err, result) {
        if(err) {
            req.flash('error', err)
            //redirect hlaman tampil datas
            res.redirect('/admin')
        } else {
            req.flash('berhasil', 'Data Buku berhasil dihapus')
            //redirect halaman tampil data
            res.redirect('/tampil')
        }
    })
})

module.exports = app 




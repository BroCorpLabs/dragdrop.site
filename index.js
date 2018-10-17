var express = require('express')

//for file upload/storage
var multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'userSites/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})


var app = express()
app.use(express.static('static'))
app.get('/', function(req, res){
    res.sendFile(__dirname + "/static/dragdrop.html");
})

app.post( '/upload', upload.single('dropfile'), function( req, res, next ) {
  // Metadata about the uploaded file can now be found in req.file
  console.log(req);
  return res.status( 200 ).send('success');
});

var port=3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

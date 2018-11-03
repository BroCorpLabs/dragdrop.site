var express = require('express')
var cookieParser = require('cookie-parser');
const fs = require('fs');
const webdir = __dirname + "/sites/"; //migrate to /var/www/sites

//for file upload/storage
var multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})


var app = express()
app.use(cookieParser());
app.use(express.static('static/'));
app.use(express.static('sites/'));

app.get('/', function(req, res){
    res.sendFile(__dirname + "/static/dragdrop.html");
})

function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function makeRedirect(from, to, siteID){
  htmlRedirect = '<html><head><meta property="og:url" content="'+ to +'" />'+
        '<meta property="og:type" content="article" />'+
        '<meta property="og:title" content="Drag-Dropped Site" />'+
        '<meta property="og:description" content="Easy static hosting at Dragdrop.site" />'+
        '<meta HTTP-EQUIV="REFRESH" content="0; url='+ to +'"></head></html>"""'

  fs.writeFile(__dirname + "/sites/"+siteID+"/"+from, htmlRedirect, { flag: 'w' }, function (err) {
    if (err) throw err;
    console.log('Redirect File is created successfully.');
  }); 
}

function newSite(filename){
  var siteID = makeid(5)
  fs.mkdir(webdir+siteID, (err) => {
    if (err) throw err;
  });
  console.log("created directory")
  //create a new directory with siteID in /var/www/userSites/
  //create a new nginx file in /etc/nginx/sites-available/
  //create a symlink in /etc/nginx/sites-enabled
  moveToUserDir(filename, siteID);
  if(filename !== "index.html"){ //if initial file is not index.html, create a redirect to it
    makeRedirect("index.html", filename, siteID)
  }
  return siteID;
}

function moveToUserDir(filename, siteID){
  fs.rename(__dirname + '/uploads/' + filename, webdir+siteID + '/' + filename, function(err) {
    if (err) throw err
    console.log('Successfully moved '+ filename + ' for ' +siteID);
  })
  //move file from uploads dir to user dir
    //if file exists, rename existing and add new
}

app.post( '/upload', upload.single('dropfile'), function( req, res, next ) {
  // Metadata about the uploaded file can now be found in req.file
  console.log(req.cookies.siteID + " uploaded "+ req.file.originalname);
  if(req.cookies.siteID == undefined){
    console.log("creating new site")
    return res.status( 201 ).cookie('siteID', newSite(req.file.originalname)).send('successfully created new site');
  } else {
    moveToUserDir(req.file.originalname, req.cookies.siteID);
    return res.status( 200 ).send('successfully added file to site: '+req.cookies.siteID);
  }
});

var port=3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

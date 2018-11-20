var express = require('express')
var cookieParser = require('cookie-parser');
const fs = require('fs');
const webdir = "/var/www/userSites/"//__dirname + "/sites/"; //migrate to /var/www/sites

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

  fs.writeFile(webdir+"/"+siteID+"/"+from, htmlRedirect, { flag: 'w' }, function (err) {
    if (err) throw err;
    console.log('Redirect File is created successfully.');
  }); 
}

function makeNginxConfig(siteID){
  configText = `server {
    listen 80;
    listen [::]:80;
    server_name `+siteID+`.dragdrop.site; 
    root /var/www/userSites/`+siteID+`/;
    index index.html;
    location / {
            try_files $uri $uri/ =404;
    }
    }
    `
    //create config file for nginx
    fs.writeFile("/etc/nginx/sites-available/"+siteID, configText, { flag: 'w' }, function (err) {
      if (err) throw err;
      console.log('Nginx File is created successfully.');
      //create symlink in sites-enabled
      fs.symlink("/etc/nginx/sites-available/"+siteID, "/etc/nginx/sites-enabled/"+siteID, function(){
        //reload nginx
      const
        { spawnSync } = require( 'child_process' ),
        ls = spawnSync( 'nginx', [ '-s', 'reload' ] );
        console.log(ls)
        console.log( `Nginx restart: ${ls.stdout.toString()}` );
      })
    }); 
    console.log("done with nginx");
}

function newSite(filename){
  var siteID = makeid(5)
  //create a new directory with siteID in /var/www/userSites/
  fs.mkdir(webdir+siteID, (err) => {
    if (err) throw err;
  });
  makeNginxConfig(siteID);
  moveToUserDir(filename, siteID);
  if(filename !== "index.html" && !fs.existsSync(webdir+siteID+"/index.html")){ //if initial file is not index.html, create a redirect to it
    console.log("non index.html starter, created")
    makeRedirect("index.html", filename, siteID)
  }
  return siteID;
}

function getSiteFiles(siteID){

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

function getFileSize(filepath){
  const stats = fs.statSync(filepath)
  return stats.size;
}

app.get('/uploads', function(req, res){
  if(req.cookies.siteID != undefined){
    siteid = req.cookies.siteID;
    fs.readdir(webdir + siteid, (err, files) => {
      var filesArray = files.map(function (file) {
          return {'name':file, 'size':getFileSize(webdir+siteid+"/"+file)};
      });
      res.send(JSON.stringify(filesArray));
    })
  } else {return null}
});

var port=3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

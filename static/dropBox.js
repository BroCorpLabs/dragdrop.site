Dropzone.options.dropfile = {
    paramName: "dropfile", // The name that will be used to transfer the file
    init: function () {
                thisDropzone = this;
                if(getCookie("siteID")!=""){ //to fetch existing files and display them
                  console.log("welcome back " + getCookie("siteID"));
                  $.get('/uploads', function (data) {
                      if (data == null) {
                          return;
                      }
                      document.getElementById('dropfile').setAttribute("style","background-image:url();box-shadow:15px black;border-radius:10px;margin-left:auto;margin-right:auto;width:40vw;")
                      data = JSON.parse(data);
                      $.each(data, function (key, value) {
                          var mockFile = { name: value.name, size: value.size };
                          thisDropzone.emit("addedfile", mockFile);
                          //thisDropzone.options.thumbnail.call(thisDropzone, mockFile, '/public/uploads/thumbnail_' + value.name);
                          // Make sure that there is no progress bar, etc...
                          thisDropzone.emit("complete", mockFile);
                      });
                  });
                }
                this.on("sending", function(file) {
                        var name = file.fullPath;
                        if (typeof (file.fullPath) === "undefined") {
                            name = file.name;
                        }
                        console.log("uploading file: "+name)
                $("#tmp-path").html('<input type="hidden" name="path" value="'+name+'" />')
                });
    },
    maxFilesize: 2, // MB
    withCredentials: true,
    dictDefaultMessage: "Drop files here or click to upload.",
    accept: function(file, done) {
      if (file.name == "justinbieber.jpg") {
        done("Psst. we only support HTML, CSS and Javascript. :(");
      }
      else { 
        document.getElementById('dropfile').setAttribute("style","background-image:url();box-shadow:15px black;border-radius:10px;margin-left:auto;margin-right:auto;width:40vw;")
        done(); }
    },
    success: function(file, res){
      //the response here sets a cookie with siteID if its a new site
      updateSiteLink();
      console.log(res)
    }
  };
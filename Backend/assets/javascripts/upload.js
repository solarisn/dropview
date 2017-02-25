
// Adds a click listener and resets the progress bar to 0%
$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
}); 

$('#upload-input').on('change', function(){

    var files = $(this).get(0).files;

    if (files.length > 0){
        // One or more files selected, process the file upload

        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // add the files to formData object for the data payload
            formData.append('uploads[]', file, file.name);
        }
        
        //formData.append('testObj', files[0], files[0].name);


        // AJAX request to post our data to the upload endpoint
        $.ajax({
            url: '/upload',
            type: 'POST',
            port: 1337,
            data: formData, //the data we are sending
            processData: false, //tell JQuery not to add Content-Type header
            contentType: false, //tell JQuery not to convert object to string
            success: function(data){
                console.log('upload successful!');
            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();

                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function (evt) {

                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Done');
                        }

                    }

                }, false);

                return xhr;
            }
        });


    }

});


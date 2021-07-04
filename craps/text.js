/*
https://ckeditor.com/ckeditor-5/
https://blog.csdn.net/Q_QuanTing/article/details/105991436?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522161603622216780265448520%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=161603622216780265448520&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_v2~rank_v29-1-105991436.first_rank_v2_pc_rank_v29&utm_term=creditor+上传
https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/simple-upload-adapter.html
https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/upload-adapter.html#how-does-the-image-upload-work
https://ckeditor.com/docs/ckeditor5/latest/api/module_upload_filerepository-FileRepository.html
https://ckeditor.com/docs/ckeditor5/latest/features/image.html
*/
ClassicEditor
    .create( document.querySelector( '#editor' ) )
    .catch( error => {
        console.error( error );
    } );

class MyUploadAdapter {
    constructor(loader) {
        // The file loader instance to use during the upload.
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                this.uploadFile(file, resolve);
            }));
    }

    uploadFile(file, resolve) {
        // 上传文件
        $.ajax({
            url: "XXXXXXXXX",
            type: 'POST',
            data: file,
            processData: false,
            beforeSend: function (request) {
                request.setRequestHeader("Content-Type", file.type);
            },
            success: function (respJson) {
                if (respJson.code == 0) {
                    resolve({
                        default: respJson.result[0].url
                    });
                } else {
                    alert("错误：" + respJson.msg)
                }
            },
            error: function (e) {
            }
        });
    }

    // Aborts the upload process.
    abort() {
        // Reject the promise returned from the upload() method.
        server.abortUpload();
    }
}

editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
    return new MyUploadAdapter( loader );
};

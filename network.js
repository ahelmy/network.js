"use strict";
/**
 * 
 * @author Ali Helmy
 */
class Network {
    /**
     * 
     * @param {*} interval How many times to call upload and download, if -1 infinity. Default = 1 
     * @param {*} callback functions upload(speed, average_upload), download(speed, average_download)
     * @param {*} options {upload_every, download_every} in seconds, default = 30 seconds
     */
    constructor(interval = 1, callback = null, options = { upload_every: 30, download_every: 30 }) {
        var uploadAverage = 0, downloadAverage = 0, uploadIndex = 0, downloadIndex = 0, uploadTimer = null, downloadTimer = null;

        /**
         * Start execute timers
         */
        this.start = function () {
            uploadTimer = window.setInterval(checkUpload, options.upload_every * 1000);
            downloadTimer = window.setInterval(checkDownload, options.download_every * 1000);
            return this;
        };

        /**
         * Stop check timers
         */
        this.stop = function () {
            window.clearInterval(uploadTimer);
            window.clearInterval(downloadTimer);
            return this;
        };

        /**
         * Generate random data within the sizeInMb 
         * @param {*} sizeInMb Size in MB with random string
         */
        var getRandomString = function (sizeInMb) {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+`-=[]\{}|;':,./<>?", //random data prevents gzip effect
                iterations = sizeInMb * 1024 * 1024, //get byte count
                result = '';
            for (var index = 0; index < iterations; index++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            ;
            return result;
        };

        /**
         * Check upload speed
         */
        var checkUpload = function () {
            var xhr = new XMLHttpRequest(), url = '/test-upload?cache=' + Math.floor(Math.random() * 10000), //prevent url cache
                data = getRandomString(1), //1 meg POST size handled by all servers
                startTime, speed = 0;
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState == 4) {
                    speed = Math.round(1024 / ((new Date() - startTime) / 1000));
                    uploadAverage == 0 ? uploadAverage = speed : uploadAverage = Math.round((uploadAverage + speed) / 2);
                    console.log(`Upload speed: ${speed} kbp, average: ${uploadAverage} kbp`);
                    if (callback && callback.upload) {
                        callback.upload(speed, uploadAverage);
                    }
                    if (interval > -1) {
                        uploadIndex++;
                        if (uploadIndex >= interval) {
                            window.clearInterval(uploadTimer);
                        }
                        ;
                    }
                }
                if (xhr.readyState == 1) {
                    startTime = new Date();
                }
            };
            xhr.open('POST', url, true);
            xhr.send(data);
        };

        /**
         * Check download speed
         */
        var checkDownload = function () {
            var fileURL = "/test-download?cache=" + Math.floor(Math.random() * 10000);
            var request = new XMLHttpRequest();
            request.open('GET', fileURL, true);
            request.responseType = "*/*";
            var startTime = (new Date());
            var endTime = startTime;
            var speed = 0;
            request.onreadystatechange = function () {
                if (request.readyState == 1) {
                    //ready state 2 is when the request is sent
                    startTime = (new Date());
                }
                if (request.readyState == 4) {
                    speed = Math.round(1024 / ((new Date() - startTime) / 1000));
                    downloadAverage == 0 ? downloadAverage = speed : downloadAverage = Math.round((downloadAverage + speed) / 2);
                    console.log(`Download speed: ${speed} kbp, average: ${downloadAverage} kbp`);
                    if (callback && callback.download) {
                        callback.download(speed, downloadAverage);
                    }
                    if (interval > -1) {
                        downloadIndex++;
                        if (downloadIndex >= interval) {
                            window.clearInterval(downloadTimer);
                        }
                        ;
                    }
                }
            };
            request.send();
        };
    }
}


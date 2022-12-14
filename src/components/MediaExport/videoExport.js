// https://stackoverflow.com/questions/73685095/im-getting-error-while-building-the-project-in-vue-for-ffmpeg-wasm
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg/dist/ffmpeg.min.js';
const fs = require('fs');
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg/dist/ffmpeg.min.js');


export function videoExport() {
  const recordedChunks = [];
  const options = { mimeType: "video/webm" };
  var stream;
  var record;
  const ffmpeg = createFFmpeg({
    log: false
  });
  // Following line is to test CORS.
  ffmpeg.load();
  let handleDataAvailable = function(event) {
    // console.log("data-available");
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      download();
    } else {
      console.log('Video has length 0. This is probably because there was no movement in the canvas.');
    }
  }

  let download = function () {
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });
    const url = URL.createObjectURL(blob);
    const doTranscode = async () => {
      // setMessage('Loading ffmpeg-core.js');
      console.log("If there's a 'ReferenceError: SharedArrayBuffer is not defined' error immediately after this,",
        "that means FFMPEG.WASM failed to load, likely because of cross-origin isolation.");
      await ffmpeg.load();
      console.log('If this message is shown, then FFMPEG.WASM was loaded.');
      // setMessage('Start transcoding');
      ffmpeg.FS('writeFile', 'video.webm', await fetchFile(blob));
      // ffmpeg.FS('writeFile', 'video.webm', await fetchFile('/flame.avi'));
      await ffmpeg.run('-i', 'video.webm', '-vcodec', 'libx264', 'video.mp4');
      // setMessage('Complete transcoding');
      const data = ffmpeg.FS('readFile', 'video.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      const a = document.createElement('a');
      // console.log('-------');
      // console.log(data);
      // console.log(url);
      // console.log('-------');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'video.mp4';
      a.innerHTML = 'hi';
      a.click();
      window.URL.revokeObjectURL(url);
      // remove a?
      // setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' })));
    };
    doTranscode();
    //const a = document.createElement("a");
    //document.body.appendChild(a);
    //a.style = "display: none";
    //a.href = url;
    //a.download = "test.webm";
    //a.click();
    //window.URL.revokeObjectURL(url);
  }

  this.initializeRecorder = function(element) {
    stream = element.captureStream(30);
    record = new MediaRecorder(stream, options);
    record.ondataavailable = handleDataAvailable;
  }

  this.startRecording = function(duration) {
    record.start();
    // console.log('starting');
    setTimeout(() => { record.stop() }, duration);
  }
}
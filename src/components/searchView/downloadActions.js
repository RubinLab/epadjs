/*
// function onInitFs(fs) {
//   console.log("Opened file system: " + fs.name);
// }
window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

export const createDirectory = async patientName => {
  console.log("fired");
  let dirName = "_aims_";
  let size = 1024 * 1024;

  window.requestFileSystem(
    window.TEMPORARY,
    size,
    function(fs) {
      fs.root.getDirectory(
        dirName,
        { create: true },
        () => directoryCreationSuccess(dirName, fs.root),
        errorHandler
      );
    },
    errorHandler
  );
  console.log("in between");
  removeDirectory(dirName, size);
};

export const removeDirectory = (dirName, size) => {
  window.requestFileSystem(
    window.TEMPORARY,
    size,
    function(fs) {
      fs.root.getDirectory(
        dirName,
        {},
        function(dirEntry) {
          dirEntry.remove(function() {
            console.log(`${dirName} Directory removed.`);
            console.log(dirEntry);
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
};

export const removeRecursively = (dirName, size) => {
  window.requestFileSystem(
    window.TEMPORARY,
    size,
    function(fs) {
      fs.root.getDirectory(
        dirName,
        {},
        function(dirEntry) {
          dirEntry.removeRecursively(function() {
            console.log(`${dirName} Directory removed.`);
          }, errorHandler);
        },
        errorHandler
      );
    },
    errorHandler
  );
};
export const createFile = (id, data) => {
  //   window.requestFileSystem(
  //     window.TEMPORARY,
  //     1024 * 1024,
  //     onInitFs,
  //     errorHandler
  //   );
  window.requestFileSystem(
    window.TEMPORARY,
    5 * 1024 * 1024 
    //5MB,
    onInitFs,
    errorHandler
  );
};

function onInitFs(fs) {
  fs.root.getFile(
    "testAnndownload2.txt",
    { create: true, exclusive: true },
    function(fileEntry) {
      console.log("success - testAnndownload");
      console.log(fileEntry);
      //   fileEntry.isFile === true;
      //   fileEntry.name == "testAnndownload.txt";
      //   fileEntry.fullPath == "/testAnndownload.txt";
    },
    errorHandler
  );
}

const directoryCreationSuccess = (patientName, root) => {
  console.log(`${patientName} is created`);
  console.log(root);
};

function errorHandler(e) {
  //   var msg = "";

  //   switch (e.code) {
  //     case FileError.QUOTA_EXCEEDED_ERR:
  //       msg = "QUOTA_EXCEEDED_ERR";
  //       break;
  //     case FileError.NOT_FOUND_ERR:
  //       msg = "NOT_FOUND_ERR";
  //       break;
  //     case FileError.SECURITY_ERR:
  //       msg = "SECURITY_ERR";
  //       break;
  //     case FileError.INVALID_MODIFICATION_ERR:
  //       msg = "INVALID_MODIFICATION_ERR";
  //       break;
  //     case FileError.INVALID_STATE_ERR:
  //       msg = "INVALID_STATE_ERR";
  //       break;
  //     default:
  //       msg = "Unknown Error";
  //       break;
  //   }

  console.log(e.message);
  console.log(e.code);
  console.log(e.name);
}
*/

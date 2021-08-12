(function (cs) {
    
    "use strict";

    function loadImage(imageId) {
        // Parse the imageId and return a usable URL (logic omitted)
        const url = parseImageId(imageId);
    
        // Create a new Promise
        const promise = new Promise((resolve, reject) => {
          // Inside the Promise Constructor, make
          // the request for the DICOM data
          const oReq = new XMLHttpRequest();
          oReq.open("get", url, true);
          oReq.responseType = "arraybuffer";
          oReq.onreadystatechange = function(oEvent) {
              console.log(oReq.status)
              if (oReq.readyState === 4) {
                  if (oReq.status == 200) {
                      // Request succeeded, Create an image object (logic omitted)
                      const image = createImageObject(oReq.response);
    
                      // Return the image object by resolving the Promise
                      resolve(image);
                  } else {
                      // An error occurred, return an object containing the error by
                      // rejecting the Promise
                      reject(new Error(oReq.statusText));
                  }
              }
          };
    
          oReq.send();
        });
    
        // Return an object containing the Promise to cornerstone so it can setup callbacks to be
        // invoked asynchronously for the success/resolve and failure/reject scenarios.
        return {
          promise
        };
    }

    // register our imageLoader plugin with cornerstone
    cs.registerImageLoader('customImgLoader', loadImage);

}(cornerstone));
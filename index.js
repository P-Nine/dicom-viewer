cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.configure({
    beforeSend: function (xhr) {
        // Add custom headers here (e.g. auth tokens)
        // xhr.setRequestHeader('APIKEY', 'my auth token');
    }
});

const renderEl = document.querySelector('#renderEl');
cornerstone.enable(renderEl);

const imageIds = Array.from({ length: 107 }).map(
    (el, index) => 'wadouri:https://p-nine.github.io/dicom-viewer/data/case-1/series-2/IM' + String(index+1).padStart(6, '0')
);
let currentImageIndex = 0;
function updateTheImage(imageIndex) {
    return cornerstone.loadAndCacheImage(imageIds[imageIndex]).then(function (image) {
        const viewport = cornerstone.getViewport(renderEl);
        cornerstone.displayImage(renderEl, image, viewport);
        document.querySelector('#coords').textContent = "pageX=0, pageY=0, pixelX=0, pixelY=0";
    });
}

// load and display the image
const imagePromise = updateTheImage(0);

// add handlers for mouse events once the image is loaded.
imagePromise.then(function () {

    // add event handlers to pan image on mouse move
    renderEl.addEventListener('mousedown', function (e) {
        let lastX = e.pageX;
        let lastY = e.pageY;
        const mouseButton = e.which;

        function mouseMoveHandler(e) {
            const deltaX = e.pageX - lastX;
            const deltaY = e.pageY - lastY;
            lastX = e.pageX;
            lastY = e.pageY;

            if (mouseButton === 1) {
                let viewport = cornerstone.getViewport(renderEl);
                viewport.voi.windowWidth += (deltaX / viewport.scale);
                viewport.voi.windowCenter += (deltaY / viewport.scale);
                cornerstone.setViewport(renderEl, viewport);
            } else if (mouseButton === 2) {
                let viewport = cornerstone.getViewport(renderEl);
                viewport.translation.x += (deltaX / viewport.scale);
                viewport.translation.y += (deltaY / viewport.scale);
                cornerstone.setViewport(renderEl, viewport);
            } else if (mouseButton === 3) {
                let viewport = cornerstone.getViewport(renderEl);
                viewport.scale += (deltaY / 100);
                cornerstone.setViewport(renderEl, viewport);
            }
        }

        function mouseUpHandler() {
            document.removeEventListener('mouseup', mouseUpHandler);
            document.removeEventListener('mousemove', mouseMoveHandler);
        }

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    const mouseWheelEvents = ['mousewheel', 'DOMMouseScroll'];
    mouseWheelEvents.forEach(function (eventType) {
        renderEl.addEventListener(eventType, function (e) {
            // Firefox e.detail > 0 scroll back, < 0 scroll forward
            // chrome/safari e.wheelDelta < 0 scroll back, > 0 scroll forward
            if (e.wheelDelta < 0 || e.detail > 0) {
                if(currentImageIndex<106) {
                    currentImageIndex++;
                    updateTheImage(currentImageIndex);
                }
            } else {
                if(currentImageIndex>0) {
                    currentImageIndex--;
                    updateTheImage(currentImageIndex);
                }
            }
            // Prevent page from scrolling
            return false;
        });
    });

    document.querySelector('#invertBtn').addEventListener('click', function (e) {
        const viewport = cornerstone.getViewport(renderEl);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(renderEl, viewport);
    });

    document.querySelector('#hFlipBtn').addEventListener('click', function (e) {
        const viewport = cornerstone.getViewport(renderEl);
        viewport.hflip = !viewport.hflip;
        cornerstone.setViewport(renderEl, viewport);
    });

    document.querySelector('#vFlipBtn').addEventListener('click', function (e) {
        const viewport = cornerstone.getViewport(renderEl);
        viewport.vflip = !viewport.vflip;
        cornerstone.setViewport(renderEl, viewport);
    });

    document.querySelector('#rotateBtn').addEventListener('click', function (e) {
        const viewport = cornerstone.getViewport(renderEl);
        viewport.rotation += 90;
        cornerstone.setViewport(renderEl, viewport);
    });

    document.querySelector('#resetBtn').addEventListener('click', function (e) {
        cornerstone.reset(renderEl);
    });

    renderEl.addEventListener('mousemove', function (event) {
        const pixelCoords = cornerstone.pageToPixel(renderEl, event.pageX, event.pageY);
        document.querySelector('#coords').textContent = "pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y;
    });
});
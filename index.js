cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.configure({
    beforeSend: function (xhr) {
        // Add custom headers here (e.g. auth tokens)
        // xhr.setRequestHeader('APIKEY', 'my auth token');
    }
});

const imageId = 'wadouri:https://p-nine.github.io/dicom-viewer/data/case-1/series-1/IM000001';
const renderEl = document.querySelector('#renderEl');
cornerstone.enable(renderEl);
cornerstone.loadAndCacheImage(imageId).then(function (image) {
    cornerstone.displayImage(renderEl, image);
});

// On mode change
function setActiveMode(mode) {
    // var newEl = renderEl.cloneNode(true);
    // renderEl.parentNode.replaceChild(newEl, renderEl);
    activeMode = mode;
    switch (mode) {
        case 'WINDOW':
            windowLevelMode();
            break;
        case 'ZOOMPAN':
            zoomPanMode();
            break;
        default:
            break;
    }
}
setActiveMode('WINDOW');

// Window level mode
function windowLevelMode() {
    document.querySelector('#activeMode').innerHTML = 'Window Mode : Drag to adjust window level.';

    // Add event handlers to mouse move to adjust window/center
    renderEl.addEventListener('mousedown', function (e) {
        console.log('WINDOW')
        let lastX = e.pageX;
        let lastY = e.pageY;

        function mouseMoveHandler(e) {
            const deltaX = e.pageX - lastX;
            const deltaY = e.pageY - lastY;
            lastX = e.pageX;
            lastY = e.pageY;
            let viewport = cornerstone.getViewport(renderEl);
            viewport.voi.windowWidth += (deltaX / viewport.scale);
            viewport.voi.windowCenter += (deltaY / viewport.scale);
            cornerstone.setViewport(renderEl, viewport);
        };

        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
}

// Zoom and pan mode
function zoomPanMode() {
    document.querySelector('#activeMode').innerHTML = 'Zoom & Pan Mode : Pan by dragging and zoom using mouse wheel.';

    // Add event handlers to pan image on mouse move
    renderEl.addEventListener('mousedown', function (e) {
        console.log('PAN')
        let lastX = e.pageX;
        let lastY = e.pageY;

        function mouseMoveHandler(e) {
            const deltaX = e.pageX - lastX;
            const deltaY = e.pageY - lastY;
            lastX = e.pageX;
            lastY = e.pageY;

            const viewport = cornerstone.getViewport(renderEl);
            viewport.translation.x += (deltaX / viewport.scale);
            viewport.translation.y += (deltaY / viewport.scale);
            cornerstone.setViewport(renderEl, viewport);
        }

        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    // Mouse wheel events
    const mouseWheelEvents = ['mousewheel', 'DOMMouseScroll'];
    mouseWheelEvents.forEach(function (eventType) {
        renderEl.addEventListener(eventType, function (e) {
            console.log('ZOOM')
            // Firefox e.detail > 0 scroll back, < 0 scroll forward
            // chrome/safari e.wheelDelta < 0 scroll back, > 0 scroll forward
            let viewport = cornerstone.getViewport(renderEl);
            if (e.wheelDelta < 0 || e.detail > 0) {
                viewport.scale -= 0.25;
            } else {
                viewport.scale += 0.25;
            }

            cornerstone.setViewport(renderEl, viewport);

            // Prevent page from scrolling
            return false;
        });
    });
}

// Invert image
function invert() {
    console.log('kkk')
    let viewport = cornerstone.getViewport(renderEl);
    viewport.invert = !viewport.invert;
    cornerstone.setViewport(renderEl, viewport);
}

// Flip horizontally
function hFlip() {
    console.log('kkk')
    let viewport = cornerstone.getViewport(renderEl);
    viewport.hflip = !viewport.hflip;
    cornerstone.setViewport(renderEl, viewport);
}

// Flip vertically
function vFlip() {
    console.log('kkk')
    let viewport = cornerstone.getViewport(renderEl);
    viewport.vflip = !viewport.vflip;
    cornerstone.setViewport(renderEl, viewport);
}

// Rotate left
function rotateLeft() {
    console.log('kkk')
    let viewport = cornerstone.getViewport(renderEl);
    viewport.rotation-=90;
    cornerstone.setViewport(renderEl, viewport);
}

// Rotate right
function rotateRight() {
    console.log('kkk')
    let viewport = cornerstone.getViewport(renderEl);
    viewport.rotation+=90;
    cornerstone.setViewport(renderEl, viewport);
}

// Reset
function reset() {
    cornerstone.reset(renderEl);
}
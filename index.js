// Register image loader 
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.configure({
    beforeSend: function (xhr) {
        // Add custom headers here (e.g. auth tokens)
        // xhr.setRequestHeader('APIKEY', 'my auth token');
    }
});

// Dataset meta 
let seriesMeta = [
    {
        series : '1',
        imageCount : 1
    },
    {
        series : '2',
        imageCount : 107
    },
    {
        series : '3',
        imageCount : 1
    },
]
let selectedSeries = {};

// Reference template for series selection
var template = document.querySelector("template");

// Iterate over series and create buttons 
seriesMeta.forEach((series, index) => {
    // Create a clone of the template 
    var clone = template.content.cloneNode(true);
    // Inner text 
    clone.querySelector("span").textContent = 'Series-' + series.series + ' (Images : ' + series.imageCount + ')';
    // Click handler 
    clone.querySelector("span").addEventListener('click', (e) => {
        onSeriesSelect(index)
    });
    // Append to grid 
    document.querySelector("#seriesSelection").appendChild(clone)
})

// List of image ids 
let imageIds = [];
let currentImageIndex = 0;

// Enable HTML element 
const renderEl = document.querySelector('#renderEl');
cornerstone.enable(renderEl);

// On selecting a series
function onSeriesSelect(index) {    
    // Update the selected series 
    selectedSeries = seriesMeta[index]
    
    // Generate image ids 
    imageIds = Array.from({ length: selectedSeries.imageCount }).map(
        (el, index) => 'wadouri:https://wukong-project.github.io/dicom-viewer/data/case-1/series-' + selectedSeries.series + '/IM' + String(index+1).padStart(6, '0')
    );
    
    // Reset index 
    currentImageIndex = 0;

    function updateTheImage(imageIndex, reset) {
        document.querySelector('#coords').textContent = "Loading...";
        return cornerstone.loadAndCacheImage(imageIds[imageIndex]).then(function (image) {
            console.log(imageIds[imageIndex])
            const viewport = cornerstone.getViewport(renderEl);
            cornerstone.displayImage(renderEl, image, viewport);
            document.querySelector('#coords').textContent = "Series-" + selectedSeries.series + " | pageX=0, pageY=0, pixelX=0, pixelY=0";
            if(reset) {
                cornerstone.reset(renderEl);
            }
        });
    }
    
    // Load image
    const imagePromise = updateTheImage(currentImageIndex, true);
    
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
                    if(currentImageIndex<imageIds.length-1) {
                        currentImageIndex++;
                        updateTheImage(currentImageIndex, false);
                    }
                } else {
                    if(currentImageIndex>0) {
                        currentImageIndex--;
                        updateTheImage(currentImageIndex, false);
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
            document.querySelector('#coords').textContent = "Series-" + selectedSeries.series + " | pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y;
        });
    });
}

// Select the first series by default 
onSeriesSelect(0);

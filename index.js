let drawMode = '2d'
// note that pixelBuffer is the data field of imageData: both variables are used
// in concert
let { canvas, ctx, imageData, pixelBuffer } = setup()

function setup() {
    let body = document.getElementsByTagName('body')[0]
    let canvas = document.createElement('canvas')
    canvas.id = 'canvas'

    // setup canvas initial size and resizing
    function onWindowResize() {
        let [width, height] = [window.innerWidth, window.innerHeight]
        canvas.width = width
        canvas.height = height
    }
    window.addEventListener('resize', onWindowResize)
    onWindowResize()
    body.append(canvas)

    // setup canvas graphics; we'll be using the imageData technique to draw
    // single pixels
    let ctx = canvas.getContext(drawMode)
    let imageData = ctx.createImageData(1, 1)
    let pixelBuffer = imageData.data
    pixelBuffer[3] = 255 // always full opacity

    return { canvas, ctx, imageData, pixelBuffer }
}

// only works in drawMode 2d
function putPixel(x, y, color) {
    // translate origin to center, and reverse y direction
    let sx = canvas.width / 2 + x
    let sy = canvas.height / 2 - y

    let [r, g, b] = color

    pixelBuffer[0] = r
    pixelBuffer[1] = g
    pixelBuffer[2] = b
    ctx.putImageData(imageData, sx, sy)
}

let color = [0, 0, 255]
putPixel(0, 0, color)
putPixel(0, 1, color)
putPixel(1, 1, color)
putPixel(1, 0, color)

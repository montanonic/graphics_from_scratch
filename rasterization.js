/**
 * The graphics rendering itself happens with 2d canvas. WebGL would require
 * significant restructuring.
 *
 * I've decided to use snake_case here because it's more readable to me. I can't
 * believe how long I've conceded to JS's camelCase: no more!
 */

const settings = {
    canvas_width: 500,
    canvas_height: 500,
    background_color: [255, 255, 255]
}

const { image_data, update_canvas } = setup()

function setup() {
    let body = document.getElementsByTagName('body')[0]
    let canvas = document.createElement('canvas')
    body.append(canvas)
    canvas.id = 'canvas'
    canvas.width = settings.canvas_width
    canvas.height = settings.canvas_height

    // setup canvas graphics; we'll be using the imageData technique to draw
    // single pixels
    let ctx = canvas.getContext('2d')
    let image_data = ctx.createImageData(settings.canvas_width, settings.canvas_height)
    let [r, g, b] = settings.background_color
    for (let i = 0; i < image_data.data.length; i += 4) {
        image_data.data[i] = r
        image_data.data[i + 1] = g
        image_data.data[i + 2] = b
        image_data.data[i + 3] = 255 // fully opaque
    }
    ctx.putImageData(image_data, 0, 0)

    // does a full repaint
    function update_canvas() {
        ctx.putImageData(image_data, 0, 0)
    }

    return { image_data, update_canvas }
}

function put_pixel(x, y, color) {
    // we *need* integers when rendering to the canvas, so
    x = Math.round(x)
    y = Math.round(y)

    // translate origin to center, and reverse y direction
    let sx = settings.canvas_width / 2 + x
    let sy = settings.canvas_height / 2 - y

    let [r, g, b] = color
    // every 4 positions in the array correspond to 1 pixel, so for the x value
    // we need to multiply by 4, and then for the y value we need to skip y rows
    // of data, so to do that we multiply by row length and entries per pixel,
    // which is canvas width * 4
    let offset = sx * 4 + (sy * 4 * canvas.width)
    image_data.data[offset] = r
    image_data.data[offset + 1] = g
    image_data.data[offset + 2] = b
    // image_data[offset+3], skip as alpha should already be 255
}

function interpolate(x0, y0, x1, y1) {
    values = []
    let slope = (y1 - y0) / (x1 - x0)
    le
}

// because this is a function y of x, for lines that are more and more vertical
// we're computing fewer and fewer values of y. We also can't even render
// straight lines
function naive_draw_line(p0, p1, color) {
    let { x: x0, y: y0 } = p0
    let { x: x1, y: y1 } = p1
    let slope = (y1 - y0) / (x1 - x0)
    let y = x => y0 + (x - x0) * slope
    let [start, end] = [Math.min(p0.x, p1.x), Math.max(p0.x, p1.x)]
    for (let x = start; x <= end; x++) {
        put_pixel(x, y(x), color)
    }
}

// Since every increase in x simply an increase by amount of slope, we need only
// increment x by the slope per iteration rather than computing the function
// each time
function fast_draw_line(p0, p1, color) {
    let { x: x0, y: y0 } = p0
    let { x: x1, y: y1 } = p1
    let slope = (y1 - y0) / (x1 - x0)
    let [start, end] = [Math.min(p0.x, p1.x), Math.max(p0.x, p1.x)]
    // y is no longer a function of x but an initial value
    let y = y0 + (start - x0) * slope
    for (let x = start; x <= end; x++) {
        put_pixel(x, y, color)
        y += slope
    }
}

fast_draw_line({ x: -30, y: 1 }, { x: 100, y: 90 }, [0, 0, 0])
update_canvas()
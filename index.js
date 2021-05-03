let BACKGROUND_COLOR = [255, 255, 255] // white
let drawMode = '2d'
// note that pixelBuffer is the data field of imageData: both variables are used
// in concert
let { canvas, ctx, imageData } = setup()

main()
updateCanvas()

function setup() {
    let body = document.getElementsByTagName('body')[0]
    let canvas = document.createElement('canvas')
    body.append(canvas)
    canvas.id = 'canvas'
    canvas.width = 500
    canvas.height = 500

    // setup canvas initial size
    // function onWindowResize() {
    //     let [width, height] = [window.innerWidth, window.innerHeight + 5]
    //     canvas.width = width
    //     canvas.height = height
    // }
    // // don't actually trigger on resize yet as it clears canvas
    // // window.addEventListener('resize', onWindowResize)
    // onWindowResize()

    // setup canvas graphics; we'll be using the imageData technique to draw
    // single pixels
    let ctx = canvas.getContext(drawMode)
    let imageData = ctx.createImageData(canvas.width, canvas.height)
    let [r, g, b] = BACKGROUND_COLOR
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = r
        imageData.data[i + 1] = g
        imageData.data[i + 2] = b
        imageData.data[i + 3] = 255 // fully opaque
    }
    ctx.putImageData(imageData, 0, 0)

    return { canvas, ctx, imageData }
}

// only works in drawMode 2d, does NOT redraw canvas
function putPixel(x, y, color) {
    // translate origin to center, and reverse y direction
    let sx = canvas.width / 2 + x
    let sy = canvas.height / 2 - y

    let [r, g, b] = color
    // every 4 positions in the array correspond to 1 pixel, so for the x value
    // we need to multiply by 4, and then for the y value we need to skip y rows
    // of data, so to do that we multiply by row length and entries per pixel,
    // which is canvas width * 4
    let offset = sx * 4 + (sy * 4 * canvas.width)
    imageData.data[offset] = r
    imageData.data[offset + 1] = g
    imageData.data[offset + 2] = b
    // imageData[offset+3], skip as alpha should already be 255
}

// does a full repaint
function updateCanvas() {
    ctx.putImageData(imageData, 0, 0)
}

function firstExperiment() {
    let color = [255, 0, 0]
    putPixel(0, 0, color)
    putPixel(0, 1, color)
    putPixel(1, 1, color)
    putPixel(1, 0, color)

    for (let i = -canvas.width / 2; i < canvas.width / 2; i++) {
        for (let j = -canvas.height / 2; j < canvas.height / 2; j++) {
            color[0] = (j - i) % 256
            color[1] = (i + j) % 256
            color[2] = (i - j) % 256
            putPixel(i, j, color)
        }
    }
}

// takes a coordinate pair and viewport data and returns an {x, y, z} coordinate
// pair corresponding to the 3d location on the viewport (z is always a fixed
// distance away, as our viewport is a 2d plane embedded in 3d space)
function canvasPixelToViewportPixel(canvasCoord, viewport) {
    let viewportX = canvasCoord.x * (viewport.width / canvas.width)
    let viewportY = canvasCoord.y * (viewport.height / canvas.height)
    return { x: viewportX, y: viewportY, z: viewport.distance }
}

// works with 2d or 3d vectors
function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + (v1.z || 0) * (v2.z || 0)
}

// sphere distance vector, will always have magnitude = radius of the sphere,
// and will point *from* the center of the sphere out to its surface point.
function sphereDistance(surfacePoint, center) {
    vectSub(surfacePoint, center)
}

// v1 - v2
function vectSub({ x, y, z }, { x: x2, y: y2, z: z2 }) {
    return { x: x - x2, y: y - y2, z: z - z2 }
}

// v1 + v2
function vectAdd({ x, y, z }, { x: x2, y: y2, z: z2 }) {
    return { x: x + x2, y: y + y2, z: z + z2 }
}

// makes a vect
function vect(x, y, z) {
    return { x, y, z: z || 0 }
}

/**
 * The viewport exists at some distance from our camera, and is intended to be a
 * plane upon which we visually regard its 3d backdrop as perfectly 2d.
 *
 * To determine the color, we "fire" a ray from the canvas pixel (which
 * represents our camera view) towards the corresponding viewport pixel,
 * grabbing the color of the first object we hit as it travels out into space.
 *
 */

// for all the glory of raytracing this just returs a color at the end of the day
function traceRay({ origin, distanceToViewport, tMin, tMax, scene }) {
    let closestT = Number.POSITIVE_INFINITY
    let closestSphere = null
    for (let sphere of scene.spheres) {
        let [t1, t2] = intersectRaySphere({ origin, distance: distanceToViewport, sphere })
        if (t1 >= tMin && t1 <= tMax && t1 < closestT) {
            closestT = t1
            closestSphere = sphere
        }
        // t2 is further out than t1 and so this code will not run right?? little confused
        if (t2 < closestT && t2 >= tMin && t2 <= tMax) {
            closestT = t2
            closestSphere = sphere
        }
    }

    if (closestSphere === null) {
        return BACKGROUND_COLOR // we still need *some* color to draw the pixel as when not intersecting
    } else {
        return closestSphere.color
    }
}

// this function just returns values of t for which the ray P = O + t(V - O)
// intersects a sphere, returning [infinity, infinity] if it fails to intersect anywhere.  
// distance is vect from origin to viewport
function intersectRaySphere({ origin, distance, sphere }) {
    let r = sphere.radius
    let CO = vectSub(origin, sphere.center) // vector from sphere center to origin

    let a = dotProduct(distance, distance)
    let b = 2 * dotProduct(CO, distance)
    let c = dotProduct(CO, CO) - r * r

    // console.log(a, b, c);

    let discriminant = b * b - 4 * a * c
    if (discriminant < 0) {
        // console.log("no intersection");
        // no intersection
        return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    }

    let t1 = (-b + Math.sqrt(discriminant)) / (2 * a)
    let t2 = (-b - Math.sqrt(discriminant)) / (2 * a)
    // console.log([t1, t2])
    return [t1, t2]
}

function main() {
    let scene = {
        spheres: [
            { center: vect(0, -1, 3), radius: 1, color: [255, 0, 0] },
            { center: vect(2, 0, 4), radius: 1, color: [0, 0, 255] },
            { center: vect(-2, 0, 4), radius: 1, color: [0, 255, 0] },
        ]
    }

    let O = vect(0, 0, 0)
    let viewport = { width: 1, height: 1, distance: 1 }
    for (let x = -canvas.width / 2; x <= canvas.width / 2; x++) {
        for (let y = -canvas.height / 2; y <= canvas.height / 2; y++) {
            let D = canvasPixelToViewportPixel({ x, y }, viewport)
            // console.log('D', D);
            let color = traceRay({
                origin: O, distanceToViewport: D,
                tMin: viewport.distance, tMax: Number.POSITIVE_INFINITY,
                scene,
            })
            putPixel(x, y, color)
        }
    }
}
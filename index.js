let BACKGROUND_COLOR = [90, 90, 90]
let drawMode = '2d'
// note that pixelBuffer is the data field of imageData: both variables are used
// in concert
let { canvas, ctx, imageData } = setup()
let currentKeys = new Set()
let selectedSphere // updated with the currently selected sphere
let O = vect(0, 0, 0)
let scene = {
    spheres: [
        {
            center: vect(0, -1, 5), radius: 1, color: [255, 0, 0],
            specular: 500, // Shiny
            reflective: 0.4,
        },
        {
            center: vect(2, 0, 5), radius: 1, color: [0, 0, 255],
            specular: 500, // Shiny
            reflective: 0.3, // a bit more
        },
        {
            center: vect(-2, 0, 5), radius: 1, color: [0, 255, 0],
            specular: 10, // Somewhat shiny
            reflective: 0.4, // even more
        },
        {
            center: vect(-.4, 2, 10), radius: 3, color: [140, 20, 140],
            specular: 1000, // Very shiny
            reflective: 0.5, // half reflective
        },
        // for the point light
        // {
        //     center: vect(2, 1, 0), radius: 0.1, color: [0, 0, 0]
        // }
    ],
    lights: [
        { type: 'ambient', intensity: 0.2 },
        { type: 'point', intensity: 0.2, position: vect(2, 2, 0) },
        { type: 'directional', intensity: 0.6, direction: vect(-2, -1, 0) }
    ]
}

const goodScene = "{\"spheres\":[{\"center\":{\"x\":2.39075,\"y\":-1.5862500000000002,\"z\":5},\"radius\":1,\"color\":[255,0,0],\"specular\":500,\"reflective\":0.4},{\"center\":{\"x\":-0.03500000000000014,\"y\":1.8150000000000002,\"z\":5.1},\"radius\":1,\"color\":[0,0,255],\"specular\":500,\"reflective\":0.3},{\"center\":{\"x\":-0.70275,\"y\":-0.27799999999999997,\"z\":5},\"radius\":1,\"color\":[0,255,0],\"specular\":10,\"reflective\":0.4},{\"center\":{\"x\":4.057000000000002,\"y\":1.8119999999999992,\"z\":8.600000000000005},\"radius\":3,\"color\":[140,20,140],\"specular\":1000,\"reflective\":0.5}],\"lights\":[{\"type\":\"ambient\",\"intensity\":0.2},{\"type\":\"point\",\"intensity\":0.2,\"position\":{\"x\":2,\"y\":2,\"z\":0}},{\"type\":\"directional\",\"intensity\":0.6,\"direction\":{\"x\":-2,\"y\":-1,\"z\":0}}]}"
const goodScene2 = "{\"spheres\":[{\"center\":{\"x\":1.0907499999999999,\"y\":-1.36525,\"z\":2.8000000000000025},\"radius\":1,\"color\":[255,0,0],\"specular\":500,\"reflective\":0.4},{\"center\":{\"x\":-0.03500000000000014,\"y\":1.8150000000000002,\"z\":5.1},\"radius\":1,\"color\":[0,0,255],\"specular\":500,\"reflective\":0.3},{\"center\":{\"x\":-1.07975,\"y\":-0.17399999999999985,\"z\":10.69999999999998},\"radius\":1,\"color\":[0,255,0],\"specular\":10,\"reflective\":0.4},{\"center\":{\"x\":3.329000000000002,\"y\":0.8109999999999988,\"z\":8.600000000000005},\"radius\":3,\"color\":[140,20,140],\"specular\":1000,\"reflective\":0.5}],\"lights\":[{\"type\":\"ambient\",\"intensity\":0.2},{\"type\":\"point\",\"intensity\":0.4,\"position\":{\"x\":4,\"y\":0,\"z\":0}},{\"type\":\"directional\",\"intensity\":0.6,\"direction\":{\"x\":-2,\"y\":-1,\"z\":0}}]}"
const pointLightScene = "{\"spheres\":[{\"center\":{\"x\":2.359749999999997,\"y\":-0.8037500000000009,\"z\":2.9000000000000026},\"radius\":1,\"color\":[255,150,0],\"specular\":500,\"reflective\":0.4},{\"center\":{\"x\":2.225249999999999,\"y\":1.547250000000001,\"z\":2.0000000000000018},\"radius\":1,\"color\":[0,150,255],\"specular\":500,\"reflective\":0.3},{\"center\":{\"x\":0.009250000000000647,\"y\":1.275499999999999,\"z\":-1.3999999999999992},\"radius\":1,\"color\":[0,105,0],\"specular\":10,\"reflective\":0.4},{\"center\":{\"x\":2.0465000000000044,\"y\":1.9639999999999989,\"z\":8.800000000000004},\"radius\":3,\"color\":[140,20,140],\"specular\":1000,\"reflective\":0.5}],\"lights\":[{\"type\":\"ambient\",\"intensity\":0},{\"type\":\"point\",\"intensity\":1,\"position\":{\"x\":2,\"y\":2,\"z\":0}},{\"type\":\"directional\",\"intensity\":0,\"direction\":{\"x\":-2,\"y\":-1,\"z\":0}}]}"

let tick = () => {
    // console.log('fps:', 1000 / deltaTime());

    scene.spheres[0].color[1] = oscillateColor(scene.spheres[0].color[1], 3, "one")
    scene.spheres[1].color[1] = oscillateColor(scene.spheres[1].color[1], 3, "two")
    scene.spheres[2].color[1] = oscillateColor(scene.spheres[2].color[1], 3, "three")

    // scene.spheres[0].color[1] = (scene.spheres[0].color[1] + 3) % 256
    // scene.spheres[1].color[1] = (scene.spheres[1].color[1] + 3) % 256
    // scene.spheres[2].color[1] = (scene.spheres[2].color[1] + 3) % 256

    moveOrigin()
    main({ origin: O, scene, lighting: true })
    updateCanvas()
    requestAnimationFrame(tick);
}
tick()

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

function deltaTime() {
    window.startTime = window.startTime || new Date().getTime();

    let end = new Date().getTime();
    let time = end - window.startTime;
    window.startTime = end

    return time
}

function oscillateColor(startColor, rate, id) {
    window.colors = window.colors || {}
    window.colors[id] = window.colors[id] || { color: startColor, up: true }
    let color = window.colors[id].color
    let up = window.colors[id].up
    if (color >= 255 && up) {
        window.colors[id].up = false
        window.colors[id].color = 255 - rate
    } else if (color <= 0 && !up) {
        window.colors[id].up = true
        window.colors[id].color = 0 + rate
    } else if (up) {
        window.colors[id].color += rate
    } else {
        // down
        window.colors[id].color -= rate
    }
    return window.colors[id].color
}

window.addEventListener('keydown', e => currentKeys.add(e.key))
window.addEventListener('keyup', e => currentKeys.delete(e.key))

window.addEventListener('keypress', e => {
    if (selectedSphere) {
        if (e.key == 'h') {
            selectedSphere.center.z += 0.1
            initialCenter.z += 0.1
        } else if (e.key == 'g') {
            selectedSphere.center.z -= 0.1
            initialCenter.z -= 0.1
        }
    }
})

function moveOrigin() {
    let inc = 0.1
    currentKeys.forEach(k => {
        if (k == 'w') {
            O.z += inc
        } else if (k == 's') {
            O.z -= inc
        } else if (k == 'd') {
            O.x += inc
        } else if (k == 'a') {
            O.x -= inc
        } else if (k == 'e') {
            O.y += inc
        } else if (k == 'q') {
            O.y -= inc
        }
    })
}

document.getElementsByTagName('canvas')[0].addEventListener('mousedown', e => {
    let { x, y } = e
    x = x - canvas.width / 2
    y = canvas.height / 2 - y
    let viewport = { width: 1, height: 1, distance: 1 }
    let D = canvasPixelToViewportPixel({ x, y }, viewport)
    let sphere = traceRay({
        origin: O, distanceToViewport: D,
        tMin: viewport.distance, tMax: Number.POSITIVE_INFINITY,
        scene, returnSphere: true
    })

    selectedSphere = sphere

    initialMouse = vect(e.x, -e.y)
    initialCenter = sphere?.center
})

// initialize variables that we'll use in movement controls for spheres. reset
// them to empty states when a sphere is released
var initialMouse = vect(0, 0, 0)
var initialCenter = null
document.getElementsByTagName('canvas')[0].addEventListener('mouseup', e => {
    selectedSphere = null
    initialCenter = null
    initialMouse = vect(0, 0, 0)
})

document.getElementsByTagName('canvas')[0].addEventListener('mousemove', e => {
    if (selectedSphere) {
        let dist = vectSub(vect(e.x, -e.y, 0), initialMouse)
        selectedSphere.center = vectAdd(vectScale((2 - O.z) / 400, dist), initialCenter)
    }
})

// only works in drawMode 2d, does NOT redraw canvas
function putPixel(x, y, color) {
    // translate origin to center, and reverse y direction
    let sx = canvas.width / 2 + x - 1
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
function traceRay({ origin, distanceToViewport, tMin, tMax, scene, recursionDepth = 4, lighting = false, returnSphere = false }) {
    let [closestSphere, closestT] = closestIntersection({ origin, distanceToViewport, tMin, tMax })

    if (returnSphere) {
        return closestSphere
    }

    if (closestSphere === null) {
        return BACKGROUND_COLOR // we still need *some* color to draw the pixel as when not intersecting
    } else {
        if (lighting) {
            // P = O + tD; now that we have our t, we can get the specific point vector
            let P = vectAdd(origin, vectScale(closestT, distanceToViewport))
            // the normal to the sphere at that point
            let N = sphereNormal({ point: P, sphere: closestSphere })
            let intensityAtPoint = computeLighting({
                point: P, normal: N, scene,
                specularExponent: closestSphere.specular,
                vecToCamera: vectScale(-1, distanceToViewport)
            })

            let localColor = scaleColor(intensityAtPoint, closestSphere.color)

            // Compute reflection
            let r = closestSphere.reflective
            // Exit early for nonreflective spheres or when we run out of recursion
            if (r == null || r <= 0 || recursionDepth <= 0) {
                return localColor
            }

            // moves away from the sphere towards a surface that it will reflect (possibly recursively)
            let reflectedVector = reflectRay({ ray: vectScale(-1, distanceToViewport), normal: N })
            let reflectedColor = traceRay({
                origin: P, distanceToViewport: reflectedVector, tMin: 0.001, tMax, scene,
                recursionDepth: recursionDepth - 1, lighting, returnSphere
            })

            // the reflected color will be a proportional mix of the
            // reflectivity. at reflectivity of 1, the reflection will be
            // perfect, and no amount of color of the original surface will be
            // visible
            return addColors(scaleColor(1 - r, localColor), scaleColor(r, reflectedColor))
        } else {
            return closestSphere.color
        }
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

    let discriminant = b * b - 4 * a * c
    if (discriminant < 0) {
        // no intersection
        return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    }

    let t1 = (-b - Math.sqrt(discriminant)) / (2 * a)
    let t2 = (-b + Math.sqrt(discriminant)) / (2 * a)
    return [t1, t2]
}

function main({ origin, scene, lighting = false }) {
    let O = origin
    let viewport = { width: 1, height: 1, distance: 1 }
    for (let x = -canvas.width / 2; x <= canvas.width / 2; x++) {
        for (let y = -canvas.height / 2; y <= canvas.height / 2; y++) {
            let D = canvasPixelToViewportPixel({ x, y }, viewport)
            let color = traceRay({
                origin: O, distanceToViewport: D,
                tMin: viewport.distance, tMax: Number.POSITIVE_INFINITY,
                scene, lighting
            })
            putPixel(x, y, color)
        }
    }
}

function vectLength({ x, y, z }) {
    return Math.sqrt((x * x) + (y * y) + (z * z))
}

function vectNorm(vect) {
    let { x, y, z } = vect
    let len = vectLength(vect)
    return { x: x / len, y: y / len, z: z / len }
}

function vectScale(scalar, { x, y, z }) {
    return { x: x * scalar, y: y * scalar, z: z * scalar }
}

function vectSetMag(vect, mag) {
    return vectScale(mag, vectNorm(vect))
}

function vectMag(vect) {
    return Math.sqrt(dotProduct(vect, vect))
}

// hashes rgb colors
function hashColor([r, g, b]) {
    return r + g * 256 + b * 256 * 256
}

// autoclamps values to stay within range
function scaleColor(scalar, [r, g, b]) {
    return [Math.min(scalar * r, 255), Math.min(scalar * g, 255), Math.min(scalar * b, 255)]
}

function addColors([a, b, c], [x, y, z]) {
    return [a + x, b + y, c + z]
}

/**
 * LIGHT + SHADOWS
 */

function computeLighting({ point, normal, scene, vecToCamera, specularExponent }) {
    let intensity = 0.0
    let lightVec
    for (let light of scene.lights) {
        if (light.type == 'ambient') {
            // just gives everything a minimum brightness
            intensity += light.intensity
        } else if (light.type == 'point') {
            // illuminates from a points
            lightVec = vectSub(light.position, point)
        } else if (light.type == 'directional') {
            // illuminates everything from a direction at equal intensity
            lightVec = light.direction // same direction everywhere (like the sun outside)
        }

        if (lightVec) {
            // Shadow check
            let [shadowSphere, shadowT] = closestIntersection({
                origin: point, distanceToViewport: lightVec,
                // we use a small but non-zero tMin to avoid surface points
                // intersecting with themselves, leading to self-shadowing
                tMin: 0.001, tMax: Number.POSITIVE_INFINITY
            })
            if (shadowSphere !== null) {
                continue // skip this light source
            }

            // Diffuse
            let normalDotLight = dotProduct(normal, lightVec)
            if (normalDotLight > 0) {
                // we omit the normal from the equation here because it's vectMag is always 1
                intensity += light.intensity * (normalDotLight / vectMag(lightVec))
            }

            // Specular
            if (specularExponent >= 0) {
                let reflectionVector = reflectRay({ ray: lightVec, normal })
                let reflection_dot_vecToCamera = dotProduct(reflectionVector, vecToCamera)
                if (reflection_dot_vecToCamera > 0) {
                    let divisor = vectMag(reflectionVector) * vectMag(vecToCamera)
                    intensity += light.intensity * Math.pow(
                        reflection_dot_vecToCamera / divisor,
                        specularExponent)
                }
            }
        }
    }

    return intensity
}

function reflectRay({ ray, normal }) {
    let normal_dot_light = dotProduct(normal, ray)
    let reflectionVector = vectSub(vectScale(2 * normal_dot_light, normal), ray)
    return reflectionVector
}

function sphereNormal({ point, sphere }) {
    return vectNorm(vectSub(point, sphere.center))
}

function closestIntersection({ origin, distanceToViewport, tMin, tMax }) {
    let closestT = Number.POSITIVE_INFINITY
    let closestSphere = null
    for (let sphere of scene.spheres) {
        let [t1, t2] = intersectRaySphere({ origin, distance: distanceToViewport, sphere })
        if (t1 >= tMin && t1 <= tMax && t1 < closestT) {
            closestT = t1
            closestSphere = sphere
        }
        // t2 is always further out than t1 and so this code will not matter
        // right?? little confused 
        //
        // oh, the answer is that when *inside* a sphere itself these distances
        // change.
        if (t2 < closestT && t2 >= tMin && t2 <= tMax) {
            closestT = t2
            closestSphere = sphere
        }
    }

    return [closestSphere, closestT]
}

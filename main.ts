/**
 * ===============================
 * 
 * Thunder / Lightning FX (BLOCK-SAFE)
 * 
 * 3 NeoPixel Strips on micro:bit
 * 
 * A = Gewitter-Sequenz
 * 
 * B = Sofort AUS (alles schwarz)
 * 
 * Pins: P0, P1, P2
 * 
 * ===============================
 */
function clamp (v: number, lo: number, hi: number) {
    if (v < lo) {
        return lo
    }
    if (v > hi) {
        return hi
    }
    return v
}
// Mehrere Blitz-Events hintereinander
function thunderSequence () {
    if (!(running)) {
        return
    }
    setBrightnessAll(255)
    events = rnd(3, 7)
    for (let index = 0; index < events; index++) {
        if (!(running)) {
            return
        }
        lightningEvent()
        if (!(running)) {
            return
        }
        basic.pause(rnd(BETWEEN_EVENTS_MIN, BETWEEN_EVENTS_MAX))
    }
    // am Ende dunkel, aber running bleibt wie es ist
    strip1.showColor(neopixel.colors(NeoPixelColors.Black))
    strip1.show()
    strip2.showColor(neopixel.colors(NeoPixelColors.Black))
    strip2.show()
    strip3.showColor(neopixel.colors(NeoPixelColors.Black))
    strip3.show()
}
// Blitz-Segment einmal kurz an/aus (abbruchfähig)
function flashSegmentOnceById (id: number, start: number, length: number, brightness: number, onMs: number, offMs: number) {
    if (!(running)) {
        return
    }
    s = getStrip(id)
    s.setBrightness(brightness)
    // Segment AN
    for (let i = 0; i <= length - 1; i++) {
        s.setPixelColor(start + i, neopixel.colors(NeoPixelColors.White))
    }
    s.show()
    basic.pause(onMs)
    if (!(running)) {
        return
    }
    // Segment AUS
    for (let j = 0; j <= length - 1; j++) {
        s.setPixelColor(start + j, neopixel.colors(NeoPixelColors.Black))
    }
    s.show()
    basic.pause(offMs)
}
// -------------------------------
// Controls
// -------------------------------
input.onButtonPressed(Button.A, function () {
    running = true
    thunderSequence()
})
function blackout () {
    running = false
    strip1.showColor(neopixel.colors(NeoPixelColors.Black))
    strip1.show()
    strip2.showColor(neopixel.colors(NeoPixelColors.Black))
    strip2.show()
    strip3.showColor(neopixel.colors(NeoPixelColors.Black))
    strip3.show()
}
// Ein Blitz-Event: zufällige Segmente auf 1–3 Strips, mehrfaches Flashen
// Segment-Start/Len pro Strip vorbereiten
function lightningEvent () {
    let lens: number[] = []
    let starts: number[] = []
    if (!(running)) {
        return
    }
    involvedCount = rnd(1, 3)
    chosen2 = pickStripsCount(involvedCount)
    for (let k = 0; k <= chosen2.length - 1; k++) {
        id = chosen2[k]
        len = rnd(SEG_MIN, SEG_MAX)
        maxStart = getStripLen(id) - len
        if (maxStart < 0) {
            maxStart = 0
        }
        start = rnd(0, maxStart)
        starts.push(start)
        lens.push(len)
    }
    flashes = rnd(FLASH_MIN, FLASH_MAX)
    for (let f = 0; f <= flashes - 1; f++) {
        if (!(running)) {
            return
        }
        let baseB = (f == 0) ? rnd(180, 255) : rnd(80, 220)
onMs = rnd(15, 60)
        offMs = rnd(10, 80)
        doubleFlash = rnd(0, 100) < 35
        // Alle beteiligten Strips blitzen "gleichzeitig" (kurze Pausen pro Strip sind ok)
        for (let l = 0; l <= chosen2.length - 1; l++) {
            flashSegmentOnceById(chosen2[l], starts[l], lens[l], baseB, onMs, offMs)
            if (!(running)) {
                return
            }
        }
        if (doubleFlash) {
            b2 = clamp(baseB + rnd(20, 60), 0, 255)
            on2 = rnd(10, 35)
            off2 = rnd(20, 120)
            for (let m = 0; m <= chosen2.length - 1; m++) {
                flashSegmentOnceById(chosen2[m], starts[m], lens[m], b2, on2, off2)
                if (!(running)) {
                    return
                }
            }
        }
        // Optional: mini Nachglimmen (subtil) -> wirkt wie Licht in Wattewolke
        if (rnd(0, 100) < 30) {
            if (!(running)) {
                return
            }
            glowB = rnd(10, 40)
            setBrightnessAll(glowB)
            // je Strip ein Pixel kurz an
            p1 = rnd(0, strip1.length() - 1)
            p2 = rnd(0, strip2.length() - 1)
            p3 = rnd(0, strip3.length() - 1)
            strip1.setPixelColor(p1, neopixel.colors(NeoPixelColors.White))
            strip1.show()
            strip2.setPixelColor(p2, neopixel.colors(NeoPixelColors.White))
            strip2.show()
            strip3.setPixelColor(p3, neopixel.colors(NeoPixelColors.White))
            strip3.show()
            basic.pause(rnd(40, 120))
            if (!(running)) {
                return
            }
            // setzt running=false -> deshalb danach wieder true setzen:
            blackout()
            running = true
        }
    }
    // sicher dunkel lassen (ohne running abzuschalten)
    strip1.showColor(neopixel.colors(NeoPixelColors.Black))
    strip1.show()
    strip2.showColor(neopixel.colors(NeoPixelColors.Black))
    strip2.show()
    strip3.showColor(neopixel.colors(NeoPixelColors.Black))
    strip3.show()
}
// Wählt 1–3 unterschiedliche Strip-IDs (1..3)
function pickStripsCount (count: number) {
    let chosen: number[] = []
    while (chosen.length < count) {
        cand = rnd(1, 3)
        if (chosen.indexOf(cand) < 0) {
            chosen.push(cand)
        }
    }
    return chosen
}
function setBrightnessAll (b: number) {
    b = clamp(b, 0, 255)
    strip1.setBrightness(b)
    strip2.setBrightness(b)
    strip3.setBrightness(b)
}
input.onButtonPressed(Button.B, function () {
    // sofort schwarz + stop
    blackout()
})
// Kleine Zufallsfunktion (MakeCode-safe)
function rnd (min: number, max: number) {
    return Math.randomRange(min, max)
}
function getStripLen (id: number) {
    if (id == 1) {
        return strip1.length()
    }
    if (id == 2) {
        return strip2.length()
    }
    return strip3.length()
}
function getStrip (id: number) {
    if (id == 1) {
        return strip1
    }
    if (id == 2) {
        return strip2
    }
    return strip3
}
let b = 0
let cand = 0
let p3 = 0
let p2 = 0
let p1 = 0
let glowB = 0
let off2 = 0
let on2 = 0
let b2 = 0
let doubleFlash = false
let offMs = 0
let onMs = 0
let flashes = 0
let start = 0
let maxStart = 0
let len = 0
let id = 0
let chosen2: number[] = []
let involvedCount = 0
let s: neopixel.Strip = null
let events = 0
let running = false
let BETWEEN_EVENTS_MAX = 0
let BETWEEN_EVENTS_MIN = 0
let FLASH_MAX = 0
let FLASH_MIN = 0
let SEG_MAX = 0
let SEG_MIN = 0
let strip3: neopixel.Strip = null
let strip2: neopixel.Strip = null
let strip1: neopixel.Strip = null
strip1 = neopixel.create(DigitalPin.P0, 30, NeoPixelMode.RGB)
strip2 = neopixel.create(DigitalPin.P1, 30, NeoPixelMode.RGB)
strip3 = neopixel.create(DigitalPin.P2, 30, NeoPixelMode.RGB)
// ---- Tuning ----
SEG_MIN = 3
SEG_MAX = 10
FLASH_MIN = 2
FLASH_MAX = 6
BETWEEN_EVENTS_MIN = 80
BETWEEN_EVENTS_MAX = 220

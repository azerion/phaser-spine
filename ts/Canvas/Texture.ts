/**
 * Canvas texture, see:
 * https://github.com/EsotericSoftware/spine-runtimes/blob/master/spine-ts/canvas/src/CanvasTexture.ts
 */
module PhaserSpine {
    export module Canvas {
        export class Texture extends spine.Texture {
            constructor (image: HTMLImageElement) {
                super(image);
            }

            setFilters (minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) { }
            setWraps (uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) { }
            dispose () { }
        }
    }
}
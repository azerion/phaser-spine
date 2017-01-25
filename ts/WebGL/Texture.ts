/**
 * WebGL texture, see:
 * https://github.com/EsotericSoftware/spine-runtimes/blob/master/spine-ts/webgl/src/GLTexture.ts
 */
module PhaserSpine {
    export module WebGL {
        export class Texture extends spine.Texture implements spine.Disposable {
            private gl: WebGLRenderingContext;
            private texture: WebGLTexture;
            private boundUnit = 0;

            constructor (gl: WebGLRenderingContext, image: HTMLImageElement, useMipMaps: boolean = false) {
                super(image);
                this.gl = gl;
                this.texture = gl.createTexture();
                this.update(useMipMaps);
            }

            setFilters (minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) {
                let gl = this.gl;
                this.bind();
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
            }

            setWraps (uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {
                let gl = this.gl;
                this.bind();
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, uWrap);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, vWrap);
            }

            update (useMipMaps: boolean) {
                let gl = this.gl;
                this.bind();
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, useMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (useMipMaps) gl.generateMipmap(gl.TEXTURE_2D);
            }

            bind (unit: number = 0) {
                let gl = this.gl;
                this.boundUnit = unit;
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            }

            unbind () {
                let gl = this.gl;
                gl.activeTexture(gl.TEXTURE0 + this.boundUnit);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            dispose () {
                let gl = this.gl;
                gl.deleteTexture(this.texture);
            }
        }
    }
}
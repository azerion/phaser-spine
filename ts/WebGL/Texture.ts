/**
 * WebGL texture, see:
 * https://github.com/EsotericSoftware/spine-runtimes/blob/master/spine-ts/webgl/src/GLTexture.ts
 */
module PhaserSpine {
    export module WebGL {
        export class Texture extends spine.Texture implements spine.Disposable, spine.Restorable {
            private context: spine.webgl.ManagedWebGLRenderingContext;
            private texture: WebGLTexture = null;
            private boundUnit = 0;
            private useMipMaps = false;

            constructor (context: spine.webgl.ManagedWebGLRenderingContext | WebGLRenderingContext, image: HTMLImageElement, useMipMaps: boolean = false) {
                super(image);
                this.context = context instanceof spine.webgl.ManagedWebGLRenderingContext? context : new spine.webgl.ManagedWebGLRenderingContext(context);
                this.useMipMaps = useMipMaps;
                this.restore();
                this.context.addRestorable(this);
            }

            setFilters (minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) {
                let gl = this.context.gl;
                this.bind();
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
            }

            setWraps (uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {
                let gl = this.context.gl;
                this.bind();
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, uWrap);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, vWrap);
            }

            update (useMipMaps: boolean) {
                let gl = this.context.gl;
                if (!this.texture) {
                    this.texture = this.context.gl.createTexture();
                }
                this.bind();
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, useMipMaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (useMipMaps) gl.generateMipmap(gl.TEXTURE_2D);
            }

            restore () {
                this.texture = null;
                this.update(this.useMipMaps);
            }

            bind (unit: number = 0) {
                let gl = this.context.gl;
                this.boundUnit = unit;
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            }

            unbind () {
                let gl = this.context.gl;
                gl.activeTexture(gl.TEXTURE0 + this.boundUnit);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            dispose () {
                this.context.removeRestorable(this);
                let gl = this.context.gl;
                gl.deleteTexture(this.texture);
            }
        }
    }
}
module PhaserSpine {
    export module WebGL {
        export interface IRenderSession extends PIXI.RenderSession {
            gl: WebGLRenderingContext;
        }
    }
}
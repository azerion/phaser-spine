module PhaserSpine {
    export module WebGL {
        export interface IRenderSession extends PIXI.RenderSession {
            gl: IWebGLRenderingContext;
            resolution: number;

            blendModeManager: PIXI.WebGLBlendModeManager;
            shaderManager: IShaderManager;
            spriteBatch: ISpriteBatch;


            drawCount: number;
        }

        export interface IWebGLRenderingContext extends WebGLRenderingContext {
        	id: number;
        }

        export interface ISpriteBatch extends PIXI.WebGLSpriteBatch {
        	gl: IWebGLRenderingContext;
        }

        export interface IShaderManager extends PIXI.WebGLShaderManager {
        	currentShader: PIXI.PrimitiveShader;
        	_currentId: number;
        }

        export interface IPIXIRectangle extends PIXI.Rectangle {
        	centerX: number;
        	centerY: number;
        }
    }
}
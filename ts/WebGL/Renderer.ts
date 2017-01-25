module PhaserSpine {
    export module WebGL {
        export class Renderer {
            public game: Phaser.Game;

            private shader: spine.webgl.Shader;

            private batcher: spine.webgl.PolygonBatcher;

            private mvp: spine.webgl.Matrix4 = new spine.webgl.Matrix4();

            private skeletonRenderer: spine.webgl.SkeletonRenderer;

            private debugRenderer: spine.webgl.SkeletonDebugRenderer;

            private debugShader: spine.webgl.Shader;

            private shapes: spine.webgl.ShapeRenderer;

            constructor (game: Phaser.Game) {
                this.game = game;

                let gl: WebGLRenderingContext = (<IRenderSession>this.game.renderer.renderSession).gl;

                // Create a simple shader, mesh, model-view-projection matrix and SkeletonRenderer.
                this.shader = spine.webgl.Shader.newColoredTextured(gl);
                this.batcher = new spine.webgl.PolygonBatcher(gl);
                this.mvp.ortho2d(0, 0, this.game.width - 1, this.game.height - 1);
                this.skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
                this.debugRenderer = new spine.webgl.SkeletonDebugRenderer(gl);
                this.debugRenderer.drawRegionAttachments = false;
                this.debugRenderer.drawBoundingBoxes = false;
                this.debugRenderer.drawMeshHull = false;
                this.debugRenderer.drawMeshTriangles = false;
                this.debugRenderer.drawPaths = false;
                this.debugShader = spine.webgl.Shader.newColored(gl);
                this.shapes = new spine.webgl.ShapeRenderer(gl);
            }

            public resize(bounds: PIXI.Rectangle, scale2: Phaser.Point, renderSession: IRenderSession): void {
                var w = this.game.width;
                var h = this.game.height;

                // magic
                var centerX = bounds.x + bounds.width / 2;
                var centerY = bounds.y + bounds.height / 2;
                var scaleX = bounds.width / w;
                var scaleY = bounds.height / h;
                var scale = Math.max(scaleX, scaleY) * 1.2;
                if (scale < 1) scale = 1;
                var width = w * scale;
                var height = h * scale;

                this.mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
                renderSession.gl.viewport(0, 0, w, h);
            }

            public draw(skeleton: spine.Skeleton, renderSession: PIXI.RenderSession) {
                // Bind the shader and set the texture and model-view-projection matrix.
                this.shader.bind();
                this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
                this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

                //Start the batch and tell the SkeletonRenderer to render the active skeleton.
                this.batcher.begin(this.shader);
                this.skeletonRenderer.draw(this.batcher, skeleton);
                this.batcher.end();

                this.shader.unbind();

                // draw debug information
                if (SpinePlugin.DEBUG) {
                    this.debugShader.bind();
                    this.debugShader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);
                    this.debugRenderer.premultipliedAlpha = false;
                    this.shapes.begin(this.debugShader);
                    this.debugRenderer.draw(this.shapes, skeleton);
                    this.shapes.end();
                    this.debugShader.unbind();
                }
            }
        }
    }
}
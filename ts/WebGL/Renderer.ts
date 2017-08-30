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
                this.shader = spine.webgl.Shader.newTwoColoredTextured(gl);
                this.batcher = new spine.webgl.PolygonBatcher(gl);
                this.mvp.ortho2d(0, 0, this.game.width - 1, this.game.height - 1);
                this.skeletonRenderer = new spine.webgl.SkeletonRenderer(<any>gl);

                this.debugRenderer = new spine.webgl.SkeletonDebugRenderer(gl);
                this.debugRenderer.drawRegionAttachments = false;
                this.debugRenderer.drawBoundingBoxes = false;
                this.debugRenderer.drawMeshHull = false;
                this.debugRenderer.drawMeshTriangles = false;
                this.debugRenderer.drawPaths = false;
                this.debugShader = spine.webgl.Shader.newColored(gl);
                this.shapes = new spine.webgl.ShapeRenderer(gl);
            }

            public destroy(): void {
                this.shader.dispose();
                this.batcher.dispose();
                this.debugShader.dispose();
                this.shapes.dispose();

                this.game = null;
                this.shader = null;
                this.debugShader = null;
                this.batcher = null;
                this.shapes = null;
                this.skeletonRenderer = null;
                this.debugRenderer = null;
            }

            public resize(phaserSpine: Spine, renderSession: IRenderSession): void {
                let res = renderSession.resolution;
                let scale = phaserSpine.scale;
                let offset = phaserSpine.offset;
                let anchor = phaserSpine.anchor;
                let position = phaserSpine.position;

                phaserSpine.skeleton.flipX = scale.x < 0;
                phaserSpine.skeleton.flipY = scale.y < 0;

                this.mvp.ortho2d(-400, -300, 800, 600);
            }

            public draw(phaserSpine: Spine, renderSession: IRenderSession) {
                ////////////////////:
                ///        FIX: Save Phaser WebGL Context
                /////////
                renderSession.spriteBatch.end();

                var currentBlendMode = renderSession.blendModeManager.currentBlendMode;
                var currentShader = renderSession.shaderManager.currentShader;

                // Reset glVertexAttribArray
                for (let i = 0; i < renderSession.shaderManager.attribState.length; i++)
                {
                    renderSession.shaderManager.attribState[i] = null;
                    renderSession.gl.disableVertexAttribArray(i);
                }
                ////    ENDFIX: Save Context
                

                
                // Bind the shader and set the texture and model-view-projection matrix.
                this.shader.bind();
                this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
                this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

                //Start the batch and tell the SkeletonRenderer to render the active skeleton.
                this.batcher.begin(this.shader);
                this.skeletonRenderer.premultipliedAlpha = phaserSpine.premultipliedAlpha;
                this.skeletonRenderer.draw(this.batcher, phaserSpine.skeleton);
                this.batcher.end();

                this.shader.unbind();

                // draw debug information
                if (SpinePlugin.DEBUG) {
                    this.debugShader.bind();
                    this.debugShader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);
                    this.debugRenderer.premultipliedAlpha = phaserSpine.premultipliedAlpha;
                    this.shapes.begin(this.debugShader);
                    this.debugRenderer.draw(this.shapes, phaserSpine.skeleton);
                    this.shapes.end();
                    this.debugShader.unbind();
                }


                ////////////////////:
                ///        FIX: Restore Phaser WebGL Context
                /////////
                renderSession.blendModeManager.currentBlendMode = -1;    // Fix
                renderSession.blendModeManager.setBlendMode(currentBlendMode);    // Fix 
                renderSession.gl.enable(renderSession.gl.BLEND);    // Fix

                renderSession.shaderManager._currentId = null;
                renderSession.shaderManager.setShader(currentShader);

                renderSession.spriteBatch.dirty = true;

                // Only for Phaser 2.7.3 - 2.7.7 (inclusive)
                if(["2.7.3", "2.7.4", "2.7.5", "2.7.6", "2.7.7"].indexOf(Phaser.VERSION) > -1){
                    renderSession.spriteBatch.sprites.map(sprite => {
                        if(sprite.texture && sprite.texture.baseTexture){
                            sprite.texture.baseTexture._dirty[renderSession.spriteBatch.gl.id] = true;
                        }
                    });
                }
                ////    ENDFIX: Restore Context
                

                // Let Phaser know we did draw
                renderSession.drawCount++;
            }
        }
    }
}
module PhaserSpine {
        export class Spine extends Phaser.Sprite {
            public skeleton: spine.Skeleton;

            public state: spine.AnimationState;

            private renderer: Canvas.Renderer | WebGL.Renderer;

            constructor(game: Phaser.Game, x: number, y: number, skeleton: spine.Skeleton, bounds: PIXI.Rectangle, state: spine.AnimationState, config?: Config) {
                super(game, x, y, null);
                this.skeleton = skeleton;
                console.log(bounds);
                this.texture.setFrame(bounds);
                this.state = state;

                if (!config) {
                    config = <Config>{
                        debugRendering: false,
                        triangleRendering: true
                    }
                }

                console.log(this.getBounds());
                this.renderer = new PhaserSpine.Canvas.Renderer(this.game);
            }

            public update(): void {
                super.update();

                this.state.update(this.game.time.elapsed / 1000);
                this.state.apply(this.skeleton);
                this.skeleton.updateWorldTransform();
            }

            /**
             * Override from PIXI's
             *
             * @param renderSession
             * @param matrix
             * @private
             */
            public _renderCanvas(renderSession: PIXI.RenderSession, matrix?: PIXI.Matrix): void {
                (<Canvas.Renderer>this.renderer).resize(this.getBounds(), this.scale, renderSession);
                if (SpinePlugin.TRIANGLE) {
                    (<Canvas.Renderer>this.renderer).drawTriangles(this.skeleton, renderSession);
                } else {
                    (<Canvas.Renderer>this.renderer).drawImages(this.skeleton, renderSession);
                }
            }

            public _renderWebGL(renderSession: PIXI.RenderSession, matrix?: PIXI.Matrix): void {

            }
        }
}
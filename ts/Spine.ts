module PhaserSpine {
    export class Spine extends Phaser.Sprite {
        public skeleton: spine.Skeleton;

        public bounds: PIXI.Rectangle;

        public state: spine.AnimationState;

        private renderer: Canvas.Renderer | WebGL.Renderer;

        constructor(game: Phaser.Game, x: number, y: number, skeleton: spine.Skeleton, bounds: PIXI.Rectangle, state: spine.AnimationState, config?: Config) {
            super(game, x, y, null);
            this.skeleton = skeleton;
            this.bounds = bounds;
            this.state = state;

            if (!config) {
                config = <Config>{
                    debugRendering: false,
                    triangleRendering: true
                }
            }

            this.renderer = new PhaserSpine.Canvas.Renderer(this.game);
        }

        public getBounds(targetCoordinateSpace?: PIXI.Matrix | PIXI.DisplayObject): PIXI.Rectangle {
            return this.bounds;
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
            console.log(this.bounds);

            (<Canvas.Renderer>this.renderer).resize(this.bounds, renderSession);
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
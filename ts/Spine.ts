module PhaserSpine {
    export class Spine extends Phaser.Group{
        public skeleton: spine.Skeleton;

        public bounds: Phaser.Rectangle;

        public state: spine.AnimationState;

        private renderer: Canvas.Renderer | WebGL.Renderer;

        constructor(game: Phaser.Game, skeleton: spine.Skeleton, bounds: Phaser.Rectangle, state: spine.AnimationState, config?: Config) {
            super(game);
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

        public update(): void {
            super.update();

            this.state.update(this.game.time.elapsed / 1000);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();
        }

        public _renderCanvas(renderSession: PIXI.RenderSession, matrix?: PIXI.Matrix): void {
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
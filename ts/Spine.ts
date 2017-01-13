module PhaserSpine {
    export class Spine extends Phaser.Group{
        public skeleton: spine.Skeleton;
        public bounds: Phaser.Rectangle;
        public state: spine.AnimationState;

        constructor(game: Phaser.Game, skeleton: spine.Skeleton, bounds: Phaser.Rectangle, state: spine.AnimationState) {
            super(game);
            this.skeleton = skeleton;
            this.bounds = bounds;
            this.state = state;
        }

        public update(): void {
            super.update();
            console.log('updating')
            this.state.update(this.game.time.elapsed / 1000);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();
        }
    }
}
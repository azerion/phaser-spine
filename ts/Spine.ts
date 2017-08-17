module PhaserSpine {
        export class Spine extends Phaser.Sprite {
            public skeleton: spine.Skeleton;

            public state: spine.AnimationState;

            private renderer: Canvas.Renderer | WebGL.Renderer;

            private specialBounds: PIXI.Rectangle;

            constructor(game: Phaser.Game, x: number, y: number, key: string) {
                super(game, x, y, SpinePlugin.SPINE_NAMESPACE + key);

                this.skeleton = this.createSkeleton(key);
                this.skeleton.flipY = (this.game.renderType === Phaser.CANVAS); //In Canvas we always FlipY
                this.skeleton.setToSetupPose(); //Update everything to get correct bounds
                this.skeleton.updateWorldTransform(); //Update everything to get correct bounds

                var size = new spine.Vector2();
                this.skeleton.getBounds(new spine.Vector2(), size);
                this.texture.setFrame(new PIXI.Rectangle(0, 0, size.x, size.y));

                this.skeleton.setToSetupPose();
                this.skeleton.updateWorldTransform();
                var offset = new spine.Vector2();
                var size = new spine.Vector2();
                this.skeleton.getBounds(offset, size);
                this.specialBounds = new PIXI.Rectangle(offset.x, offset.y, size.x, size.y);

                // Create an AnimationState.
                this.state = new spine.AnimationState(new spine.AnimationStateData(this.skeleton.data));

                if (this.game.renderType === Phaser.CANVAS) {
                    this.renderer = new PhaserSpine.Canvas.Renderer(this.game);
                } else {
                    this.renderer = new PhaserSpine.WebGL.Renderer(this.game);
                }
            }

            private createSkeleton(key: string): spine.Skeleton {
                // Load the texture atlas using name.atlas and name.png from the AssetManager.
                // The function passed to TextureAtlas is used to resolve relative paths.
                let atlas: spine.TextureAtlas = new spine.TextureAtlas(this.game.cache.getText(SpinePlugin.SPINE_NAMESPACE + key), (path) => {
                    if (this.game.renderType === Phaser.CANVAS) {
                        return new PhaserSpine.Canvas.Texture(this.game.cache.getImage(SpinePlugin.SPINE_NAMESPACE + key));
                    }

                    return new PhaserSpine.WebGL.Texture(<WebGLRenderingContext>(<any>this.game.renderer).gl, this.game.cache.getImage(SpinePlugin.SPINE_NAMESPACE + key));
                });

                // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
                let atlasLoader: spine.AtlasAttachmentLoader = new spine.AtlasAttachmentLoader(atlas);

                // Create a SkeletonJson instance for parsing the .json file.
                let skeletonJson = new spine.SkeletonJson(atlasLoader);
                // Set the scale to apply during parsing, parse the file, and create a new skeleton.
                let skeletonData = skeletonJson.readSkeletonData(this.game.cache.getJSON(SpinePlugin.SPINE_NAMESPACE + key));

                return new spine.Skeleton(skeletonData);
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
            public _renderCanvas(renderSession: Canvas.IRenderSession, matrix?: PIXI.Matrix): void {
                if (!this.visible || !this.alive) {
                    return;
                }

                (<Canvas.Renderer>this.renderer).resize(this.getBounds(), this.scale, renderSession);
                if (SpinePlugin.TRIANGLE) {
                    (<Canvas.Renderer>this.renderer).drawTriangles(this.skeleton, renderSession);
                } else {
                    (<Canvas.Renderer>this.renderer).drawImages(this.skeleton, renderSession);
                }
            }

            public _renderWebGL(renderSession: WebGL.IRenderSession, matrix?: PIXI.Matrix): void {
                if (!this.visible || !this.alive) {
                    return;
                }

                (<WebGL.Renderer>this.renderer).resize(this.skeleton, <WebGL.IPIXIRectangle>this.getBounds(), this.scale, renderSession);
                (<WebGL.Renderer>this.renderer).draw(this.skeleton, renderSession);
            }
        }
}
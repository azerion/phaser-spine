declare module "phaser-spine" {
    export = PhaserSpine;
}

(<any>Phaser.Rope).prototype.postUpdate = function () {};

module PhaserSpine {
    export class Spine extends Phaser.Sprite {
        public skeleton: spine.Skeleton;

        private stateData: spine.AnimationStateData;

        private state: spine.AnimationState;

        private renderer: Canvas.Renderer | WebGL.Renderer;

        private specialBounds: PIXI.Rectangle;

        private premultipliedAlpha: boolean = false;

        public onEvent: Phaser.Signal;

        public onStart: Phaser.Signal;

        public onInterrupt: Phaser.Signal;

        public onDispose: Phaser.Signal;

        public onComplete: Phaser.Signal;

        public onEnd: Phaser.Signal;

        constructor(game: Phaser.Game, x: number, y: number, key: string, premultipliedAlpha: boolean = false) {
            super(game, x, y, '');

            this.premultipliedAlpha = premultipliedAlpha;

            this.skeleton = this.createSkeleton(key);
            this.skeleton.flipY = (this.game.renderType === Phaser.CANVAS); //In Canvas we always FlipY
            this.skeleton.setToSetupPose(); //Update everything to get correct bounds
            this.skeleton.updateWorldTransform(); //Update everything to get correct bounds

            var size = new spine.Vector2();
            this.skeleton.getBounds(new spine.Vector2(), size, []);
            this.texture.setFrame(new PIXI.Rectangle(0, 0, size.x, size.y));

            this.skeleton.setToSetupPose();
            this.skeleton.updateWorldTransform();
            var offset = new spine.Vector2();
            var size = new spine.Vector2();
            this.skeleton.getBounds(offset, size ,[]);
            this.specialBounds = new PIXI.Rectangle(offset.x, offset.y, size.x, size.y);

            // Create an AnimationState.
            this.stateData = new spine.AnimationStateData(this.skeleton.data);
            this.state = new spine.AnimationState(this.stateData);

            this.onEvent = new Phaser.Signal();
            this.onComplete = new Phaser.Signal();
            this.onEnd = new Phaser.Signal();
            this.onInterrupt = new Phaser.Signal();
            this.onStart = new Phaser.Signal();
            this.onDispose = new Phaser.Signal();

            this.state.addListener({
                interrupt: this.onInterrupt.dispatch.bind(this.onInterrupt),
                dispose: this.onDispose.dispatch.bind(this.onDispose),
                /** Invoked when the current animation triggers an event. */
                event : this.onEvent.dispatch.bind(this.onEvent),
                /** Invoked when the current animation has completed.
                 * @param loopCount The number of times the animation reached the end. */
                complete : this.onComplete.dispatch.bind(this.onComplete),
                /** Invoked just after the current animation is set. */
                start: this.onStart.dispatch.bind(this.onStart),
                /** Invoked just before the current animation is replaced. */
                end: this.onEnd.dispatch.bind(this.onEnd)
            });
            // this.state.onComplete = this.onComplete.dispatch.bind(this.onComplete);
            // this.state.onEnd = this.onEnd.dispatch.bind(this.onEnd);

            if (this.game.renderType === Phaser.CANVAS) {
                this.renderer = new PhaserSpine.Canvas.Renderer(this.game);
            } else {
                this.renderer = new PhaserSpine.WebGL.Renderer(this.game);
            }
        }

        public destroy(destroyChildren: boolean): void {
            super.destroy(destroyChildren);

            if (this.game === null || this.destroyPhase) { return; }

            this.specialBounds = null;

            if (this.renderer) {
                this.renderer.destroy();
                this.renderer = null;
            }

            if (this.onEvent) {
                this.onEvent.dispose();
                this.onEvent = null;

                this.onStart.dispose();
                this.onStart = null;

                this.onInterrupt.dispose();
                this.onInterrupt = null;

                this.onDispose.dispose();
                this.onDispose = null;

                this.onComplete.dispose();
                this.onComplete = null;

                this.onEnd.dispose();
                this.onEnd = null;
            }

            if (this.state) {
                this.state.clearListeners();
                this.state = null;
                this.stateData = null;
            }
        }

        private createSkeleton(key: string): spine.Skeleton {
            // Load the texture atlas using name.atlas and name.png from the AssetManager.
            // The function passed to TextureAtlas is used to resolve relative paths.
            let atlas: spine.TextureAtlas = new spine.TextureAtlas(this.game.cache.getText('atlas_' + SpinePlugin.SPINE_NAMESPACE + '_' + key), (path, minMagFilterStrings) => {
                if (this.game.renderType === Phaser.CANVAS) {
                    return new PhaserSpine.Canvas.Texture(this.game.cache.getImage(path));
                }
                var useMipMaps = minMagFilterStrings.min.toLowerCase().indexOf('mip') !== 0;
                return new PhaserSpine.WebGL.Texture(<WebGLRenderingContext>(<any>this.game.renderer).gl, this.game.cache.getImage(path), useMipMaps);
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

            this.skeleton.color.a = this.worldAlpha;
            this.skeleton.getRootBone().rotation = this.worldRotation * 180 / Math.PI;
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
                (<Canvas.Renderer>this.renderer).drawTriangles(this, renderSession);
            } else {
                (<Canvas.Renderer>this.renderer).drawImages(this, renderSession);
            }
        }

        public _renderWebGL(renderSession: WebGL.IRenderSession, matrix?: PIXI.Matrix): void {
            if (!this.visible || !this.alive) {
                return;
            }

            (<WebGL.Renderer>this.renderer).resize(this, <WebGL.IPIXIRectangle>this.getBounds(), this.scale, renderSession);
            (<WebGL.Renderer>this.renderer).draw(this, renderSession, this.premultipliedAlpha);
        }

        /**
         * [setMixByName wrap to stateData.setMixByName]
         * @param {String} fromName [source animation name]
         * @param {String} toName   [target animation name]
         * @param {Float} duration [Duration in the transition of the animations]
         */
        public setMixByName(fromName: string, toName: string, duration: number): void {
            this.stateData.setMix(fromName, toName, duration);
        };

        /**
         * exposing the state's setAnimation
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {number}  trackIndex
         * @param {string}  animationName
         * @param {boolean} loop
         * @param {number}  delay
         * @returns {any}
         */
        public setAnimationByName(trackIndex: number, animationName: string, loop: boolean = false): spine.TrackEntry {
            // let animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
            // if (!animation) {
            //     console.warn("Animation not found: " + animationName);
            //     return null;
            // }

            return this.state.setAnimation(trackIndex, animationName, loop);
        };

        /**
         * exposing the state's addAnimation
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {number}  trackIndex
         * @param {string}  animationName
         * @param {boolean} loop
         * @param {number}  delay
         * @returns {any}
         */
        public addAnimationByName(trackIndex: number, animationName: string, loop: boolean = false, delay: number = 0): spine.TrackEntry {
            // let animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
            // if (!animation) {
            //     console.warn("Animation not found: " + animationName);
            //     return null;
            // }
            return this.state.addAnimation(trackIndex, animationName, loop, delay);
        };

        /**
         * get the name of the animation currently playing
         *
         * @param {number}  trackIndex
         * @returns {string}
         */
        public getCurrentAnimationForTrack(trackIndex: number): string {
            if (!this.state.tracks[trackIndex] || !this.state.tracks[trackIndex].animation) {
                console.warn("No animation found on track index: ", trackIndex);
                return "";
            }
            return this.state.tracks[trackIndex].animation.name;
        }

        /**
         * Exposing the skeleton's method to change the skin by skinName
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {string}  skinName  The name of the skin we'd like to set
         */
        public setSkinByName(skinName: string): void {
            let skin: spine.Skin = this.skeleton.data.findSkin(skinName);
            if (!skin) {
                console.warn("Skin not found: " + skinName);
                return;
            }
            this.skeleton.setSkin(skin);
        }

        /**
         * Exposing the skeleton's method to change the skin
         *
         * @param skin
         */
        public setSkin(skin: spine.Skin): void {
            this.skeleton.setSkin(skin);
        }

        /**
         * Set to initial setup pose
         */
        public setToSetupPose(): void {
            this.skeleton.setToSetupPose();
        }

        /**
         * You can combine skins here by supplying a name for the new skin, and then a nummer of existing skins names that needed to be combined in the new skin
         * If the skins that will be combined contain any double attachment, only the first attachment will be added to the newskin.
         * any subsequent attachment that is double will not be added!
         *
         * @param newSkinName
         * @param skinNames
         */
        public createCombinedSkin(newSkinName: string, ...skinNames: string[]): spine.Skin {
            if (skinNames.length === 0) {
                console.warn('Unable to combine skins when no skins are passed...');
                return;
            }

            let newSkin: spine.Skin = new spine.Skin(newSkinName);

            for (let i: number = 0; i < skinNames.length; i++) {
                let skinName: string = skinNames[i];
                let skin = this.skeleton.data.findSkin(skinName);
                if (!skin) {
                    console.warn("Skin not found: " + skinName);
                    return;
                }

                for (let key in skin.attachments) {
                    let slotKeyPair = key.split(':');
                    let slotIndex: number = parseInt(slotKeyPair[0]);
                    let attachmentName: string = Object.keys(skin.attachments[key])[0];
                    let attachment: spine.Attachment = skin.attachments[key][attachmentName];

                    if (undefined === slotIndex || undefined === attachmentName) {
                        console.warn('something went wrong with reading the attachments index and/or name');
                        return;
                    }

                    newSkin.addAttachment(slotIndex, attachmentName, attachment);
                }
            }

            this.skeleton.data.skins.push(newSkin);

            return newSkin;
        }
    }
}
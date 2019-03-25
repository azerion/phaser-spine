declare module "phaser-spine" {
    export = PhaserSpine;
}

(<any>Phaser.Rope).prototype.postUpdate = function () {};

spine.Bone.yDown = true;

module PhaserSpine {
    import SpineCacheData = PhaserSpine.SpineCacheData;
    import Skin = spine.Skin;
    export class Spine extends Phaser.Group
    {
        static globalAutoUpdate: boolean = true;

        private skeleton: spine.Skeleton;
        private skeletonData: spine.SkeletonData;
        private stateData: spine.AnimationStateData;
        private state: spine.AnimationState;
        private slotContainers: Phaser.Group[];
        private lastTime: number;
        private imageScale: number = 1;
        private globalTint: number;

        public game: PhaserSpine.SpineGame;
        public onEvent: Phaser.Signal;
        public onComplete: Phaser.Signal;
        public onEnd: Phaser.Signal;

        /**
         * @class Spine
         * @extends Phaser.Group
         * @constructor
         * @param game {Phaser.Game} the game reference to add this object
         * @param key {String} the key to find the assets for this object
         */
        constructor(game: PhaserSpine.SpineGame, key: string, scalingVariant?: string)
        {
            super(game);

            let data: SpineCacheData = this.game.cache.getSpine(key);

            if (undefined !== scalingVariant && data.variants.indexOf(scalingVariant) !== -1) {
                this.imageScale = this.getScaleFromVariant(scalingVariant);
            } else if (data.variants && data.variants.length >= 1) {
                this.imageScale = this.getScaleFromVariant(data.variants[0]);
            }

            let textureLoader = new PhaserSpine.SpineTextureLoader(game);
            // create a spine atlas using the loaded text and a spine texture loader instance //
            let spineAtlas = new spine.Atlas(game.cache.getText(data.atlas), textureLoader);
            // now we use an atlas attachment loader //
            let attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas);
            // spine animation
            let spineJsonParser = new spine.SkeletonJson(attachmentLoader);

            //get the Skeleton Data
            this.skeletonData = spineJsonParser.readSkeletonData(game.cache.getJSON(key));

            if (!this.skeletonData) {
                throw new Error('Spine data must be preloaded using Loader.spine');
            }

            this.onEvent = new Phaser.Signal();
            this.onComplete = new Phaser.Signal();
            this.onEnd = new Phaser.Signal();

            this.skeleton = new spine.Skeleton(this.skeletonData);
            this.skeleton.updateWorldTransform();

            this.stateData = new spine.AnimationStateData(this.skeletonData);
            this.state = new spine.AnimationState(this.stateData);
            this.state.onEvent = this.onEvent.dispatch.bind(this.onEvent);
            this.state.onComplete = this.onComplete.dispatch.bind(this.onComplete);
            this.state.onEnd = this.onEnd.dispatch.bind(this.onEnd);

            this.slotContainers = [];

            for (let i: number = 0, n = this.skeleton.slots.length; i < n; i++) {
                let slot: spine.Slot = this.skeleton.slots[i];
                let attachment: spine.Attachment = slot.attachment;

                let slotContainer = new Phaser.Group(game);
                this.slotContainers.push(slotContainer);
                this.add(slotContainer);

                if (attachment instanceof spine.RegionAttachment) {
                    let spriteName: string = attachment.rendererObject.name;
                    let sprite: Phaser.Sprite = this.createSprite(slot, attachment);
                    slot.currentSprite = sprite;
                    slot.currentSpriteName = spriteName;
                    slotContainer.add(sprite);
                } else if (attachment instanceof spine.WeightedMeshAttachment) {
                    let mesh: Phaser.Rope = this.createMesh(slot, attachment);
                    slot.currentMesh = mesh;
                    slot.currentMeshName = attachment.name;
                    slotContainer.add(mesh);
                } else {
                    continue;
                }
            }

            this.autoUpdate = true;
        }

        get autoUpdate(): boolean {
            return (this.updateTransform === PhaserSpine.Spine.prototype.autoUpdateTransform);
        };

        set autoUpdate(value: boolean) {
            this.updateTransform = value ? PhaserSpine.Spine.prototype.autoUpdateTransform : PIXI.DisplayObjectContainer.prototype.updateTransform;
        };

        private getScaleFromVariant(variant: string): number {
            let scale: RegExpExecArray = SpinePlugin.RESOLUTION_REGEXP.exec(variant);
            if (scale) {
                return parseFloat(<string>scale[1]);
            }
            return 1;
        }

        public setTint (tint: number): void {

            this.globalTint = tint;

            let slots = this.skeleton.slots;
            for(let i = 0; i < slots.length; i++) {

                let slot = slots[i];
                if(slot.currentSprite) slot.currentSprite.tint = tint;

            }
        }   

        /**
         * Update the spine skeleton and its animations by delta time (dt)
         *
         * @method update
         * @param dt {Number} Delta time. Time by which the animation should be updated
         */
        public update(dt?: number): void {
            if (dt === undefined) {
                return;
            }

            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();

            let drawOrder: spine.Slot[] = this.skeleton.drawOrder;
            let slots: spine.Slot[] = this.skeleton.slots;
            for (var i = 0, n = drawOrder.length; i < n; i++) {
                if (drawOrder[i].currentSprite !== undefined) {
                    this.children[i] = drawOrder[i].currentSprite.parent
                }
            }

            for (var i = 0, n = slots.length; i < n; i++) {
                var slot: any = slots[i];
                var attachment: any = slot.attachment;
                var slotContainer: any = this.slotContainers[i];

                if (!attachment) {
                    slotContainer.visible = false;
                    continue;
                }

                var type = attachment.type;

                if (type === spine.AttachmentType.region) {
                    if (attachment.rendererObject) {
                        if (!slot.currentSpriteName || slot.currentSpriteName !== attachment.name) {
                            var spriteName = attachment.rendererObject.name;
                            if (slot.currentSprite !== undefined) {
                                slot.currentSprite.visible = false;
                            }
                            slot.sprites = slot.sprites || {};
                            if (slot.sprites[spriteName] !== undefined) {
                                slot.sprites[spriteName].visible = true;
                            } else {
                                var sprite = this.createSprite(slot, attachment);
                                slotContainer.add(sprite);
                            }

                            slot.currentSprite = slot.sprites[spriteName];
                            slot.currentSpriteName = spriteName;
                        }
                    }

                    var bone: spine.Bone = slot.bone;

                    //Update positions
                    slotContainer.position.x = attachment.x * bone.a + attachment.y * bone.b + bone.worldX;
                    slotContainer.position.y = attachment.x * bone.c + attachment.y * bone.d + bone.worldY;

                    //Update scaling
                    slotContainer.scale.x = bone.getWorldScaleX();
                    slotContainer.scale.y = bone.getWorldScaleY();
                    //Update rotation
                    slotContainer.rotation = (bone.getWorldRotationX() - attachment.rotation) * Math.PI / 180;

                    if (bone.getWorldScaleY() < 0) {
                        slotContainer.scale.y = -slotContainer.scale.y;
                    }
                    if (bone.getWorldScaleX() < 0) {
                        slotContainer.scale.x = -slotContainer.scale.x;

                    }
                    if (bone.getWorldScaleY() < 0 || bone.getWorldScaleX() < 0) {

                       slotContainer.rotation = -slotContainer.rotation;
                    }

                    slot.currentSprite.blendMode = slot.blendMode;
                    if (!this.globalTint) {
                        slot.currentSprite.tint = slot.currentSprite.tint = parseInt(Phaser.Color.componentToHex(255 * slot.r).substring(0, 2) + Phaser.Color.componentToHex(255 * slot.g).substring(0, 2) + Phaser.Color.componentToHex(255 * slot.b).substring(0, 2), 16);
                    }

                } else if (type === spine.AttachmentType.weightedmesh || type === spine.AttachmentType.weightedlinkedmesh) {
                    if (!slot.currentMeshName || slot.currentMeshName !== attachment.name) {
                        var meshName = attachment.name;
                        if (slot.currentMesh !== undefined) {
                            slot.currentMesh.visible = false;
                        }

                        slot.meshes = slot.meshes || {};

                        if (slot.meshes[meshName] !== undefined) {
                            slot.meshes[meshName].visible = true;
                        } else {
                            var mesh = this.createMesh(slot, attachment);
                            slotContainer.add(mesh);
                        }

                        slot.currentMesh = slot.meshes[meshName];
                        slot.currentMeshName = meshName;
                    }

                    (<spine.WeightedMeshAttachment>attachment).computeWorldVertices(slot.bone.skeleton.x, slot.bone.skeleton.y, slot, slot.currentMesh.vertices);

                } else {
                    slotContainer.visible = false;
                    continue;
                }
                slotContainer.visible = true;

                slotContainer.alpha = slot.a;
            }
        }

        /**
         * Children should always be destroyed
         *
         * @param destroyChildren
         * @param soft
         */
        public destroy(destroyChildren?: boolean, soft?: boolean): void {
            super.destroy(true, soft)
        }

        /**
         * When autoupdate is set to yes this function is used as pixi's updateTransform function
         *
         * @method autoUpdateTransform
         * @private
         */
        public autoUpdateTransform() {
            if (Spine.globalAutoUpdate) {
                this.lastTime = this.lastTime || Date.now();
                var timeDelta = (Date.now() - this.lastTime) * 0.001;
                this.lastTime = Date.now();

                this.update(timeDelta);
            } else {
                this.lastTime = 0;
            }

            PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
        };

        /**
         * Create a new sprite to be used with spine.RegionAttachment
         *
         * @method createSprite
         * @param slot {spine.Slot} The slot to which the attachment is parented
         * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
         * @private
         */
        public createSprite(slot: any, attachment: any): Phaser.Sprite {

            let descriptor: any = attachment.rendererObject;
            let baseTexture: any = descriptor.page.rendererObject;
            let spriteRect: PIXI.Rectangle = new PIXI.Rectangle(descriptor.x,
                descriptor.y,
                descriptor.rotate ? descriptor.height : descriptor.width,
                descriptor.rotate ? descriptor.width : descriptor.height);

            let spriteTexture: PIXI.Texture = new PIXI.Texture(baseTexture, spriteRect);
            let sprite: Phaser.Sprite = new Phaser.Sprite(this.game, 0, 0, spriteTexture);

            let baseRotation: number = descriptor.rotate ? Math.PI * 0.5 : 0.0;
            sprite.scale.x = descriptor.width / descriptor.originalWidth * attachment.scaleX / this.imageScale;
            sprite.scale.y = descriptor.height / descriptor.originalHeight * attachment.scaleY / this.imageScale;

            sprite.rotation = baseRotation;

            sprite.anchor.x = (0.5 * descriptor.originalWidth - descriptor.offsetX) / descriptor.width;
            sprite.anchor.y = 1.0 - ((0.5 * descriptor.originalHeight - descriptor.offsetY) / descriptor.height);

            sprite.alpha = attachment.a;

            if (descriptor.rotate) {
                let x1: number = sprite.scale.x;
                sprite.scale.x = sprite.scale.y;
                sprite.scale.y = x1;
            }

            slot.sprites = slot.sprites || {};
            slot.sprites[descriptor.name] = sprite;

            return sprite;
        };

        public createMesh(slot: any, attachment: any): Phaser.Rope {
            let descriptor: any = attachment.rendererObject;
            let baseTexture: any = descriptor.page.rendererObject;
            let texture: PIXI.Texture = new PIXI.Texture(baseTexture);

            
            let strip: Phaser.Rope = new Phaser.Rope(this.game, 0, 0, texture);
            (<any>strip).drawMode = 1;
            strip.canvasPadding = 1.5;

            (<any>strip).vertices = new spine.Float32Array(attachment.uvs.length);
            strip.uvs = attachment.uvs;
            strip.indices = attachment.triangles;
            strip.alpha = attachment.a;

            slot.meshes = slot.meshes || {};
            slot.meshes[attachment.name] = strip;

            return strip;
        };

        /**
         * [setMixByName wrap to stateData.setMixByName]
         * @param {String} fromName [source animation name]
         * @param {String} toName   [target animation name]
         * @param {Float} duration [Duration in the transition of the animations]
         */
        public setMixByName(fromName: string, toName: string, duration: number): void {
            this.stateData.setMixByName(fromName, toName, duration);
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
            let animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
            if (!animation) {
                console.warn("Animation not found: " + animationName);
                return null;
            }

            return this.state.setAnimation(trackIndex, animation, loop);
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
            let animation: spine.Animation = this.state.data.skeletonData.findAnimation(animationName);
            if (!animation) {
                console.warn("Animation not found: " + animationName);
                return null;
            }
            return this.state.addAnimation(trackIndex, animation, loop, delay);
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
                    let slotIndex = slotKeyPair[0];
                    let attachmentName = slotKeyPair[1];
                    let attachment = skin.attachments[key];

                    if (undefined === slotIndex || undefined === attachmentName) {
                        console.warn('something went wrong with reading the attachments index and/or name');
                        return;
                    }

                    if (newSkin.getAttachment(slotIndex, attachmentName) !== undefined) {
                        console.warn('Found double attachment for: ' + skinName + '. Skipping');
                        continue;
                    }

                    newSkin.addAttachment(slotIndex, attachmentName, attachment);
                }
            }

            this.skeleton.data.skins.push(newSkin);

            return newSkin;
        }
    }
}

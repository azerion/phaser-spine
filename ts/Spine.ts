module Fabrique {
    export class Spine extends Phaser.Group
    {
        private skeleton: spine.Skeleton;
        private skeletonData: spine.SkeletonData;
        private stateData: spine.AnimationStateData;
        private state: spine.AnimationState;
        private slotContainers: any[];
        private lastTime: number;

        public game: Fabrique.Plugins.SpineGame;

        /**
         * @class Spine
         * @extends Phaser.Group
         * @constructor
         * @param game {Phaser.Game} the game reference to add this object
         * @param key {String} the key to find the assets for this object
         */
        constructor(game: Fabrique.Plugins.SpineGame, key: string)
        {
            super(game);

            var data = this.game.cache.getSpine(key);

            var textureLoader = new Fabrique.SpineTextureLoader(game, key);
            // create a spine atlas using the loaded text and a spine texture loader instance //
            var spineAtlas = new spine.Atlas(game.cache.getText(data.atlas), textureLoader);
            // now we use an atlas attachment loader //
            var attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas);
            // spine animation
            var spineJsonParser = new spine.SkeletonJson(attachmentLoader);

            //get the Skeleton Data
            this.skeletonData = spineJsonParser.readSkeletonData(game.cache.getJSON(key));

            if (!this.skeletonData) {
                throw new Error('Spine data must be preloaded using Loader.spine');
            }

            this.skeleton = new spine.Skeleton(this.skeletonData);
            this.skeleton.updateWorldTransform();

            this.stateData = new spine.AnimationStateData(this.skeletonData);
            this.state = new spine.AnimationState(this.stateData);

            this.slotContainers = [];

            for (var i = 0, n = this.skeleton.drawOrder.length; i < n; i++) {
                var slot = this.skeleton.drawOrder[i];
                var attachment = slot.attachment;
                var slotContainer = new Phaser.Group(game);
                this.slotContainers.push(slotContainer);
                this.add(slotContainer);

                console.log(slot);

                if (attachment instanceof spine.RegionAttachment) {
                    var spriteName = attachment.rendererObject.name;
                    var sprite = this.createSprite(slot, attachment);
                    slot.currentSprite = sprite;
                    slot.currentSpriteName = spriteName;
                    slotContainer.add(sprite);
                } else if (attachment instanceof spine.MeshAttachment) {
                    var mesh = this.createMesh(slot, attachment);
                    slot.currentMesh = mesh;
                    slot.currentMeshName = attachment.name;
                    slotContainer.add(mesh);
                }
            }

            this.autoUpdate = true;
        }

        get autoUpdate(): boolean {
            return (this.updateTransform === Fabrique.Spine.prototype.autoUpdateTransform);
        };

        set autoUpdate(value: boolean) {
            this.updateTransform = value ? Fabrique.Spine.prototype.autoUpdateTransform : PIXI.DisplayObjectContainer.prototype.updateTransform;
        };


        /**
         * Update the spine skeleton and its animations by delta time (dt)
         *
         * @method update
         * @param dt {Number} Delta time. Time by which the animation should be updated
         */
        public update(dt?: number) {
            if (dt === undefined) {
                return;
            }

            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();

            var drawOrder = this.skeleton.drawOrder;
            for (var i = 0, n = drawOrder.length; i < n; i++) {

                var slot = this.skeleton.drawOrder[i];
                var attachment = slot.attachment;
                var slotContainer = this.slotContainers[i];

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

                    var bone = slot.bone;

                    //Update positions
                    slotContainer.position.x = attachment.x * bone.a + attachment.y * bone.b + bone.worldX;
                    slotContainer.position.y = attachment.x * bone.c + attachment.y * bone.d + bone.worldY;

                    //Update scaling
                    slotContainer.scale.x = bone.getWorldScaleX();
                    slotContainer.scale.y = bone.getWorldScaleY();

                    //Update rotation
                    slotContainer.rotation = (bone.getWorldRotationX() - attachment.rotation) * Math.PI / 180;

                    slot.currentSprite.tint = PIXI.rgb2hex([slot.r,slot.g,slot.b]);
                } else if (type === spine.AttachmentType.weightedmesh) {
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
        };

        /**
         * When autoupdate is set to yes this function is used as pixi's updateTransform function
         *
         * @method autoUpdateTransform
         * @private
         */
        public autoUpdateTransform() {
            this.lastTime = this.lastTime || Date.now();
            var timeDelta = (Date.now() - this.lastTime) * 0.001;
            this.lastTime = Date.now();

            this.update(timeDelta);

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
        public createSprite(slot: any, attachment: any) {

            var descriptor = attachment.rendererObject;
            var baseTexture = descriptor.page.rendererObject;
            var spriteRect = new PIXI.Rectangle(descriptor.x,
                descriptor.y,
                descriptor.rotate ? descriptor.height : descriptor.width,
                descriptor.rotate ? descriptor.width : descriptor.height);

            var spriteTexture = new PIXI.Texture(baseTexture, spriteRect);
            var sprite = new Phaser.Sprite(this.game, 0, 0, spriteTexture);

            var baseRotation = descriptor.rotate ? Math.PI * 0.5 : 0.0;
            sprite.scale.x = descriptor.width / descriptor.originalWidth;
            sprite.scale.y = descriptor.height / descriptor.originalHeight;

            sprite.rotation = baseRotation;
;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;

            sprite.alpha = attachment.a;


            slot.sprites = slot.sprites || {};
            slot.sprites[descriptor.name] = sprite;

            return sprite;
        };

        public createMesh(slot: any, attachment: any) {
            var descriptor = attachment.rendererObject;
            var baseTexture = descriptor.page.rendererObject;
            var texture = new PIXI.Texture(baseTexture);

            var strip = new PIXI.Strip(texture);
            strip.canvasPadding = 1.5;

            strip.vertices = [];
            strip.uvs = attachment.uvs;
            strip.indices = attachment.triangles;

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
        public setMixByName(fromName: string, toName: string, duration: number) {
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
        public setAnimationByName(trackIndex: number, animationName: string, loop: boolean) {
            var animation = this.state.data.skeletonData.findAnimation(animationName);
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
        public addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number) {
            var animation = this.state.data.skeletonData.findAnimation(animationName);
            if (!animation) {
                console.warn("Animation not found: " + animationName);
                return null;
            }
            return this.state.addAnimation(trackIndex, animation, loop, delay);
        };

        /**
         * Exposing the skeleton's method to change the skin by skinName
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {string}  skinName  The name of the skin we'd like to set
         */
        public setSkinByName(skinName: string) {
            var skin = this.skeleton.data.findSkin(skinName);
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
        public setSkin(skin: spine.Skin) {
            this.skeleton.setSkin(skin);
        }

        /**
         * Set to initial setup pose
         */
        public setToSetupPose() {
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
        public getCombinedSkin(newSkinName: string, ...skinNames: string[]): spine.Skin {
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

            return newSkin;
        }
    }
}
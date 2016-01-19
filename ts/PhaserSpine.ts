module Fabrique {
    /**
     * Supporting class to load images from spine atlases as per spine spec.
     *
     * @class SpineTextureLoader
     * @uses EventTarget
     * @constructor
     * @param basePath {String} Tha base path where to look for the images to be loaded
     * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
     */
    export class SpineTextureLoader {
        private basePath: string;
        private crossorigin: boolean;

        constructor(basePath: string, crossorigin: boolean) {
            this.basePath = basePath;
            this.crossorigin = crossorigin
        }

        /**
         * Starts loading a base texture as per spine specification
         *
         * @method load
         * @param page {spine.AtlasPage} Atlas page to which texture belongs
         * @param file {String} The file to load, this is just the file path relative to the base path configured in the constructor
         */
        public load = function(page: any, file: string) {
            page.rendererObject = PIXI.BaseTexture.fromImage(this.basePath + '/' + file, this.crossorigin);
        };

        /**
         * Unloads a previously loaded texture as per spine specification
         *
         * @method unload
         * @param texture {BaseTexture} Texture object to destroy
         */
        public unload = function(texture: PIXI.BaseTexture) {
            texture.destroy();
        };
    }

    export class Spine extends Phaser.Group
    {
        private spineData: any;
        public skeleton: {
            setToSetupPose: () => void;
            updateWorldTransform: () => void;
            drawOrder: any[];
            slots: any[];
        };
        private stateData: any;
        private state: {
            update: (dt: number) => void;
            apply: (skeleton: any) => void;
            setAnimationByName: (trackIndex: number, animationName: string, loop: boolean) => void;
            addAnimationByName: (trackIndex: number, animationName: string, loop: boolean, delay: number) => void;
            setMixByName: (fromName: string, toName: string, duration: number) => void;
        };
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

            var textureLoader = new Fabrique.SpineTextureLoader(data.basePath, false);
            // create a spine atlas using the loaded text and a spine texture loader instance //
            var spineAtlas = new spine.Atlas(game.cache.getText(data.atlas), textureLoader);
            // now we use an atlas attachment loader //
            var attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas);
            // spine animation
            var spineJsonParser = new spine.SkeletonJson(attachmentLoader);

            //get the Skeleton Data
            this.spineData = spineJsonParser.readSkeletonData(game.cache.getJSON(key));

            if (!this.spineData) {
                throw new Error('Spine data must be preloaded using Loader.spine');
            }

            this.skeleton = new spine.Skeleton(this.spineData);
            this.skeleton.updateWorldTransform();

            this.stateData = new spine.AnimationStateData(this.spineData);
            this.state = new spine.AnimationState(this.stateData);

            this.slotContainers = [];

            for (var i = 0, n = this.skeleton.drawOrder.length; i < n; i++) {
                var slot = this.skeleton.drawOrder[i];
                var attachment = slot.attachment;
                var slotContainer = new Phaser.Group(game);
                this.slotContainers.push(slotContainer);
                this.add(slotContainer);

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

                    slotContainer.position.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
                    slotContainer.position.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
                    slotContainer.scale.x = bone.worldScaleX;
                    slotContainer.scale.y = bone.worldScaleY;

                    slotContainer.rotation = -(slot.bone.worldRotation * spine.degRad);

                    //slot.currentSprite.tint = PIXI.rgb2hex([slot.r,slot.g,slot.b]);
                } else if (type === spine.AttachmentType.skinnedmesh) {
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

                    attachment.computeWorldVertices(slot.bone.skeleton.x, slot.bone.skeleton.y, slot, slot.currentMesh.vertices);

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
            sprite.scale.set(descriptor.width / descriptor.originalWidth, descriptor.height / descriptor.originalHeight);
            sprite.rotation = baseRotation - (attachment.rotation * spine.degRad);
            sprite.anchor.x = sprite.anchor.y = 0.5;

            slot.sprites = slot.sprites || {};
            slot.sprites[descriptor.name] = sprite;

            //set bitmap for tint
            this.createBitMap(sprite);

            return sprite;
        };

        public createBitMap(sprite: Phaser.Sprite) {
            var bitmap = this.game.make.bitmapData(sprite.width, sprite.height);

            var spriteData = {
                scaleX: sprite.scale.x,
                scaleY: sprite.scale.y,
                rotation: sprite.rotation
            };

            //reset the rotation and scale of sprite to draw into the bitmap
            sprite.scale.x = sprite.scale.y = 1;
            sprite.rotation = 0;

            //draw the sprite into the bitmap
            bitmap.draw(sprite, sprite.width/2, sprite.height/2);
            bitmap.update();

            //resotre the scale and rotation of the sprite
            sprite.scale.set(spriteData.scaleX, spriteData.scaleY);
            sprite.rotation = spriteData.rotation;

            sprite.loadTexture(bitmap);
        }

        public createMesh(slot: any, attachment: any) {
            var descriptor = attachment.rendererObject;
            var baseTexture = descriptor.page.rendererObject;
            var texture = new PIXI.Texture(baseTexture);

            var strip = new PIXI.Strip(texture);
            //strip.drawMode = PIXI.Strip.DrawModes.TRIANGLES;
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
         * [setAnimationByName set the animation for the specified track]
         * @param {Integer} trackIndex    [index to find the animation track]
         * @param {String} animationName [the name of the aniamtion to set]
         * @param {Boolean} loop          [true if the animation must continue in a loop]
         */
        public setAnimationByName(trackIndex: number, animationName: string, loop: boolean) {
            this.state.setAnimationByName(trackIndex, animationName, loop);
        };

        /**
         * [addAnimationByName description]
         * @param {[type]} trackIndex    [description]
         * @param {[type]} animationName [description]
         * @param {[type]} loop          [description]
         * @param {[type]} delay         [description]
         */
        public addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number) {
            this.state.addAnimationByName(trackIndex, animationName, loop, delay);
        };
    }
}
/*!
 * phaser-spine - version 1.2.2 
 * Spine plugin for Phaser.io!
 *
 * OrangeGames
 * Build at 04-05-2016
 * Released under MIT License 
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fabrique;
(function (Fabrique) {
    var Plugins;
    (function (Plugins) {
        var Spine = (function (_super) {
            __extends(Spine, _super);
            function Spine(game, parent) {
                _super.call(this, game, parent);
                this.addSpineCache();
                this.addSpineFactory();
                this.addSpineLoader();
            }
            Spine.prototype.addSpineLoader = function () {
                Phaser.Loader.prototype.spine = function (key, url) {
                    var atlasKey = key + "Atlas";
                    var cacheData = {
                        atlas: atlasKey,
                        basePath: (url.substring(0, url.lastIndexOf('/')) === '') ? '.' : url.substring(0, url.lastIndexOf('/'))
                    };
                    this.json(key, url);
                    this.text(atlasKey, url.substr(0, url.lastIndexOf('.')) + '.atlas');
                    this.image(key, url.substr(0, url.lastIndexOf('.')) + '.png');
                    this.game.cache.addSpine(key, cacheData);
                };
            };
            /**
             * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
             * game.add.spine();
             */
            Spine.prototype.addSpineFactory = function () {
                Phaser.GameObjectFactory.prototype.spine = function (x, y, key, group) {
                    if (group === undefined) {
                        group = this.world;
                    }
                    var spineObject = new Fabrique.Spine(this.game, key);
                    spineObject.setToSetupPose();
                    spineObject.position.x = x;
                    spineObject.position.y = y;
                    return group.add(spineObject);
                };
            };
            /**
             * Extends the Phaser.Cache prototype with spine properties
             */
            Spine.prototype.addSpineCache = function () {
                //Create the cache space
                Phaser.Cache.prototype.spine = {};
                //Method for adding a spine dict to the cache space
                Phaser.Cache.prototype.addSpine = function (key, data) {
                    this.spine[key] = data;
                };
                //Method for fetching a spine dict from the cache space
                Phaser.Cache.prototype.getSpine = function (key) {
                    return this.spine[key];
                };
            };
            return Spine;
        })(Phaser.Plugin);
        Plugins.Spine = Spine;
    })(Plugins = Fabrique.Plugins || (Fabrique.Plugins = {}));
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    var Spine = (function (_super) {
        __extends(Spine, _super);
        /**
         * @class Spine
         * @extends Phaser.Group
         * @constructor
         * @param game {Phaser.Game} the game reference to add this object
         * @param key {String} the key to find the assets for this object
         */
        function Spine(game, key) {
            _super.call(this, game);
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
                }
                else if (attachment instanceof spine.MeshAttachment) {
                    var mesh = this.createMesh(slot, attachment);
                    slot.currentMesh = mesh;
                    slot.currentMeshName = attachment.name;
                    slotContainer.add(mesh);
                }
            }
            this.autoUpdate = true;
        }
        Object.defineProperty(Spine.prototype, "autoUpdate", {
            get: function () {
                return (this.updateTransform === Fabrique.Spine.prototype.autoUpdateTransform);
            },
            set: function (value) {
                this.updateTransform = value ? Fabrique.Spine.prototype.autoUpdateTransform : PIXI.DisplayObjectContainer.prototype.updateTransform;
            },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        /**
         * Update the spine skeleton and its animations by delta time (dt)
         *
         * @method update
         * @param dt {Number} Delta time. Time by which the animation should be updated
         */
        Spine.prototype.update = function (dt) {
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
                            }
                            else {
                                var sprite = this.createSprite(slot, attachment);
                                slotContainer.add(sprite);
                            }
                            slot.currentSprite = slot.sprites[spriteName];
                            slot.currentSpriteName = spriteName;
                        }
                    }
                    var bone = slot.bone;
                    slotContainer.position.x = attachment.x * bone.a + attachment.y * bone.b + bone.worldX;
                    slotContainer.position.y = attachment.x * bone.c + attachment.y * bone.d + bone.worldY;
                    // slotContainer.position.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
                    // slotContainer.position.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
                    slotContainer.scale.x = bone.getWorldScaleX();
                    slotContainer.scale.y = bone.getWorldScaleY();
                    // slotContainer.rotation = -(slot.bone.worldRotation * spine.degRad);
                    // slotContainer.rotation = -(bone.getWorldRotationX() - attachment.rotation) * Math.PI / 180;
                    slot.currentSprite.tint = PIXI.rgb2hex([slot.r, slot.g, slot.b]);
                }
                else if (type === spine.AttachmentType.weightedmesh) {
                    if (!slot.currentMeshName || slot.currentMeshName !== attachment.name) {
                        var meshName = attachment.name;
                        if (slot.currentMesh !== undefined) {
                            slot.currentMesh.visible = false;
                        }
                        slot.meshes = slot.meshes || {};
                        if (slot.meshes[meshName] !== undefined) {
                            slot.meshes[meshName].visible = true;
                        }
                        else {
                            var mesh = this.createMesh(slot, attachment);
                            slotContainer.add(mesh);
                        }
                        slot.currentMesh = slot.meshes[meshName];
                        slot.currentMeshName = meshName;
                    }
                    attachment.computeWorldVertices(slot.bone.skeleton.x, slot.bone.skeleton.y, slot, slot.currentMesh.vertices);
                }
                else {
                    slotContainer.visible = false;
                    continue;
                }
                slotContainer.visible = true;
                slotContainer.alpha = slot.a;
            }
        };
        ;
        /**
         * When autoupdate is set to yes this function is used as pixi's updateTransform function
         *
         * @method autoUpdateTransform
         * @private
         */
        Spine.prototype.autoUpdateTransform = function () {
            this.lastTime = this.lastTime || Date.now();
            var timeDelta = (Date.now() - this.lastTime) * 0.001;
            this.lastTime = Date.now();
            this.update(timeDelta);
            PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
        };
        ;
        /**
         * Create a new sprite to be used with spine.RegionAttachment
         *
         * @method createSprite
         * @param slot {spine.Slot} The slot to which the attachment is parented
         * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
         * @private
         */
        Spine.prototype.createSprite = function (slot, attachment) {
            var descriptor = attachment.rendererObject;
            var baseTexture = descriptor.page.rendererObject;
            var spriteRect = new PIXI.Rectangle(descriptor.x, descriptor.y, descriptor.rotate ? descriptor.height : descriptor.width, descriptor.rotate ? descriptor.width : descriptor.height);
            var spriteTexture = new PIXI.Texture(baseTexture, spriteRect);
            var sprite = new Phaser.Sprite(this.game, 0, 0, spriteTexture);
            var baseRotation = descriptor.rotate ? Math.PI * 0.5 : 0.0;
            sprite.scale.set(descriptor.width / descriptor.originalWidth, descriptor.height / descriptor.originalHeight);
            // sprite.rotation = baseRotation - (attachment.rotation * Math.PI / 180);
            sprite.rotation = baseRotation - (slot.bone.getWorldRotationX() - attachment.rotation) * Math.PI / 180;
            sprite.anchor.x = sprite.anchor.y = 0.5;
            slot.sprites = slot.sprites || {};
            slot.sprites[descriptor.name] = sprite;
            //set bitmap for tint
            this.createBitMap(sprite);
            return sprite;
        };
        ;
        Spine.prototype.createBitMap = function (sprite) {
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
            bitmap.draw(sprite, sprite.width / 2, sprite.height / 2);
            bitmap.update();
            //resotre the scale and rotation of the sprite
            sprite.scale.set(spriteData.scaleX, spriteData.scaleY);
            sprite.rotation = spriteData.rotation;
            sprite.loadTexture(bitmap);
        };
        Spine.prototype.createMesh = function (slot, attachment) {
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
        ;
        /**
         * [setMixByName wrap to stateData.setMixByName]
         * @param {String} fromName [source animation name]
         * @param {String} toName   [target animation name]
         * @param {Float} duration [Duration in the transition of the animations]
         */
        Spine.prototype.setMixByName = function (fromName, toName, duration) {
            this.stateData.setMixByName(fromName, toName, duration);
        };
        ;
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
        Spine.prototype.setAnimationByName = function (trackIndex, animationName, loop) {
            var animation = this.state.data.skeletonData.findAnimation(animationName);
            if (!animation) {
                console.warn("Animation not found: " + animationName);
                return null;
            }
            return this.state.setAnimation(trackIndex, animation, loop);
        };
        ;
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
        Spine.prototype.addAnimationByName = function (trackIndex, animationName, loop, delay) {
            var animation = this.state.data.skeletonData.findAnimation(animationName);
            if (!animation) {
                console.warn("Animation not found: " + animationName);
                return null;
            }
            return this.state.addAnimation(trackIndex, animation, loop, delay);
        };
        ;
        /**
         * Exposing the skeleton's method to change the skin by skinName
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {string}  skinName  The name of the skin we'd like to set
         */
        Spine.prototype.setSkinByName = function (skinName) {
            var skin = this.skeleton.data.findSkin(skinName);
            if (!skin) {
                console.warn("Skin not found: " + skinName);
                return;
            }
            this.skeleton.setSkin(skin);
        };
        /**
         * Exposing the skeleton's method to change the skin
         *
         * @param skin
         */
        Spine.prototype.setSkin = function (skin) {
            this.skeleton.setSkin(skin);
        };
        /**
         * Set to initial setup pose
         */
        Spine.prototype.setToSetupPose = function () {
            this.skeleton.setToSetupPose();
        };
        /**
         * You can combine skins here by supplying a name for the new skin, and then a nummer of existing skins names that needed to be combined in the new skin
         * If the skins that will be combined contain any double attachment, only the first attachment will be added to the newskin.
         * any subsequent attachment that is double will not be added!
         *
         * @param newSkinName
         * @param skinNames
         */
        Spine.prototype.getCombinedSkin = function (newSkinName) {
            var skinNames = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                skinNames[_i - 1] = arguments[_i];
            }
            if (skinNames.length === 0) {
                console.warn('Unable to combine skins when no skins are passed...');
                return;
            }
            var newSkin = new spine.Skin(newSkinName);
            for (var i = 0; i < skinNames.length; i++) {
                var skinName = skinNames[i];
                var skin = this.skeleton.data.findSkin(skinName);
                if (!skin) {
                    console.warn("Skin not found: " + skinName);
                    return;
                }
                for (var key in skin.attachments) {
                    var slotKeyPair = key.split(':');
                    var slotIndex = slotKeyPair[0];
                    var attachmentName = slotKeyPair[1];
                    var attachment = skin.attachments[key];
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
        };
        return Spine;
    })(Phaser.Group);
    Fabrique.Spine = Spine;
})(Fabrique || (Fabrique = {}));
var Fabrique;
(function (Fabrique) {
    /**
     * Supporting class to load images from spine atlases as per spine spec.
     *
     * @class SpineTextureLoader
     * @uses EventTarget
     * @constructor
     * @param basePath {String} Tha base path where to look for the images to be loaded
     * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
     */
    var SpineTextureLoader = (function () {
        function SpineTextureLoader(game, key) {
            /**
             * Starts loading a base texture as per spine specification
             *
             * @method load
             * @param page {spine.AtlasPage} Atlas page to which texture belongs
             * @param file {String} The file to load, this is just the file path relative to the base path configured in the constructor
             */
            this.load = function (page, file) {
                var image = this.game.make.image(0, 0, this.key);
                page.rendererObject = image.texture.baseTexture;
            };
            /**
             * Unloads a previously loaded texture as per spine specification
             *
             * @method unload
             * @param texture {BaseTexture} Texture object to destroy
             */
            this.unload = function (texture) {
                texture.destroy();
            };
            this.game = game;
            this.key = key;
        }
        return SpineTextureLoader;
    })();
    Fabrique.SpineTextureLoader = SpineTextureLoader;
})(Fabrique || (Fabrique = {}));
//# sourceMappingURL=phaser-spine.js.map
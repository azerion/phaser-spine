declare module Fabrique {
    module Plugins {
        interface SpineObjectFactory extends Phaser.GameObjectFactory {
            spine: (x: number, y: number, key: string, group?: Phaser.Group) => Fabrique.Spine;
        }
        interface SpineCache extends Phaser.Cache {
            addSpine: (key: string, data: any) => void;
            getSpine: (key: string) => any;
            spine: {
                [key: string]: any;
            };
        }
        interface SpineLoader extends Phaser.Loader {
            spine: (key: string, url: string) => void;
            cache: SpineCache;
        }
        interface SpineGame extends Phaser.Game {
            add: SpineObjectFactory;
            load: SpineLoader;
            cache: SpineCache;
        }
        class Spine extends Phaser.Plugin {
            constructor(game: SpineGame, parent: PIXI.DisplayObject);
            private addSpineLoader();
            /**
             * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
             * game.add.spine();
             */
            private addSpineFactory();
            /**
             * Extends the Phaser.Cache prototype with spine properties
             */
            private addSpineCache();
        }
    }
}
declare module Fabrique {
    class Spine extends Phaser.Group {
        private skeleton;
        private skeletonData;
        private stateData;
        private state;
        private slotContainers;
        private lastTime;
        game: Fabrique.Plugins.SpineGame;
        /**
         * @class Spine
         * @extends Phaser.Group
         * @constructor
         * @param game {Phaser.Game} the game reference to add this object
         * @param key {String} the key to find the assets for this object
         */
        constructor(game: Fabrique.Plugins.SpineGame, key: string);
        autoUpdate: boolean;
        /**
         * Update the spine skeleton and its animations by delta time (dt)
         *
         * @method update
         * @param dt {Number} Delta time. Time by which the animation should be updated
         */
        update(dt?: number): void;
        /**
         * When autoupdate is set to yes this function is used as pixi's updateTransform function
         *
         * @method autoUpdateTransform
         * @private
         */
        autoUpdateTransform(): void;
        /**
         * Create a new sprite to be used with spine.RegionAttachment
         *
         * @method createSprite
         * @param slot {spine.Slot} The slot to which the attachment is parented
         * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
         * @private
         */
        createSprite(slot: any, attachment: any): Phaser.Sprite;
        createBitMap(sprite: Phaser.Sprite): void;
        createMesh(slot: any, attachment: any): PIXI.Strip;
        /**
         * [setMixByName wrap to stateData.setMixByName]
         * @param {String} fromName [source animation name]
         * @param {String} toName   [target animation name]
         * @param {Float} duration [Duration in the transition of the animations]
         */
        setMixByName(fromName: string, toName: string, duration: number): void;
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
        setAnimationByName(trackIndex: number, animationName: string, loop: boolean): spine.TrackEntry;
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
        addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number): spine.TrackEntry;
        /**
         * Exposing the skeleton's method to change the skin by skinName
         * We override the original runtime's error because warnings dont stop the VM
         *
         * @param {string}  skinName  The name of the skin we'd like to set
         */
        setSkinByName(skinName: string): void;
        /**
         * Exposing the skeleton's method to change the skin
         *
         * @param skin
         */
        setSkin(skin: spine.Skin): void;
        /**
         * Set to initial setup pose
         */
        setToSetupPose(): void;
        /**
         * You can combine skins here by supplying a name for the new skin, and then a nummer of existing skins names that needed to be combined in the new skin
         * If the skins that will be combined contain any double attachment, only the first attachment will be added to the newskin.
         * any subsequent attachment that is double will not be added!
         *
         * @param newSkinName
         * @param skinNames
         */
        getCombinedSkin(newSkinName: string, ...skinNames: string[]): spine.Skin;
    }
}
declare module Fabrique {
    /**
     * Supporting class to load images from spine atlases as per spine spec.
     *
     * @class SpineTextureLoader
     * @uses EventTarget
     * @constructor
     * @param basePath {String} Tha base path where to look for the images to be loaded
     * @param crossorigin {Boolean} Whether requests should be treated as crossorigin
     */
    class SpineTextureLoader {
        private game;
        private key;
        constructor(game: Phaser.Game, key: string);
        /**
         * Starts loading a base texture as per spine specification
         *
         * @method load
         * @param page {spine.AtlasPage} Atlas page to which texture belongs
         * @param file {String} The file to load, this is just the file path relative to the base path configured in the constructor
         */
        load: (page: any, file: string) => void;
        /**
         * Unloads a previously loaded texture as per spine specification
         *
         * @method unload
         * @param texture {BaseTexture} Texture object to destroy
         */
        unload: (texture: PIXI.BaseTexture) => void;
    }
}

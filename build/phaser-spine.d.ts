declare module spine {

    function binarySearch(values: any, target: any, step: any): any;
    function linearSearch(values: any, target: any, step: any): number;

    var degRad: number;

    class Animation {
        public name: any;
        public timelines: any;
        public duration: any;
        constructor(name: any, timelines: any, duration: any);
        public apply(skeleton: any, lastTime: any, time: any, loop: any, events: any): void;
        public mix(skeleton: any, lastTime: any, time: any, loop: any, events: any, alpha: any): void;
    }

    class AnimationStateData {
        public skeletonData: spine.SkeletonData;
        public animationToMixTime: any;
        public defaultMix: number;
        constructor(skeletonData: spine.SkeletonData);
        public setMixByName(fromName: any, toName: any, duration: any): void;
        public setMix(from: any, to: any, duration: any): void;
        public getMix(from: any, to: any): any;
    }

    class AnimationState {
        public data: spine.AnimationStateData;
        public tracks: any[];
        public events: spine.Event[];
        public onStart: any;
        public onEnd: any;
        public onComplete: any;
        public onEvent: any;
        public timeScale: number;
        constructor(data: spine.AnimationStateData);
        public update(delta: any): void;
        public apply(skeleton: spine.Skeleton): void;
        public clearTracks(): void;
        public clearTrack(trackIndex: any): void;
        private _expandToIndex(index);
        public setCurrent(index: any, entry: any): void;
        public setAnimationByName(trackIndex: any, animationName: any, loop: any): void;
        /** Set the current animation. Any queued animations are cleared. */
        public setAnimation(trackIndex: any, animation: any, loop: any): spine.TrackEntry;
        public addAnimationByName(trackIndex: any, animationName: any, loop: any, delay: any): void;
        /** Adds an animation to be played delay seconds after the current or last queued animation.
         * @param delay May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay. */
        public addAnimation(trackIndex: any, animation: any, loop: any, delay: any): spine.TrackEntry;
        /** May be null. */
        public getCurrent(trackIndex: any): any;
    }

    class BoneData {
        public name: any;
        public parent: any;
        public length: number;
        public x: number;
        public y: number;
        public rotation: number;
        public inheritScale: boolean;
        public inheritRotation: boolean;
        public scaleX: number;
        public scaleY: number;
        constructor(name: any, parent: any);
    }

    class Bone {
        public data: any;
        public parent: any;
        static yDown: boolean;
        public name: string;
        public x: number;
        public y: number;
        public rotation: number;
        public scaleX: number;
        public scaleY: number;
        public m00: number;
        public m01: number;
        public worldX: number;
        public m10: number;
        public m11: number;
        public worldY: number;
        public worldRotation: number;
        public worldScaleX: number;
        public worldScaleY: number;
        constructor(data: any, parent: any);
        public updateWorldTransform(flipX: any, flipY: any): void;
        public setToSetupPose(): void;
    }

    class AttachmentTimeline {
        public slotIndex: number;
        public curves: any;
        public Curves: any;
        public frames: any[];
        public attachmentNames: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, attachmentName: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class Atlas {
        public atlasText: any;
        public textureLoader: any;
        public pages: any[];
        public regions: any[];
        static Format: {
            alpha: number;
            intensity: number;
            luminanceAlpha: number;
            rgb565: number;
            rgba4444: number;
            rgb888: number;
            rgba8888: number;
        };
        static TextureFilter: {
            nearest: number;
            linear: number;
            mipMap: number;
            mipMapNearestNearest: number;
            mipMapLinearNearest: number;
            mipMapNearestLinear: number;
            mipMapLinearLinear: number;
        };
        static TextureWrap: {
            mirroredRepeat: number;
            clampToEdge: number;
            repeat: number;
        };
        constructor(atlasText: any, textureLoader: any);
        public findRegion(name: any): any;
        public dispose(): void;
        public updateUVs(page: any): void;
    }

    class AtlasPage {
        public name: any;
        public format: any;
        public minFilter: any;
        public magFilter: any;
        public uWrap: any;
        public vWrap: any;
        public rendererObject: any;
        public width: any;
        public height: any;
    }

    class AtlasAttachmentLoader {
        public atlas: any;
        constructor(atlas: any);
        public newAttachment(skin: any, type: any, name: any): any;
    }

    class AtlasRegion {
        public page: any;
        public name: any;
        public x: number;
        public y: number;
        public width: number;
        public height: number;
        public u: number;
        public v: number;
        public u2: number;
        public v2: number;
        public offsetX: number;
        public offsetY: number;
        public originalWidth: number;
        public originalHeight: number;
        public index: number;
        public rotate: boolean;
        public splits: any;
        public pads: any;
    }

    class AtlasReader {
        private lines;
        private index;
        constructor(text: any);
        public trim(value: any): any;
        public readLine(): string;
        public readValue(): any;
        /** Returns the number of tuple values read (2 or 4). */
        public readTuple(tuple: any): number;
    }

    class AttachmentType {
        static region: number;
        static boundingBox: number;
        static mesh: number;
        static skinnedmesh: number;
    }

    class Curves {
        public curves: any[];
        constructor(frameCount: any);
        public setLinear(frameIndex: any): void;
        public setStepped(frameIndex: any): void;
        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
         * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
         * the difference between the keyframe's values. */
        public setCurve(frameIndex: any, cx1: any, cy1: any, cx2: any, cy2: any): void;
        public getCurvePercent(frameIndex: any, percent: any): any;
    }

    class ColorTimeline {
        public slotIndex: number;
        public curves: any;
        public Curves: any;
        public frames: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, r: any, g: any, b: any, a: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class BoundingBoxAttachment {
        public name: any;
        public type: number;
        public vertices: any[];
        constructor(name: any);
        public computeWorldVertices(x: any, y: any, bone: any, worldVertices: any): void;
    }

    class SlotData {
        public name: any;
        public boneData: any;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        public attachmentName: string;
        public additiveBlending: boolean;
        constructor(name: any, boneData: any);
    }

    class Slot {
        public data: any;
        public skeleton: any;
        public bone: any;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        private _attachmentTime;
        public attachment: any;
        constructor(data: any, skeleton: any, bone: any);
        public setAttachment(attachment: any): void;
        public setAttachmentTime(time: any): void;
        public getAttachmentTime(): number;
        public setToSetupPose(): void;
    }

    class Skin {
        public name: any;
        public attachments: any;
        constructor(name: any);
        public addAttachment(slotIndex: any, name: any, attachment: any): void;
        public getAttachment(slotIndex: any, name: any): any;
        private _attachAll(skeleton, oldSkin);
    }

    class RotateTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, angle: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class RegionAttachment {
        public name: any;
        public type: number;
        public x: number;
        public y: number;
        public rotation: number;
        public scaleX: number;
        public scaleY: number;
        public width: number;
        public height: number;
        public rendererObject: any;
        public regionOffsetX: number;
        public regionOffsetY: number;
        public regionWidth: number;
        public regionHeight: number;
        public regionOriginalWidth: number;
        public regionOriginalHeight: number;
        public offset: any[];
        public uvs: any[];
        constructor(name?: any);
        public setUVs(u: any, v: any, u2: any, v2: any, rotate: any): void;
        public updateOffset(): void;
        public computeVertices(x: any, y: any, bone: any, vertices: any): void;
    }

    class EventTimeline {
        public frames: any[];
        public events: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, event: any): void;
        /** Fires events for frames > lastTime and <= time. */
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class DrawOrderTimeline {
        public frames: any[];
        public drawOrders: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, drawOrder: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class EventData {
        public name: any;
        constructor(name: any);
        public intValue: number;
        public floatValue: number;
        public stringValue: string;
    }

    class Event {
        public data: any;
        constructor(data: any);
        public intValue: number;
        public floatValue: number;
        public stringValue: string;
    }

    class ScaleTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, x: any, y: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class SkeletonData {
        public bones: spine.BoneData[];
        public slots: spine.SlotData[];
        public skins: spine.Skin[];
        public events: spine.EventData[];
        public animations: any[];
        public defaultSkin: any;
        constructor();
        /** @return May be null. */
        public findBone(boneName: any): spine.BoneData;
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName: any): number;
        /** @return May be null. */
        public findSlot(slotName: any): spine.SlotData;
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName: any): number;
        /** @return May be null. */
        public findSkin(skinName: any): spine.Skin;
        /** @return May be null. */
        public findEvent(eventName: any): spine.EventData;
        /** @return May be null. */
        public findAnimation(animationName: any): any;
    }

    class Skeleton {
        public bones: spine.Bone[];
        public slots: spine.Slot[];
        public drawOrder: any[];
        public data: spine.SkeletonData;
        public x: number;
        public y: number;
        public skin: spine.Skin;
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        public time: number;
        public flipX: boolean;
        public flipY: boolean;
        constructor(skeletonData: spine.SkeletonData);
        /** Updates the world transform for each bone. */
        public updateWorldTransform(): void;
        /** Sets the bones and slots to their setup pose values. */
        public setToSetupPose(): void;
        public setBonesToSetupPose(): void;
        public setSlotsToSetupPose(): void;
        /** @return May return null. */
        public getRootBone(): spine.Bone;
        /** @return May be null. */
        public findBone(boneName: any): spine.Bone;
        /** @return -1 if the bone was not found. */
        public findBoneIndex(boneName: any): number;
        /** @return May be null. */
        public findSlot(slotName: any): spine.Slot;
        /** @return -1 if the bone was not found. */
        public findSlotIndex(slotName: any): number;
        public setSkinByName(skinName: any): void;
        /** Sets the skin used to look up attachments not found in the {@link SkeletonData#getDefaultSkin() default skin}. Attachments
         * from the new skin are attached if the corresponding attachment from the old skin was attached.
         * @param newSkin May be null. */
        public setSkin(newSkin: any): void;
        /** @return May be null. */
        public getAttachmentBySlotName(slotName: any, attachmentName: any): any;
        /** @return May be null. */
        public getAttachmentBySlotIndex(slotIndex: any, attachmentName: any): any;
        /** @param attachmentName May be null. */
        public setAttachment(slotName: any, attachmentName: any): void;
        public update(delta: number): void;
    }

    class SkeletonBounds {
        public polygonPool: any[];
        public polygons: any[];
        public boundingBoxes: any[];
        private minX;
        private minY;
        private maxX;
        private maxY;
        constructor();
        public update(skeleton: any, updateAabb: any): void;
        public aabbCompute(): void;
        /** Returns true if the axis aligned bounding box contains the point. */
        public aabbContainsPoint(x: any, y: any): boolean;
        /** Returns true if the axis aligned bounding box intersects the line segment. */
        public aabbIntersectsSegment(x1: any, y1: any, x2: any, y2: any): boolean;
        /** Returns true if the axis aligned bounding box intersects the axis aligned bounding box of the specified bounds. */
        public aabbIntersectsSkeleton(bounds: any): boolean;
        /** Returns the first bounding box attachment that contains the point, or null. When doing many checks, it is usually more
         * efficient to only call this method if {@link #aabbContainsPoint(float, float)} returns true. */
        public containsPoint(x: any, y: any): any;
        /** Returns true if the polygon contains the point. */
        public polygonContainsPoint(polygon: any, x: any, y: any): boolean;
        /** Returns true if the polygon contains the line segment. */
        public intersectsSegment(polygon: any, x1: any, y1: any, x2: any, y2: any): boolean;
        public getPolygon(attachment: any): any;
        public getWidth(): number;
        public getHeight(): number;
    }

    class SkeletonJson {
        public attachmentLoader: any;
        public scale: number;
        constructor(attachmentLoader: any);
        static readCurve(timeline: any, frameIndex: any, valueMap: any): void;
        static toColor(hexString: any, colorIndex: any): number;
        public readSkeletonData(root: any): spine.SkeletonData;
        public readAttachment(skin: any, name: any, map: any): any;
        public readAnimation(name: any, map: any, skeletonData: any): void;
    }

    class TranslateTimeline {
        public boneIndex: number;
        public curves: spine.Curves;
        public frames: any[];
        constructor(frameCount: any);
        public getFrameCount(): number;
        public setFrame(frameIndex: any, time: any, x: any, y: any): void;
        public apply(skeleton: any, lastTime: any, time: any, firedEvents: any, alpha: any): void;
    }

    class TrackEntry {
        public next: any;
        public previous: any;
        public animation: any;
        public loop: boolean;
        public delay: number;
        public time: number;
        public lastTime: number;
        public endTime: number;
        public timeScale: number;
        public mixTime: number;
        public mixDuration: number;
        public onStart: any;
        public onEnd: any;
        public onComplete: any;
        public onEvent: any;
    }

    class MeshAttachment {
        public name: string;
    }
}
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

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
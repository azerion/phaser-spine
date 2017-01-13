
module PhaserSpine {
        export interface SpineObjectFactory extends Phaser.GameObjectFactory {
            spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => any;
        }

        export interface SpineObjectCreator extends Phaser.GameObjectCreator {
            spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => any
        }

        export interface SpineCache extends Phaser.Cache {
            addSpine: (key: string, data: any) => void;
            getSpine: (key: string) => any;
            spine: {[key: string]: SpineCacheData};
        }

        export interface SpineLoader extends Phaser.Loader {
            spine: (key: string, url: string, scalingVariants?: string[]) => void;
            cache: SpineCache;
        }

        export interface SpineGame extends Phaser.Game {
            add: SpineObjectFactory;
            load: SpineLoader;
            cache: SpineCache;
        }

        export interface SpineCacheData {
            atlas: string;
            basePath: string;
            variants: string[];
        }

        export interface Config {
            debugRendering: boolean;
            triangleRendering: boolean;
        }

        export class SpinePlugin extends Phaser.Plugin {

            public static RESOLUTION_REGEXP: RegExp = /@(.+)x/;

            public static SPINE_NAMESPACE: string = 'spine';

            private renderer: Canvas.Renderer;

            constructor(game: SpineGame, parent: Phaser.PluginManager) {
                super(game, parent);
            }

            public init(config?: Config): void {
                if (!config) {
                    config = <Config>{
                        debugRendering: false,
                        triangleRendering: true
                    }
                }

                this.renderer = new PhaserSpine.Canvas.Renderer(this.game);
                // enable debug rendering
                this.renderer.debugRendering = config.debugRendering;
                // enable the triangle renderer, supports meshes, but may produce artifacts in some browsers
                this.renderer.triangleRendering = config.triangleRendering;

                this.addSpineCache();
                this.addSpineFactory();
                this.addSpineLoader();
            }

            private addSpineLoader() {
                (<PhaserSpine.SpineLoader>Phaser.Loader.prototype).spine = function(key: string, url: string, scalingVariants?: string[]) {
                    let path: string = url.substr(0, url.lastIndexOf('.'));

                    (<PhaserSpine.SpineLoader>this).text(SpinePlugin.SPINE_NAMESPACE + key, path +'.atlas');
                    (<PhaserSpine.SpineLoader>this).json(SpinePlugin.SPINE_NAMESPACE + key, path + '.json');
                    (<PhaserSpine.SpineLoader>this).image(SpinePlugin.SPINE_NAMESPACE + key, path +'.png');
                };
            }

            public render(): void {
                console.log('drawing!');
                this.renderer.draw();
            }

            /**
             * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
             * game.add.spine();
             */
            private addSpineFactory() {
                let renderer = this.renderer;
                (<PhaserSpine.SpineObjectFactory>Phaser.GameObjectFactory.prototype).spine = function(x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group): Spine
                {
                    if (group === undefined) { group = this.world; }

                    let skin: string = "default";

                    // Load the texture atlas using name.atlas and name.png from the AssetManager.
                    // The function passed to TextureAtlas is used to resolve relative paths.
                    let atlas: spine.TextureAtlas = new spine.TextureAtlas(this.game.cache.getText(SpinePlugin.SPINE_NAMESPACE +key), function(path) {
                        return new PhaserSpine.Canvas.Texture(this.game.cache.getImage(SpinePlugin.SPINE_NAMESPACE +key));
                    });

                    // Create a AtlasAttachmentLoader, which is specific to the WebGL backend.
                    let atlasLoader: spine.AtlasAttachmentLoader = new spine.AtlasAttachmentLoader(atlas);

                    // Create a SkeletonJson instance for parsing the .json file.
                    var skeletonJson = new spine.SkeletonJson(atlasLoader);

                    function calculateBounds(skeleton: spine.Skeleton) {
                        var data = skeleton.data;
                        skeleton.setToSetupPose();
                        skeleton.updateWorldTransform();
                        var offset = new spine.Vector2();
                        var size = new spine.Vector2();
                        skeleton.getBounds(offset, size);
                        return new Phaser.Rectangle(offset.x, offset.y, size.x, size.y);
                    }


                    // Set the scale to apply during parsing, parse the file, and create a new skeleton.
                    var skeletonData = skeletonJson.readSkeletonData(this.game.cache.getJSON(SpinePlugin.SPINE_NAMESPACE +key));
                    var skeleton = new spine.Skeleton(skeletonData);
                    skeleton.flipY = true;
                    var bounds = calculateBounds(skeleton);
                    //	skeleton.setSkinByName(skin);

                    // Create an AnimationState, and set the initial animation in looping mode.
                    var animationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
                    	animationState.setAnimation(0, 'walk', true);
                    //animationState.addListener({
                    //    event: function(trackIndex, event) {
                    //        // console.log("Event on track " + trackIndex + ": " + JSON.stringify(event));
                    //    },
                    //    complete: function(trackIndex, loopCount) {
                    //        // console.log("Animation on track " + trackIndex + " completed, loop count: " + loopCount);
                    //    },
                    //    start: function(trackIndex) {
                    //        // console.log("Animation on track " + trackIndex + " started");
                    //    },
                    //    end: function(trackIndex) {
                    //        // console.log("Animation on track " + trackIndex + " ended");
                    //    }
                    //})

                    var spineObject = new Spine(this.game, skeleton, bounds, animationState);
                    renderer.add(spineObject);
                    return group.add(spineObject);
                };

                (<PhaserSpine.SpineObjectCreator>Phaser.GameObjectCreator.prototype).spine = function(x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group): Spine
                {
                    return null;//new Spine(this.game, key, scalingVariant);
                };
            }

            /**
             * Extends the Phaser.Cache prototype with spine properties
             */
            private addSpineCache(): void {
                //Create the cache space
                (<PhaserSpine.SpineCache>Phaser.Cache.prototype).spine = {};

                //Method for adding a spine dict to the cache space
                (<PhaserSpine.SpineCache>Phaser.Cache.prototype).addSpine = function(key: string, data: SpineCacheData)
                {
                    this.spine[key] = data;
                };

                //Method for fetching a spine dict from the cache space
                (<PhaserSpine.SpineCache>Phaser.Cache.prototype).getSpine = function(key: string): SpineCacheData
                {
                    if (!this.spine.hasOwnProperty(key)) {
                        console.warn('Phaser.Cache.getSpine: Key "' + key + '" not found in Cache.')
                    }

                    return this.spine[key];
                };
            }
        }
}

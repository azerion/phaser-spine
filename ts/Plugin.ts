
module PhaserSpine {
        export interface SpineObjectFactory extends Phaser.GameObjectFactory {
            spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => PhaserSpine.Spine;
        }

        export interface SpineObjectCreator extends Phaser.GameObjectCreator {
            spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => PhaserSpine.Spine;
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

        export class SpinePlugin extends Phaser.Plugin {

            public static RESOLUTION_REGEXP: RegExp = /@(.+)x/;

            constructor(game: SpineGame, parent: Phaser.PluginManager) {
                super(game, parent);

                this.addSpineCache();
                this.addSpineFactory();
                this.addSpineLoader();
            }
            
            private addSpineLoader() {
                (<PhaserSpine.SpineLoader>Phaser.Loader.prototype).spine = function(key: string, url: string, scalingVariants?: string[]) {

                    let atlasKey: string = key+"Atlas";

                    let cacheData: SpineCacheData = <SpineCacheData>{
                        atlas: atlasKey,
                        basePath: (url.substring(0, url.lastIndexOf('/')) === '') ? '.' : url.substring(0, url.lastIndexOf('/')),
                        variants: undefined
                    };

                    if (undefined === scalingVariants) {
                        scalingVariants = [''];
                    } else {
                        cacheData.variants = scalingVariants;
                    }

                    scalingVariants.forEach((variant: string) => {
                        //Check if an atlas file was loaded
                        (<PhaserSpine.SpineLoader>this).onFileComplete.add((progress: any, cacheKey: string) => {
                            if (cacheKey === atlasKey) {
                                let atlas = new spine.Atlas(this.game.cache.getText(cacheKey), {
                                    load: (page: any, file: string, atlas: spine.Atlas) => {
                                        // console.log(page, file, atlas);
                                        (<PhaserSpine.SpineLoader>this).image(file, cacheData.basePath + '/' + file.substr(0, file.lastIndexOf('.')) + variant + '.png');
                                    }
                                });
                            }
                        });

                        //Load the atlas file
                        (<PhaserSpine.SpineLoader>this).text(atlasKey, url.substr(0, url.lastIndexOf('.')) + variant + '.atlas');
                    });


                    (<PhaserSpine.SpineLoader>this).json(key, url);

                    this.game.cache.addSpine(key, cacheData);
                }; 
            }

            /**
             * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
             * game.add.spine();
             */
            private addSpineFactory() {
                (<PhaserSpine.SpineObjectFactory>Phaser.GameObjectFactory.prototype).spine = function(x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group): PhaserSpine.Spine
                {
                    if (group === undefined) { group = this.world; }

                    var spineObject = new PhaserSpine.Spine(this.game, key, scalingVariant);

                    spineObject.setToSetupPose();
                    spineObject.position.x = x;
                    spineObject.position.y = y;

                    return group.add(spineObject);
                };

                (<PhaserSpine.SpineObjectCreator>Phaser.GameObjectCreator.prototype).spine = function(x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group): PhaserSpine.Spine
                {
                    return new PhaserSpine.Spine(this.game, key, scalingVariant);
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

module Fabrique {
    export module Plugins {
        export interface SpineObjectFactory extends Phaser.GameObjectFactory {
            spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => Fabrique.Spine;
        }

        export interface SpineCache extends Phaser.Cache {
            addSpine: (key: string, data: any) => void;
            getSpine: (key: string) => any;
            spine: {[key: string]: SpineCacheData};
        }

        export interface SpineLoader extends Phaser.Loader {
            spine: (key: string, url: string) => void;
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

        export class Spine extends Phaser.Plugin {

            public static RESOLUTION_REGEXP: RegExp = /@(.+)x/;

            constructor(game: SpineGame, parent: PIXI.DisplayObject) {
                super(game, parent);

                this.addSpineCache();
                this.addSpineFactory();
                this.addSpineLoader();
            }
            
            private addSpineLoader() {
                (<Fabrique.Plugins.SpineLoader>Phaser.Loader.prototype).spine = function(key: string, url: string, scalingVariants?: string[]) {

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

                    this.json(key, url);

                    scalingVariants.forEach((variant: string) => {
                        (<Fabrique.Plugins.SpineLoader>this).text(atlasKey, url.substr(0, url.lastIndexOf('.')) + variant + '.atlas');
                        (<Fabrique.Plugins.SpineLoader>this).image(key, url.substr(0, url.lastIndexOf('.')) + variant + '.png');
                    });

                    this.game.cache.addSpine(key, cacheData);
                };
            }

            /**
             * Extends the GameObjectFactory prototype with the support of adding spine. this allows us to add spine methods to the game just like any other object:
             * game.add.spine();
             */
            private addSpineFactory() {
                (<Fabrique.Plugins.SpineObjectFactory>Phaser.GameObjectFactory.prototype).spine = function(x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group): Fabrique.Spine
                {
                    if (group === undefined) { group = this.world; }

                    var spineObject = new Fabrique.Spine(this.game, key, scalingVariant);

                    spineObject.setToSetupPose();
                    spineObject.position.x = x;
                    spineObject.position.y = y;

                    return group.add(spineObject);
                };
            }

            /**
             * Extends the Phaser.Cache prototype with spine properties
             */
            private addSpineCache(): void {
                //Create the cache space
                (<Fabrique.Plugins.SpineCache>Phaser.Cache.prototype).spine = {};

                //Method for adding a spine dict to the cache space
                (<Fabrique.Plugins.SpineCache>Phaser.Cache.prototype).addSpine = function(key: string, data: SpineCacheData)
                {
                    this.spine[key] = data;
                };

                //Method for fetching a spine dict from the cache space
                (<Fabrique.Plugins.SpineCache>Phaser.Cache.prototype).getSpine = function(key: string): SpineCacheData
                {
                    return this.spine[key];
                };
            }
        }
    }
}

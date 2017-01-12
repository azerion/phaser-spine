declare module PhaserSpine {
}
declare module PhaserSpine {
}
declare module PhaserSpine {
}
declare module PhaserSpine {
    interface SpineObjectFactory extends Phaser.GameObjectFactory {
        spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => any;
    }
    interface SpineObjectCreator extends Phaser.GameObjectCreator {
        spine: (x: number, y: number, key: string, scalingVariant?: string, group?: Phaser.Group) => any;
    }
    interface SpineCache extends Phaser.Cache {
        addSpine: (key: string, data: any) => void;
        getSpine: (key: string) => any;
        spine: {
            [key: string]: SpineCacheData;
        };
    }
    interface SpineLoader extends Phaser.Loader {
        spine: (key: string, url: string, scalingVariants?: string[]) => void;
        cache: SpineCache;
    }
    interface SpineGame extends Phaser.Game {
        add: SpineObjectFactory;
        load: SpineLoader;
        cache: SpineCache;
    }
    interface SpineCacheData {
        atlas: string;
        basePath: string;
        variants: string[];
    }
    class SpinePlugin extends Phaser.Plugin {
        static RESOLUTION_REGEXP: RegExp;
        constructor(game: SpineGame, parent: Phaser.PluginManager);
        private addSpineLoader();
        private addSpineFactory();
        private addSpineCache();
    }
}

/*!
 * phaser-spine - version 3.1.0-alpha1 
 * Spine plugin for Phaser.io!
 *
 * OrangeGames
 * Build at 12-01-2017
 * Released under MIT License 
 */

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PhaserSpine;
(function (PhaserSpine) {
    var Canvas;
    (function (Canvas) {
        var Renderer = (function () {
            function Renderer() {
            }
            return Renderer;
        }());
        Canvas.Renderer = Renderer;
    })(Canvas || (Canvas = {}));
})(PhaserSpine || (PhaserSpine = {}));
var PhaserSpine;
(function (PhaserSpine) {
    var Canvas;
    (function (Canvas) {
        var Spine = (function () {
            function Spine() {
            }
            return Spine;
        }());
        Canvas.Spine = Spine;
    })(Canvas || (Canvas = {}));
})(PhaserSpine || (PhaserSpine = {}));
var PhaserSpine;
(function (PhaserSpine) {
    var Canvas;
    (function (Canvas) {
        var Texture = (function (_super) {
            __extends(Texture, _super);
            function Texture(image) {
                return _super.call(this, image) || this;
            }
            Texture.prototype.setFilters = function (minFilter, magFilter) { };
            Texture.prototype.setWraps = function (uWrap, vWrap) { };
            Texture.prototype.dispose = function () { };
            return Texture;
        }(spine.Texture));
        Canvas.Texture = Texture;
    })(Canvas || (Canvas = {}));
})(PhaserSpine || (PhaserSpine = {}));
var PhaserSpine;
(function (PhaserSpine) {
    var SpinePlugin = (function (_super) {
        __extends(SpinePlugin, _super);
        function SpinePlugin(game, parent) {
            var _this = _super.call(this, game, parent) || this;
            _this.addSpineCache();
            _this.addSpineFactory();
            _this.addSpineLoader();
            return _this;
        }
        SpinePlugin.prototype.addSpineLoader = function () {
            Phaser.Loader.prototype.spine = function (key, url, scalingVariants) {
                var atlasKey = key + "Atlas";
                var cacheData = {
                    atlas: atlasKey,
                    basePath: (url.substring(0, url.lastIndexOf('/')) === '') ? '.' : url.substring(0, url.lastIndexOf('/')),
                };
                this.text(key, url.substr(0, url.lastIndexOf('.')) + '.atlas');
                this.json(key, url);
                this.image(key, url.substr(0, url.lastIndexOf('.')) + '.png');
                this.game.cache.addSpine(key, cacheData);
            };
        };
        SpinePlugin.prototype.addSpineFactory = function () {
            Phaser.GameObjectFactory.prototype.spine = function (x, y, key, scalingVariant, group) {
                if (group === undefined) {
                    group = this.world;
                }
                var spineObject = null;
                return group.add(spineObject);
            };
            Phaser.GameObjectCreator.prototype.spine = function (x, y, key, scalingVariant, group) {
                return null;
            };
        };
        SpinePlugin.prototype.addSpineCache = function () {
            Phaser.Cache.prototype.spine = {};
            Phaser.Cache.prototype.addSpine = function (key, data) {
                this.spine[key] = data;
            };
            Phaser.Cache.prototype.getSpine = function (key) {
                if (!this.spine.hasOwnProperty(key)) {
                    console.warn('Phaser.Cache.getSpine: Key "' + key + '" not found in Cache.');
                }
                return this.spine[key];
            };
        };
        return SpinePlugin;
    }(Phaser.Plugin));
    SpinePlugin.RESOLUTION_REGEXP = /@(.+)x/;
    PhaserSpine.SpinePlugin = SpinePlugin;
})(PhaserSpine || (PhaserSpine = {}));
//# sourceMappingURL=phaser-spine.js.map
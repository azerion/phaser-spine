Phaser Spine
============

Spine plugin for Phaser, it works, somehow.. No? Submit an issue, otherwise have fun :)

Key features:

* Spine for Phaser! :o
* Skin support
* Possible to combine skins
* Mixes and fading animations
* Support for scaled atlases

Spine Version
-------------
Please note that the current spine version is an older version, and as a result of that it will work best with **Spine version 3.2**.
There is a newer version of spine available (Spine-ts, up-to-date with latest spine runtime) but work on that is currently halted for this library.

If you feel like helping out, you're welcome to clone the [spine-ts](https://github.com/azerion/phaser-spine/tree/spine-ts) branch of this library.

Getting Started
---------------
First you want to get a fresh copy of the plugin. You can get it from this repo or from npm, ain't that handy.
```
npm install @azerion/phaser-spine --save-dev
```

Next up you'd want to add it to your list of js sources you load into your game
```html
<script src="path/to/phaser-spine.min.js"></script>
```

After adding the script to the page you can activate it by enabling the plugin:
```javascript
game.add.plugin(PhaserSpine.SpinePlugin);
```


Usage
-----
Like any other asset in Phaser, you need to preload the spine object you want in your game. A spine Javascript export will deliver you three files; *.atlas, *.json and *.png.
The preloader expects these to be in the same folder, and when so you can just preload the json file by adding the following code to your game:

```javascript
game.load.spine(
    'buddy',                        //The key used for Phaser's cache
    'assets/buddy_skeleton.json'    //The location of the spine's json file
    );
```

Now you can just add the spine animation to your game:
```javascript
buddy = game.add.spine(
    400,        //X positon
    300,        //Y position
    'buddy'     //the key of the object in cache
);
```

### Playing animations
Phaser-spine uses the same API as the original runtime for playing an animation, after adding the spine object to your game, you can call the following function on your object:
```javascript
buddy.setAnimationByName(
    0,          //Track index
    "idle",     //Animation's name
    true        //If the animation should loop or not
);
```

### Handling events
You can handle Spine events, just add your callback to Spine.onEvent, it's regular [Phaser.Signal](https://phaser.io/docs/2.6.2/Phaser.Signal.html) object. Your callback should be defined with two arguments: event index (number) and event object (Spine.Event):

```javascript
spineboy.onEvent.add(function (i,e) {
    console.log('name=' + e.data.name + ' int=' + e.intValue + ' float=' + e.floatValue + ' string=' + e.stringValue);
}
```


### Crossfading animations
Stacking animations in spine is rather simple, you just add non-looping animations on top of eachother:
```javascript
spineboy.setAnimationByName(0, "jump", false);  //We'd like to show this animation once
spineboy.addAnimationByName(0, "walk", true);   //And after the previous animations is finished, we continue with this one
```

Now this will just simply chain the animation, and it will look a bit akward. Spine solves this by adding mixes that tell spine how to transition nicely from one animation to another.
You can set mixes in phaser spine as well by doing the following:
```javascript
spineboy.setMixByName("walk", "jump", 0.2); //transition from walk to jump and fade/blend it over a period of 0.2 seconds
spineboy.setMixByName("jump", "walk", 0.4); //transition from jump to walk and fade/blend it over a period of 0.4 seconds
```

### Switching skins
Another great additions to spine is the support of skins and the ability to freely switch between them. Like animations this is simple and we use the same API as the runtime.
Don't forget to call setToSetupPose after switching skins to update all attachments correctly.
```javascript
buddy.setSkinByName('outfit01');
buddy.setToSetupPose();
```

### Combining skins
Now the last final awesome part is that you can also create skins in code yourself by simply grouping other existing skins.
```javascript
var newSkin = buddy.createCombinedSkin(
    'outfit02',     //The name of the new skin, will be automaticly added to the skeleton data
    'vest',         //One of the skins we want to combine
    'mask'          //The other skin we want to combine
);

//Setting the new skin can be set with:
buddy.setSkin(newSkin);
//Or by referencing the new name
buddy.setSkinByName(outfit02);

//And then we shouldn't forget to setToSetupPose ;)
buddy.setToSetupPose();
```

### Scaled atlases
In Spine it's possible to define different scales for your export atlases, including a special suffix that will be suffixed to each atlas name. By default this plugin assumes that no scale is configured, ergo everything is set with scale=1.
If you export your atlases to a smaller scale, than this will only happen to the images, the original bone structure will still be defined at the original size you defined in your spine project.

If the exported image is scaled up (or down), than this has to be inverted by the runtime in order to have the correct size of the images for the attachments. In order to do do this correctly, the suffix for a scale any other than 1 has to be set.
By default this plugin parses the suffix with a regular expression that looks for numbers start with @ and ending by x. So an atlas file with a scale of 0.5 should have a suffix of @0.5x and the resultion file name would be spineBoy@0.5x.atlas.

If you'd like a different setup you can do so by supplying a new RegExp object to the follow property:
```javascript
PhaserSpine.SpinePlugin.RESOLUTION_REGEXP = /#(.+)r/;
```
Now the Spine plugin will look for suffixes that look like: #0.5r

The next step is to tell the preloader which scaling variants are available for loading, by adding them as an array in the 3rd optional parameter:
```javascript
game.load.spine('shooter', "shooter.json", ['@0.7x', '@0.5x']);
```
The preloader will load 1 json (with all the skeleton/animation data), and 2 images and 2 atlas files.

Later in your game, when you create a new spine object, you again need to add the scaling variant you would like to have for your game. This way you can conditionally load different assets.
If you pass no scaling variant to the object, it will just get the first variant from the array supplied when you preload the spine object.
```javascript
shooter = game.add.spine(400, 300, "shooter", '@0.7x');
//the above is equal to:
shooter = game.add.spine(400, 300, "shooter");
//because @0.7x is the first element of the array supplied to the preloader
```


Todo
----
 - adding a body for physics
 - Handling input

Credits
-------
Credit due, where credit's due as my mom always said. This version of phaser-spine is based on the original work by [Studio krok's PhaserSpine](https://github.com/StudioKrok/PhaserSpine)

Disclaimer
----------
We at Azerion just love playing and creating
awesome games. We aren't affiliated with Phaser.io and/or esotericsoftware. We just needed some awesome spine animations in our awesome HTML5 games. Feel free to use it for enhancing your own awesome games!

Phaser Spine is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.

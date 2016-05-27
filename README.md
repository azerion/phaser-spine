Phaser Spine
============

Spine plugin for Phaser, it works, somehow.. No? Submit an issue, otherwise have fun :)

Key features:

* Spine for Phaser! :o
* Skin support
* Possible to combine skins
* Mixes and fading animations

Getting Started
---------------
First you want to get a fresh copy of the plugin. You can get it from this repo or from npm, ain't that handy.
```
npm install phaser-spine --save-dev
```

Next up you'd want to add it to your list of js sources you load into your game
```html
<script src="path/to/phaser-spine.min.js"></script>
```

After adding the script to the page you can activate it by enabling the plugin:
```javascript
game.add.plugin(Fabrique.Plugins.Spine);
```


Usage
-----

Like any other asset in Phaser, you need to preload the spine object you want in your game. A spine Javascript export will deliver you three files; *.atlas, *.json and *.png.
The preloader expects these to be in the same folder, and when so you can just preload the json file by adding the following code to youre game:

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
Don't forget to call setToSetupPose after switching skings to update all attachments correctly.
```javascript
buddy.setSkinByName('outfit01');
buddy.setToSetupPose();
```

### Combining skins
Now the last final awesome part is that you can also create skins in code yourself by simply grouping other existing skins.
```javascript
var newSkin = buddy.getCombinedSkin(
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

Todo
----
 - adding a body for physics
 - Handling input

Credits
-------
Credit due, where credit's due as my mom always said. This version of phaser-spine is based on the original work by [Studio krok's PhaserSpine](https://github.com/StudioKrok/PhaserSpine)

Disclaimer
----------
We at OrangeGames just love playing and creating
awesome games. We aren't affiliated with Phaser.io and/or esotericsoftware. We just needed some awesome spine animations in our awesome HTML5 games. Feel free to use it for enhancing your own awesome games!

Phaser Spine is distributed under the MIT license. All 3rd party libraries and components are distributed under their
respective license terms.

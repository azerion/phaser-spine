function setupUI () {
    var setupRendererUI = function(){
        var rendererList = $("#rendererList");

        rendererList.children().each(function(i){
            $(this).attr('selected', i === game.renderType);
        })

        rendererList.change(function(){
            var rendererName = $("#rendererList option:selected").attr('value');
            location.href = location.href.split('?')[0] + '?' + rendererName;
        })
    }

    var skeletonList = $("#skeletonList");
    for (var skeletonName in spines) {
        var option = $("<option></option>");
        option.attr("value", skeletonName).text(skeletonName);
        if (skeletonName === activeSpine) option.attr("selected", "selected");
        skeletonList.append(option);
    }
    var setupAnimationUI = function() {
        var animationList = $("#animationList");
        animationList.empty();
        var skeleton = spines[activeSpine].skeleton;
        var state = spines[activeSpine].state;
        console.log(state);
        var activeAnimation = state.tracks[0].animation.name;
        for (var i = 0; i < skeleton.data.animations.length; i++) {
            var name = skeleton.data.animations[i].name;
            var option = $("<option></option>");
            option.attr("value", name).text(name);
            if (name === activeAnimation) option.attr("selected", "selected");
            animationList.append(option);
        }

        animationList.change(function() {
            var state = spines[activeSpine].state;
            var skeleton = spines[activeSpine].skeleton;
            var animationName = $("#animationList option:selected").text();
            skeleton.setToSetupPose();
            state.setAnimation(0, animationName, true);
        })
    }

    var setupSkinUI = function() {
        var skinList = $("#skinList");
        skinList.empty();
        var skeleton = spines[activeSpine].skeleton;
        var activeSkin = skeleton.skin == null ? "default" : skeleton.skin.name;
        for (var i = 0; i < skeleton.data.skins.length; i++) {
            var name = skeleton.data.skins[i].name;
            var option = $("<option></option>");
            option.attr("value", name).text(name);
            if (name === activeSkin) option.attr("selected", "selected");
            skinList.append(option);
        }

        skinList.change(function() {
            var skeleton = spines[activeSpine].skeleton;
            var skinName = $("#skinList option:selected").text();
            skeleton.setSkinByName(skinName);
            skeleton.setSlotsToSetupPose();
        })
    };

    var setupDebug = function () {
        var debugList = $("#debugList");
        debugList.change(function () {
            PhaserSpine.SpinePlugin.DEBUG = $("#debugList option:selected").text() === 'true';
        });

        var triangleList = $("#triangleList");
        triangleList.change(function () {
            PhaserSpine.SpinePlugin.TRIANGLE = $("#triangleList option:selected").text() === 'true';
        });
    };

    skeletonList.change(function() {
        spines[activeSpine].visible = false;
        activeSpine = $("#skeletonList option:selected").text();
        spines[activeSpine].visible = true;

        setupAnimationUI();
        setupSkinUI();
    });
    setupRendererUI();
    setupAnimationUI();
    setupSkinUI();
    setupDebug();
}
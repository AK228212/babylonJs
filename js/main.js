window.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("renderCanvas");

  var engine = new BABYLON.Engine(canvas, true);

  createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -10),
      scene
    );

    // Targeting the camera to scene origin
    camera.setTarget(new BABYLON.Vector3.Zero());

    // Attaching the camera to canvas
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    //create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    var sphere = new BABYLON.Mesh.CreateSphere("Sphere", 16, 2, scene);

    // Move the Sphere upward meanse in y axis
    sphere.position.y = 1;

    var inputMap = {};
    var name;
    // This sceneloader is for loading gltf models it constructor takes : location, name, scene
    var character = new BABYLON.SceneLoader.ImportMesh(
      "",
      "./assets/undercover_cop_-_animated/",
      "scene.gltf",
      scene,
      async function (newMeshes, particleSystems, skeletons, animationGroups) {
        try {
          var dude = newMeshes[0];
          name = dude.name;
          console.log("This is for dude", dude.name);
          var animations = animationGroups;
          console.log(animations);

          var idleRange = animations[2];
          var walkRange = animations[0];
          var breathingIdleRange = animations[1];

          animations[0].stop();

          dude.position = new BABYLON.Vector3(1.5, 1, 0);
          scene.actionManager = new BABYLON.ActionManager(scene);
          scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnKeyDownTrigger,
              function (evt) {
                inputMap[evt.sourceEvent.key] =
                  evt.sourceEvent.type == "keydown";
              }
            )
          );
          scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
              BABYLON.ActionManager.OnKeyUpTrigger,
              function (evt) {
                inputMap[evt.sourceEvent.key] =
                  evt.sourceEvent.type == "keydown";
              }
            )
          );
          dude.rotationQuaternion = null;
          scene.onBeforeRenderObservable.add(() => {
            if (inputMap["ArrowUp"]) {
              dude.position.z += 0.1;
              animations[0].play();
            }
            if (inputMap["ArrowLeft"]) {
              dude.position.x -= 0.1;
              animations[0].play();
              dude.rotation.y -= 0.01;
            }
            if (inputMap["ArrowDown"]) {
              dude.position.z -= 0.1;
              animations[0].play();
              dude.rotation.y += 0.01;
            }
            if (inputMap["ArrowRight"]) {
              dude.position.x += 0.1;
              animations[0].play();
              dude.rotation.y += 0.01;
            }

            //Adding follow Camera
          });
          console.log("This is dude name", name);
          createFollowCamera(scene, dude);
        } catch (e) {
          console.log(e);
        }
      }
    );

    // console.log(character);
    // create a built-in "ground" shape;
    var ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 10, scene);

    // To add the texture
    var groundTexture = new BABYLON.StandardMaterial("grounfTexture", scene);
    // Give the location of texture
    groundTexture.diffuseTexture = new BABYLON.Texture(
      "./assets/ground_texture.jpg",
      scene
    );

    ground.material = groundTexture;

    return scene;
  };

  var scene = createScene();

  //   This is run render Loop
  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });

  var animationBlending = function* (toAnim, fromAnim) {
    let currentWeight = 1;
    let newWeight = 0;

    toAnim.play(true);

    while (newWeight < 1) {
      newWeight += 0.01;
      currentWeight -= 0.01;
      toAnim.setWeightForAllAnimatables(newWeight);
      fromAnim.setWeightForAllAnimatables(currentWeight);
      yield;
    }
  };

  function createFollowCamera(scene, target) {
    var followCamera = new BABYLON.FollowCamera(
      "FollowCamera",
      target.position,
      scene,
      target
    );
    followCamera.radius = 10;
    followCamera.heightOffset = 6;
    followCamera.rotationOffset = 0;
    followCamera.cameraAcceleration = 0.1;
    followCamera.maxCameraSpeed = 5;

    scene.activeCamera = followCamera;
    return followCamera;
  }
});

var game = new Phaser.Game(800, 600, Phaser.CANVAS, "phaser-example", {
  preload: preload,
  create: create,
  update: update,
  render: render
});

function preload() {
  game.load.image("space", "assets/deep-space.jpg");
  game.load.image("bullet", "assets/bullets.png");
  game.load.image("ship", "assets/ship.png");
  game.load.image("asteroid1", "assets/asteroid1.png");
  game.load.image("asteroid2", "assets/asteroid2.png");
  game.load.image("asteroid3", "assets/asteroid3.png");
}

var sprite;
var cursors;

var bullet;
var bullets;
var bulletTime = 0;

var asteroids;

function create() {
  game.renderer.clearBeforeRender = false;
  game.renderer.roundPixels = true;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Bakground
  game.add.tileSprite(0, 0, game.width, game.height, "space");

  // Asteroids
  asteroids = game.add.group();
  asteroids.enableBody = true;
  asteroids.physicsBodyType = Phaser.Physics.ARCADE;
  asteroids.createMultiple(10, "asteroid1");
  asteroids.createMultiple(10, "asteroid2");
  asteroids.createMultiple(10, "asteroid3");
  asteroids.setAll("anchor.x", 0.5);
  asteroids.setAll("anchor.y", 0.5);

  // Player bullets
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, "bullet");
  bullets.setAll("anchor.x", 0.5);
  bullets.setAll("anchor.y", 0.5);

  // Player
  sprite = game.add.sprite(300, 300, "ship");
  sprite.anchor.set(0.5);
  game.physics.enable(sprite, Phaser.Physics.ARCADE);

  sprite.body.drag.set(100);
  sprite.body.maxVelocity.set(200);

  // Game input
  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {
  // Asteroid movement
  var asteroid = asteroids.getFirstExists(false);
  while (asteroid) {
    // Randomly place asteroids
    asteroid.reset(game.rnd.integerInRange(game.world.width, 0), game.rnd.integerInRange(game.world.height, 0));
    asteroid.angle = game.rnd.integerInRange(0, 360);
    asteroid.body.velocity.x = game.rnd.integerInRange(-20, 20);
    asteroid.body.velocity.y = game.rnd.integerInRange(-20, 20);

    // Get the next one
    var asteroid = asteroids.getFirstExists(false);
  }
  // Player movement
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(
      sprite.rotation,
      200,
      sprite.body.acceleration
    );
  } else {
    sprite.body.acceleration.set(0);
  }

  if (cursors.left.isDown) {
    sprite.body.angularVelocity = -300;
  } else if (cursors.right.isDown) {
    sprite.body.angularVelocity = 300;
  } else {
    sprite.body.angularVelocity = 0;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    fireBullet();
  }

  screenWrap(sprite);

  bullets.forEachExists(screenWrap, this);
}

function fireBullet() {
  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {
      bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
      bullet.lifespan = 2000;
      bullet.rotation = sprite.rotation;
      game.physics.arcade.velocityFromRotation(
        sprite.rotation,
        400,
        bullet.body.velocity
      );
      bulletTime = game.time.now + 50;
    }
  }
}

function screenWrap(sprite) {
  if (sprite.x < 0) {
    sprite.x = game.width;
  } else if (sprite.x > game.width) {
    sprite.x = 0;
  }

  if (sprite.y < 0) {
    sprite.y = game.height;
  } else if (sprite.y > game.height) {
    sprite.y = 0;
  }
}

function render() {}

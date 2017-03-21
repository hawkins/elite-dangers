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
  game.load.image("enemyship", "assets/enemy-ship.png");
  game.load.image("asteroid1", "assets/asteroid1.png");
  game.load.image("asteroid2", "assets/asteroid2.png");
  game.load.image("asteroid3", "assets/asteroid3.png");
}

var playerHealth = 10;

var player;
var cursors;

var bullet;
var bullets;
var bulletTime = 0;

var asteroids;

var enemies;

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

  // Enemies
  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.createMultiple(10, "enemyship");
  enemies.setAll("anchor.x", 0.5);
  enemies.setAll("anchor.y", 0.5);

  // Player bullets
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, "bullet");
  bullets.setAll("anchor.x", 0.5);
  bullets.setAll("anchor.y", 0.5);

  // Player
  player = game.add.sprite(300, 300, "ship");
  player.anchor.set(0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.drag.set(100);
  player.body.maxVelocity.set(200);

  // Game input
  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {
  // Asteroid movement
  var asteroid = asteroids.getFirstExists(false);
  while (asteroid) {
    // Randomly place asteroids
    asteroid.reset(
      game.rnd.integerInRange(game.world.width, 0),
      game.rnd.integerInRange(game.world.height, 0)
    );
    asteroid.angle = game.rnd.integerInRange(0, 360);
    asteroid.body.velocity.x = game.rnd.integerInRange(-20, 20);
    asteroid.body.velocity.y = game.rnd.integerInRange(-20, 20);

    asteroid.health = game.rnd.integerInRange(1, 6);

    // Get the next one
    var asteroid = asteroids.getFirstExists(false);
  }

  // Enemy movement
  var enemy = enemies.getFirstExists(false);
  while (enemy) {
    // Randomly place asteroids
    enemy.reset(
      game.rnd.integerInRange(game.world.width, 0),
      game.rnd.integerInRange(game.world.height, 0)
    );
    enemy.angle = game.rnd.integerInRange(0, 360);

    enemy.health = game.rnd.integerInRange(1, 20);

    // Get the next one
    var enemy = enemies.getFirstExists(false);
  }

  // Player movement
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(
      player.rotation,
      200,
      player.body.acceleration
    );
  } else {
    player.body.acceleration.set(0);
  }

  if (cursors.left.isDown) {
    player.body.angularVelocity = -300;
  } else if (cursors.right.isDown) {
    player.body.angularVelocity = 300;
  } else {
    player.body.angularVelocity = 0;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    fireBullet();
  }

  screenWrap(player);
  bullets.forEachExists(screenWrap, this);
  asteroids.forEachExists(screenWrap, this);

  game.physics.arcade.collide(asteroids, asteroids);
  game.physics.arcade.collide(asteroids, player, onAsteroidPlayerCollision);
  game.physics.arcade.overlap(asteroids, bullets, onAsteroidBulletCollision);
  game.physics.arcade.collide(asteroids, enemies, onAsteroidEnemyCollision);
  game.physics.arcade.collide(player, enemies, onPlayerEnemyCollision);
  game.physics.arcade.overlap(enemies, bullets, onEnemyBulletCollision);
}

function fireBullet() {
  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {
      bullet.reset(player.body.x + 16, player.body.y + 16);
      bullet.lifespan = 2000;
      bullet.rotation = player.rotation;
      game.physics.arcade.velocityFromRotation(
        player.rotation,
        400,
        bullet.body.velocity
      );
      bulletTime = game.time.now + 50;
    }
  }
}

function screenWrap(player) {
  if (player.x < 0) {
    player.x = game.width;
  } else if (player.x > game.width) {
    player.x = 0;
  }

  if (player.y < 0) {
    player.y = game.height;
  } else if (player.y > game.height) {
    player.y = 0;
  }
}

function render() {
  game.debug.text(`Player health: ${playerHealth.toFixed(1)}`, 10, 20);
}

function onAsteroidPlayerCollision(asteroid, player) {
  playerHealth -= 0.1;
}

function onAsteroidBulletCollision(asteroid, bullet) {
  bullet.kill();
  // TODO: Play sound here

  asteroid.health--;

  if (asteroid.health <= 0) {
    // TODO: Play sound here
    asteroid.kill();

    healPlayer(1);
  }
}

function onAsteroidEnemyCollision(asteroid, enemy) {
  enemy.health -= 0.25;

  if (enemy.health <= 0) {
    // TODO: Play sound here
    enemy.kill();
  }
}

function onPlayerEnemyCollision(player, enemy) {
  enemy.health -= 5;

  playerHealth -= 4;

  if (enemy.health <= 0) {
    // TODO: Play sound here
    enemy.kill();
  }
}

function onEnemyBulletCollision(enemy, bullet) {
  enemy.health -= 1;

  if (enemy.health <= 0) {
    // TODO: Play sound here
    enemy.kill();
  }
}

function healPlayer(health) {
  playerHealth = health + playerHealth;
  if (playerHealth > 10) {
    playerHealth = 10;
  }
}

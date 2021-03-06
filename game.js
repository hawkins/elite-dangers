var game = new Phaser.Game(
  window.innerWidth,
  window.innerHeight,
  Phaser.CANVAS,
  "root",
  {
    create: create,
    update: update,
    preload: preload
  }
);

const dialogue = [
  [
    " ",
    " ",
    "Josh Hawkins presents",
    " ",
    " ",
    "Elite Dangers",
    " ",
    "You: Jeez... what just happened?",
    "Where... am I?",
    "Ship's in bad shape...",
    "Wait... how? I can't remember anything...",
    "   ",
    "Jeez, this headache...",
    "   ",
    "Shit, engine's down...",
    "Better get some ore to repair it.",
    "<i>Press (SPACE) to shoot at the asteroid."
  ],
  [
    "???: THERE HE IS!! Destroy him!",
    "You: Great... let's hope this damn engine still works!",
    "<i>Steer with arrow keys (Left), (Right), throttle with (Up)."
  ],
  [
    "<i>Engines are failing!",
    "???: Take that, pirate scum!!",
    "???: All units, return to base!",
    "<i>The world will never know...",
    "<i>what really happened to you.",
    " ",
    "<i>Game Over."
  ],
  [
    "???: HE'S TOO STRONG!! RETREAT!!",
    "???: All units, fall back!",
    " ",
    "You: Who... were those things?",
    "Guess we'll never know...",
    " ",
    "<i>Congratulations!"
  ]
];

const style = {
  font: "bold 30pt Courier",
  fill: "#ecf0f1",
  stroke: "#2c3e50",
  strokeThickness: 2,
  wordWrap: true,
  wordWrapWidth: game.width - 32,
  boundsAlignH: "center",
  boundsAlignV: "middle",
  align: "center"
};
const italicStyle = {
  font: "bold 30pt Courier",
  fill: "#ecf0f1",
  stroke: "#2c3e50",
  strokeThickness: 2,
  fontStyle: "italic",
  wordWrap: true,
  wordWrapWidth: game.width - 32,
  boundsAlignH: "center",
  boundsAlignV: "middle",
  align: "center"
};
const reinforcementsStyle = {
  font: "20px Courier",
  fill: "#ecf0f1",
  stroke: "#2c3e50",
  boundsAlignH: "center",
  boundsAlignV: "middle",
  align: "center"
};

var healthBar;

var storyMusic;
var battleMusic;
var victoryMusic;
var gameOverMusic;

var enemyBulletSound;
var playerBulletSound;
var bulletHitSound;
var explosionSound;

const asteroidHealing = 3;
const maxPlayerHealth = 100;
var playerHealth = maxPlayerHealth - asteroidHealing;
var reinforcements = 100;

var player;
var cursors;

var explosions;
var bullet;
var bullets;
var enemyBullets;
var bulletTime = 0;

var asteroids;

var enemies;
const maxRotationDiff = 0.0174533;

var reinforcementsText;
var text;
var dialogueIndex = 0;
var lineIndex = -1;
var line = "";
var firstUpdate = true;

// State controls
var enemiesInvading = false;
var enemiesHaveInvaded = false;
var gameOver = false;

function preload() {
  game.load.image("space", "assets/deep-space.jpg");
  game.load.image("bullet", "assets/bullets.png");
  game.load.image("enemybullet", "assets/enemybullets.png");
  game.load.image("ship", "assets/ship.png");
  game.load.image("enemyship", "assets/enemy-ship.png");
  game.load.image("asteroid1", "assets/asteroid1.png");
  game.load.image("asteroid2", "assets/asteroid2.png");
  game.load.image("asteroid3", "assets/asteroid3.png");
  game.load.spritesheet(
    "asteroid1_destroy",
    "assets/asteroid1_destroy.png",
    32,
    32
  );
  game.load.spritesheet(
    "asteroid2_destroy",
    "assets/asteroid2_destroy.png",
    32,
    32
  );
  game.load.spritesheet(
    "asteroid3_destroy",
    "assets/asteroid3_destroy.png",
    32,
    32
  );
  game.load.spritesheet("explosion", "assets/explosion.png", 64, 64);
  game.load.audio("story", "assets/story.ogg");
  game.load.audio("battle", "assets/battle.mp3");
  game.load.audio("victory", "assets/victory.mp3");
  game.load.audio("gameover", "assets/gameover.mp3");
  game.load.audio("enemyfire", "assets/enemyfire.wav");
  game.load.audio("playerfire", "assets/playerfire.wav");
  game.load.audio("explosion", "assets/explosion.mp3");
  game.load.audio("bullethit", "assets/bullethit.wav");
}

function create() {
  game.renderer.clearBeforeRender = false;
  game.renderer.roundPixels = true;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Background
  game.add.tileSprite(0, 0, game.width, game.height, "space");

  // Sound effects
  enemyBulletSound = game.add.audio("enemyfire");
  playerBulletSound = game.add.audio("playerfire");
  explosionSound = game.add.audio("explosion");
  bulletHitSound = game.add.audio("bullethit");

  // Music
  storyMusic = game.add.audio("story");
  battleMusic = game.add.audio("battle");
  victoryMusic = game.add.audio("victory");
  gameOverMusic = game.add.audio("gameover");
  storyMusic.play(null, null, 1, true);

  // Asteroids
  asteroids = game.add.group();
  asteroids.enableBody = true;
  asteroids.physicsBodyType = Phaser.Physics.ARCADE;
  asteroids.createMultiple(5, "asteroid1_destroy");
  asteroids.createMultiple(5, "asteroid2_destroy");
  asteroids.createMultiple(5, "asteroid3_destroy");
  asteroids.setAll("anchor.x", 0.5);
  asteroids.setAll("anchor.y", 0.5);
  asteroids.callAll("animations.add", "animations", "asteroid1_destroy");
  asteroids.callAll("animations.add", "animations", "asteroid2_destroy");
  asteroids.callAll("animations.add", "animations", "asteroid3_destroy");

  // Enemies
  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.createMultiple(5, "enemyship");
  enemies.setAll("anchor.x", 0.5);
  enemies.setAll("anchor.y", 0.5);
  enemies.setAll("body.drag", 100);
  enemies.setAll("maxVelocity", 100);
  enemies.forEach(enemy => {
    enemy.bulletTime = game.time.now + 100;
  });

  // Explosions
  explosions = game.add.group();
  for (var i = 0; i < 50; i++)
    explosions.create(0, 0, "explosion", [0], false);
  explosions.setAll("anchor.x", 0.5);
  explosions.setAll("anchor.y", 0.5);
  explosions.callAll("animations.add", "animations", "explode");

  // Player bullets
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, "bullet");
  bullets.setAll("anchor.x", 0.5);
  bullets.setAll("anchor.y", 0.5);

  // Enemy bullets
  enemyBullets = game.add.group();
  enemyBullets.enableBody = true;
  enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
  enemyBullets.createMultiple(40, "enemybullet");
  enemyBullets.setAll("anchor.x", 0.5);
  enemyBullets.setAll("anchor.y", 0.5);

  // Player
  player = game.add.sprite(game.world.centerX, game.height / 1.5, "ship");
  player.angle = 270;
  player.anchor.set(0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.drag.set(100);
  player.body.maxVelocity.set(200);

  // Health bar
  healthBar = new HealthBar(game, {
    x: game.world.centerX,
    y: game.height - 20,
    width: game.width,
    bar: { color: "#ed3838" },
    bg: { color: "#f7f7f7" }
  });
  healthBar.setPercent(playerHealth);

  // Dialogue text
  text = game.add.text(game.world.centerX, 100, "", style);
  text.anchor.setTo(0.5);
  nextLine();

  // Reinforcements text
  reinforcementsText = game.add.text(
    game.world.centerX,
    game.height - 50,
    "",
    reinforcementsStyle
  );
  reinforcementsText.anchor.setTo(0.5);

  // Game input
  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}

function update() {
  // Update asteroids
  var asteroid = asteroids.getFirstExists(false);

  if (firstUpdate) {
    // Spawn first asteroid for story
    asteroid.reset(game.world.centerX, game.height / 2.5);
    asteroid.angle = game.rnd.integerInRange(0, 360);
    asteroid = asteroids.getFirstExists(false);
    asteroid.health = 1;

    firstUpdate = false;
  }

  while (asteroid) {
    // Randomly place asteroids
    asteroid.reset(
      game.rnd.integerInRange(game.world.width, 0),
      game.rnd.integerInRange(game.world.height, 0)
    );
    asteroid.animations.stop(null, true);
    asteroid.angle = game.rnd.integerInRange(0, 360);
    asteroid.body.velocity.x = game.rnd.integerInRange(-20, 20);
    asteroid.body.velocity.y = game.rnd.integerInRange(-20, 20);

    asteroid.health = game.rnd.integerInRange(1, 5);

    // Get the next one
    asteroid = asteroids.getFirstExists(false);
  }

  // Enemy movement
  var enemy = enemies.getFirstExists(false);
  while (enemy) {
    if (enemiesInvading) {
      // Spawn 5, have them slide up map a bit, while looking at player
      for (var i = 1; i < 6; i++) {
        enemy.reset(game.width * 0.1667 * i, game.height - 41);
        enemy.rotation = game.physics.arcade.angleBetween(enemy, player);
        enemy.body.velocity.y = -50;
        enemy = enemies.getFirstExists(false);
      }

      enemiesInvading = false;
    } else if (enemiesHaveInvaded) {
      // Regular behavior
      enemy.reset(
        game.rnd.integerInRange(game.world.width, 0),
        game.rnd.integerInRange(game.world.height, 0)
      );
      enemy.angle = game.rnd.integerInRange(0, 360);

      enemy.health = game.rnd.integerInRange(1, 20);

      // Get the next one
      enemy = enemies.getFirstExists(false);
    } else {
      break;
    }
  }

  // Enemies face player
  enemies.forEachExists(enemy => {
    if (gameOver) {
      // Retreat behavior
      enemy.rotation = game.physics.arcade.angleBetween(enemy, {
        x: enemy.x,
        y: game.height + 100
      });
      game.physics.arcade.velocityFromRotation(
        enemy.rotation,
        200,
        enemy.body.velocity
      );
    } else {
      // Regular behavior
      // Find closest wrapped location
      var wrapX;
      var wrapY;
      if (enemy.x > player.x) wrapX = player.x + game.width;
      else wrapX = player.x - game.width;
      if (enemy.y > player.y) wrapY = player.y + game.height;
      else wrapY = player.y - game.height;

      const points = [
        { x: player.x, y: player.y },
        { x: wrapX, y: player.y },
        { x: player.x, y: wrapY }
      ];
      var closest = { x: player.x, y: player.y };
      var closestDistance = game.physics.arcade.distanceBetween(enemy, closest);
      points.forEach(point => {
        const distance = game.physics.arcade.distanceBetween(enemy, point);
        if (distance < closestDistance) {
          closest = point;
          closestDistance = distance;
        }
      });

      idealRotation = game.physics.arcade.angleBetween(enemy, closest);

      if (idealRotation > enemy.rotation + maxRotationDiff)
        enemy.rotation += maxRotationDiff;
      else if (idealRotation < enemy.rotation - maxRotationDiff)
        enemy.rotation -= maxRotationDiff;
      else
        enemy.rotation = idealRotation;

      if (enemiesHaveInvaded) {
        if (Math.abs(idealRotation - enemy.rotation) < 3 * maxRotationDiff && player.alive) {
          fireEnemyBullet(enemy);
        }

        game.physics.arcade.velocityFromRotation(
          enemy.rotation,
          200,
          enemy.body.velocity
        );
      }
    }
  });

  // Story
  if (
    dialogueIndex === 1 &&
    lineIndex > 2 &&
    (cursors.up.isDown ||
      cursors.left.isDown ||
      cursors.right.isDown ||
      cursors.left.isDown)
  ) {
    // Begin normal game
    enemiesHaveInvaded = true;

    // Reset text
    line = "";
    text.setText(line);
  }

  // Player movement
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(
      player.rotation,
      300,
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
  enemyBullets.forEachExists(screenWrap, this);
  if (!gameOver) enemies.forEachExists(screenWrap, this);

  game.physics.arcade.collide(asteroids, asteroids);
  game.physics.arcade.collide(asteroids, player, onAsteroidPlayerCollision);
  game.physics.arcade.overlap(asteroids, bullets, onAsteroidBulletCollision);
  game.physics.arcade.overlap(
    asteroids,
    enemyBullets,
    onAsteroidEnemyBulletCollision
  );
  game.physics.arcade.collide(asteroids, enemies, onAsteroidEnemyCollision);
  game.physics.arcade.collide(player, enemies, onPlayerEnemyCollision);
  game.physics.arcade.overlap(enemies, bullets, onEnemyBulletCollision);
  game.physics.arcade.overlap(
    player,
    enemyBullets,
    onPlayerEnemyBulletCollision
  );

  // Update reinforcements text
  if (enemiesHaveInvaded && reinforcements > 0)
    reinforcementsText.setText(`Enemy reinforcements: ${reinforcements}`);
  else
    reinforcementsText.setText("");
}

function screenWrap(player) {
  if (player.x < 0) {
    player.x = game.width;
  } else if (player.x > game.width) {
    player.x = 0;
  }

  if (player.y < 0) {
    player.y = game.height - 40;
  } else if (player.y > game.height - 40) {
    player.y = 0;
  }
}

function fireBullet() {
  if (player.alive && game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {
      // Play sound
      playerBulletSound.play(null, null, 0.75);

      // Create bullet
      bullet.reset(player.body.x + 16, player.body.y + 16);
      bullet.lifespan = 2000;
      bullet.rotation = player.rotation;
      game.physics.arcade.velocityFromRotation(
        player.rotation,
        450,
        bullet.body.velocity
      );
      bulletTime = game.time.now + 100;
    }
  }
}

function onAsteroidPlayerCollision(asteroid, player) {
  hurtPlayer(0.1);
}

function onAsteroidBulletCollision(asteroid, bullet) {
  // Play sound here
  bulletHitSound.play();

  hurtAsteroid(asteroid, 1);
  bullet.kill();

  if (dialogueIndex === 0 && lineIndex > 14) {
    text.setText("");
    line = "";
    dialogueIndex = 1;
    lineIndex = -1;
    nextLine();

    // Allow enemies to invade in a few seconds
    setTimeout(
      () => {
        enemiesInvading = true;
        storyMusic.stop();
        battleMusic.play(null, null, 1, true);
      },
      2000
    );
  }
}

function onAsteroidEnemyBulletCollision(asteroid, bullet) {
  hurtAsteroid(asteroid, 1);
  bullet.kill();
}

function onAsteroidEnemyCollision(asteroid, enemy) {
  hurtEnemy(enemy, 0.25);
}

function onPlayerEnemyCollision(player, enemy) {
  hurtEnemy(enemy, 5);
  hurtPlayer(4);
}

function onEnemyBulletCollision(enemy, bullet) {
  // Play sound here
  bulletHitSound.play();

  hurtEnemy(enemy, 1);

  bullet.kill();
}

function onPlayerEnemyBulletCollision(player, bullet) {
  bulletHitSound.play();
  bullet.kill();
  hurtPlayer(1);
}

function fireEnemyBullet(enemy) {
  if (game.time.now > enemy.bulletTime) {
    bullet = enemyBullets.getFirstExists(false);

    if (bullet) {
      // Play sound
      enemyBulletSound.play();

      // Create bullet
      bullet.reset(enemy.body.x + 16, enemy.body.y + 16);
      bullet.lifespan = 2000;
      bullet.rotation = enemy.rotation;
      game.physics.arcade.velocityFromRotation(
        enemy.rotation,
        400,
        bullet.body.velocity
      );
      enemy.bulletTime = game.time.now + 3000;
    }
  }
}

function healPlayer(health) {
  if (!gameOver && dialogueIndex < 2) {
    playerHealth = health + playerHealth;
    if (playerHealth > maxPlayerHealth) {
      playerHealth = maxPlayerHealth;
    }
    healthBar.setPercent(playerHealth);
  }
}

function hurtPlayer(damage) {
  if (dialogueIndex >= 1 && reinforcements > 0) {
    playerHealth -= damage;

    if (playerHealth <= 0) {
      playerHealth = 0;

      explosion = explosions.getFirstExists(false);
      if (explosion) {
        explosion.reset(player.x, player.y);
        explosion.play("explode", 15, false, true);
        player.kill();
      }

      // End game after a few seconds
      setTimeout(
        () => {
          gameOver = true;
        },
        7000
      );

      // Play defeat dialogue
      dialogueIndex = 2;
      line = "";
      lineIndex = -1;
      text.setText(line);
      nextLine();

      // Play defeat music
      battleMusic.stop();
      gameOverMusic.play();
    }
    healthBar.setPercent(playerHealth);
  }
}

function hurtEnemy(enemy, damage) {
  enemy.health -= damage;

  if (enemy.health <= 0) {
    reinforcements -= 1;

    // If game just finished
    if (reinforcements <= 0 && !gameOver) {
      reinforcements = 0;
      gameOver = true;

      // Play victory dialogue
      dialogueIndex = 3;
      line = "";
      lineIndex = -1;
      text.setText(line);
      nextLine();

      // Play victory music
      battleMusic.stop();
      victoryMusic.play();
      setTimeout(() => {
        storyMusic.play(null, null, 1, true);
      }, 11000);
    }

    // Play sound here
    explosionSound.play(null, null, 1.5);

    // Create explosion
    var explosion = explosions.getFirstExists(false);
    if (explosion) {
      explosion.reset(enemy.x, enemy.y);
      explosion.play("explode", 30, false, true);
    }

    enemy.kill();
  }
}

function hurtAsteroid(asteroid, damage) {
  asteroid.health -= damage;

  if (asteroid.health <= 0) {
    // Play sound here
    explosionSound.play();

    asteroid.play(asteroid.key, 30, false, true);

    healPlayer(asteroidHealing);
  }
}

function nextLine() {
  lineIndex++;

  if (lineIndex < dialogue[dialogueIndex].length) {
    line = "";
    if (dialogue[dialogueIndex][lineIndex].startsWith("<i>")) {
      dialogue[dialogueIndex][lineIndex] = dialogue[dialogueIndex][
        lineIndex
      ].substr(3);
      text.setStyle(italicStyle);
    } else {
      text.setStyle(style);
    }
    game.time.events.repeat(
      50,
      dialogue[dialogueIndex][lineIndex].length + 1,
      updateLine,
      this
    );
  }
}

function updateLine() {
  if (
    dialogue[dialogueIndex][lineIndex] &&
    line.length < dialogue[dialogueIndex][lineIndex].length
  ) {
    line = dialogue[dialogueIndex][lineIndex].substr(0, line.length + 1);
    text.setText(line);
  } else {
    game.time.events.add(Phaser.Timer.SECOND * 2, nextLine, this);
  }
}

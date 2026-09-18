const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WORLD = {
  minX: -420,
  width: 3800,
  height: 540,
  gravity: 0.56,
  groundY: 480,
};

const keys = {};
let jumpPressed = false;
let attackPressed = false;
let dashPressed = false;
let spellPressed = false;

const platforms = [
  { x: -420, y: 480, w: 520, h: 120 },
  { x: 0, y: 480, w: 520, h: 120 },
  { x: 180, y: 350, w: 190, h: 28 },
  { x: 420, y: 250, w: 180, h: 28 },
  { x: 560, y: 480, w: 360, h: 120 },
  { x: 650, y: 330, w: 190, h: 28 },
  { x: 860, y: 240, w: 180, h: 28 },
  { x: 1000, y: 480, w: 260, h: 120 },
  { x: 1080, y: 320, w: 200, h: 28 },
  { x: 1180, y: 420, w: 250, h: 120 },
  { x: 1290, y: 190, w: 170, h: 28 },
  { x: 1450, y: 480, w: 190, h: 120 },
  { x: 1520, y: 350, w: 230, h: 28 },
  { x: 1710, y: 250, w: 190, h: 28 },
  { x: 1780, y: 470, w: 430, h: 70 },
  { x: 2010, y: 350, w: 220, h: 28 },
  { x: 2170, y: 220, w: 180, h: 28 },
  { x: 2260, y: 420, w: 190, h: 120 },
  { x: 2420, y: 320, w: 190, h: 28 },
  { x: 2580, y: 470, w: 220, h: 70 },
  { x: 2700, y: 350, w: 180, h: 28 },
  { x: 2870, y: 250, w: 180, h: 28 },
  { x: 3000, y: 360, w: 200, h: 180 },
  { x: 3200, y: 480, w: 500, h: 120 },
  { x: 3280, y: 330, w: 340, h: 28 },
];

const shrine = { x: 3060, y: 240, w: 90, h: 120 };
const secretWeapon = {
  x: -260,
  y: 430,
  collected: false,
  name: 'Void Edge',
};
const secretSpell = {
  x: -150,
  y: 430,
  collected: false,
  name: 'Eclipse Lance',
};
const rooms = [
  { start: 0, end: 640, name: 'Forgotten Entrance' },
  { start: 640, end: 1180, name: 'Mossbound Galleries' },
  { start: 1180, end: 1740, name: 'Whispering Archives' },
  { start: 1740, end: 2320, name: 'Sunken Crossroads' },
  { start: 2320, end: 2800, name: 'Crystal Warrens' },
  { start: 2800, end: 3200, name: 'The Portal Sanctum' },
  { start: 3200, end: WORLD.width, name: 'Guardian Arena' },
];

function makePlayer() {
  return {
    x: 120,
    y: 300,
    w: 30,
    h: 44,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    jumpCount: 0,
    maxJumps: 2,
    coyote: 0,
    attackTimer: 0,
    attackCooldown: 0,
    attackDirection: 'side',
    attackHitEnemies: new Set(),
    dashCooldown: 0,
    dashTimer: 0,
    invuln: 0,
    health: 6,
    maxHealth: 6,
    soul: 0,
    alive: true,
    hurtFlash: 0,
  };
}

function drawSpells() {
  for (const spell of spells) {
    const x = spell.x - state.cameraX;
    const y = spell.y - state.cameraY;
    if (spell.secret) {
      const direction = spell.vx < 0 ? -1 : 1;
      const pulse = 1 + Math.sin(spell.age * 0.35) * 0.12;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(direction, 1);
      ctx.shadowColor = '#f09cff';
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'rgba(208, 122, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-spell.r * 2.8, 0);
      ctx.lineTo(spell.r * 0.25, -spell.r * 0.9 * pulse);
      ctx.lineTo(spell.r * 2.8, 0);
      ctx.lineTo(spell.r * 0.25, spell.r * 0.9 * pulse);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d47aff';
      ctx.beginPath();
      ctx.moveTo(-spell.r * 2.2, 0);
      ctx.lineTo(spell.r * 1.15, -spell.r * 0.48 * pulse);
      ctx.lineTo(spell.r * 2.4, 0);
      ctx.lineTo(spell.r * 1.15, spell.r * 0.48 * pulse);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff4ff';
      ctx.beginPath();
      ctx.moveTo(spell.r * 2.4, 0);
      ctx.lineTo(spell.r * 0.15, -spell.r * 0.25);
      ctx.lineTo(-spell.r * 1.35, 0);
      ctx.lineTo(spell.r * 0.15, spell.r * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b84dff';
      ctx.globalAlpha = 0.8;
      for (let shard = 0; shard < 3; shard += 1) {
        const offset = 22 + shard * 12;
        ctx.beginPath();
        ctx.moveTo(-offset, 0);
        ctx.lineTo(-offset - 9, -5 + shard * 4);
        ctx.lineTo(-offset - 4, 0);
        ctx.lineTo(-offset - 9, 5 - shard * 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.fillStyle = '#bda7ff';
      ctx.arc(x, y, spell.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = '#f1eaff';
      ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function updateSpells(dt) {
  for (let i = spells.length - 1; i >= 0; i -= 1) {
    const spell = spells[i];
    spell.x += spell.vx * dt;
    spell.life -= dt;
    spell.age += dt;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const hitbox = { x: spell.x - spell.r, y: spell.y - spell.r, w: spell.r * 2, h: spell.r * 2 };
      if (rectsOverlap(hitbox, enemy)) {
        enemy.health -= spell.damage;
        enemy.hitFlash = 12;
        enemy.vx = state.player.facing * 13;
        enemy.vy = -6;
        enemy.knockbackTimer = 16;
        makeParticles(spell.x, spell.y, spell.secret ? '#f1b6ff' : '#d7c9ff', spell.secret ? 34 : 18);
        if (enemy.health <= 0) {
          enemy.alive = false;
          state.player.soul += equippedCharm('Soul Lens') ? 2 : 1;
          makeParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#d3c1ff', 24);
        }
        spell.life = 0;
        break;
      }
    }

    if (spell.life <= 0 || spell.x < -50 || spell.x > WORLD.width + 50) {
      spells.splice(i, 1);
    }
  }
}

function makeEnemy(x, y, range, speed, health = 2, strong = false) {
  return {
    x,
    y,
    w: strong ? 44 : 34,
    h: strong ? 36 : 28,
    baseX: x,
    range,
    dir: -1,
    vx: -speed,
    vy: 0,
    health,
    maxHealth: health,
    strong,
    knockbackTimer: 0,
    alive: true,
    hitFlash: 0,
  };
}

const enemies = [
  makeEnemy(560, 390, 120, 1.3),
  makeEnemy(930, 347, 90, 1.5, 4, true),
  makeEnemy(1370, 330, 80, 1.8),
  makeEnemy(1750, 412, 140, 1.4, 4, true),
  makeEnemy(2130, 322, 150, 1.7, 4, true),
  makeEnemy(2500, 282, 100, 1.5),
  makeEnemy(2860, 212, 90, 1.6, 4, true),
];
const boss = makeEnemy(3450, 400, 170, 1.2, 24, true);
boss.w = 72;
boss.h = 80;
boss.maxHealth = 24;
boss.isBoss = true;
boss.alive = false;
enemies.push(boss);

const relics = [
  { x: 340, y: 350, r: 9, collected: false },
  { x: 720, y: 300, r: 9, collected: false },
  { x: 1300, y: 320, r: 9, collected: false },
  { x: 2205, y: 320, r: 9, collected: false },
  { x: 2740, y: 320, r: 9, collected: false },
];

const charms = [
  { name: 'Swiftstep', description: 'Move faster', x: 280, y: 430, color: '#8fe6ff', collected: false, equipped: false },
  { name: 'Thorns', description: 'Stronger knockback', x: 1120, y: 450, color: '#ff9dbe', collected: false, equipped: false },
  { name: 'Soul Lens', description: 'Gain extra Soul', x: 1910, y: 440, color: '#cbb0ff', collected: false, equipped: false },
];

const particles = [];
const spells = [];
const state = {
  cameraX: 0,
  cameraY: 0,
  message: 'The dream is nearby',
  gameOver: false,
  victory: false,
  inventoryOpen: false,
  bossStarted: false,
  roomIndex: 0,
  roomTransition: 0,
  weaponFound: false,
  secretSpellFound: false,
  player: makePlayer(),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRectOverlap(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function makeParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: randRange(-2.25, 2.25),
      vy: randRange(-2.4, 1.2),
      life: randRange(20, 52),
      color,
      size: randRange(2, 5),
    });
  }
}

function resetGame() {
  state.player = makePlayer();
  state.cameraX = 0;
  state.cameraY = 0;
  state.gameOver = false;
  state.victory = false;
  state.inventoryOpen = false;
  state.bossStarted = false;
  state.roomIndex = 0;
  state.roomTransition = 0;
  state.weaponFound = false;
  state.secretSpellFound = false;
  secretWeapon.collected = false;
  secretSpell.collected = false;
  state.message = 'The dream is nearby';
  particles.length = 0;
  spells.length = 0;

  enemies.forEach((enemy, i) => {
    const base = [
      [560, 390, 120, 1.3],
      [930, 347, 90, 1.5, 4, true],
      [1370, 330, 80, 1.8],
      [1750, 412, 140, 1.4, 4, true],
      [2130, 322, 150, 1.7, 4, true],
      [2500, 282, 100, 1.5],
      [2860, 212, 90, 1.6, 4, true],
      [3450, 400, 170, 1.2, 24, true],
    ][i];
    Object.assign(enemy, makeEnemy(base[0], base[1], base[2], base[3], base[4], base[5]));
    if (enemy.isBoss) {
      enemy.w = 72;
      enemy.h = 80;
      enemy.maxHealth = 24;
      enemy.alive = false;
      enemy.isBoss = true;
    }
  });

  relics.forEach((relic, index) => {
    relic.collected = false;
  });
  charms.forEach((charm) => {
    charm.collected = false;
    charm.equipped = false;
  });
}

function equippedCharm(name) {
  return charms.some((charm) => charm.equipped && charm.name === name);
}

function toggleCharm(index) {
  const charm = charms[index];
  if (!charm || !charm.collected) return;
  if (charm.equipped) {
    charm.equipped = false;
    return;
  }
  if (charms.filter((item) => item.equipped).length < 2) {
    charm.equipped = true;
  }
}

function updatePlayer(dt) {
  const p = state.player;
  if (!p.alive) return;

  if (p.invuln > 0) p.invuln -= dt;
  if (p.hurtFlash > 0) p.hurtFlash -= dt;
  if (p.attackTimer > 0) p.attackTimer -= dt;
  if (p.attackCooldown > 0) p.attackCooldown -= dt;
  if (p.dashCooldown > 0) p.dashCooldown -= dt;
  if (p.dashTimer > 0) p.dashTimer -= dt;

  if (spellPressed) {
    if (p.soul >= 3) {
      p.soul -= 3;
      spells.push({
        x: p.x + (p.facing === 1 ? p.w : 0),
        y: p.y + 16,
        vx: p.facing * 8,
        r: state.secretSpellFound ? 19 : 13,
        life: state.secretSpellFound ? 90 : 70,
        damage: state.secretSpellFound ? 20 : 3,
        secret: state.secretSpellFound,
        age: 0,
      });
      makeParticles(p.x + p.w / 2, p.y + p.h / 2, '#bda7ff', 16);
    }
    spellPressed = false;
  }

  const left = keys['arrowleft'] || keys['left'];
  const right = keys['arrowright'] || keys['right'];
  const moveDir = (right ? 1 : 0) - (left ? 1 : 0);

  if (moveDir !== 0) {
    p.facing = moveDir;
  }

  let targetSpeed = moveDir * (equippedCharm('Swiftstep') ? 4.8 : 3.8);
  if (p.dashTimer > 0) {
    targetSpeed = p.facing * 11;
  }

  if (moveDir === 0) {
    p.vx *= p.onGround ? 0.76 : 0.9;
  } else {
    p.vx += (targetSpeed - p.vx) * 0.18;
  }

  if (p.dashTimer <= 0 && p.dashCooldown <= 0 && dashPressed) {
    p.dashCooldown = 0.7;
    p.dashTimer = 10;
    p.vx = p.facing * 10.5;
    p.vy *= 0.5;
    makeParticles(p.x + p.w / 2, p.y + p.h / 2, '#9ad8ff', 12);
    dashPressed = false;
  }

  if (attackPressed && p.attackCooldown <= 0) {
    p.attackTimer = 4;
    p.attackCooldown = 0.14;
    p.attackDirection = keys['arrowup'] ? 'up' : keys['arrowdown'] ? 'down' : 'side';
    p.attackHitEnemies.clear();
    attackPressed = false;
  }

  if (jumpPressed) {
    if (p.onGround) {
      p.vy = -12.8;
      p.onGround = false;
      p.jumpCount = 1;
    } else if (p.jumpCount < p.maxJumps) {
      p.vy = -11.5;
      p.jumpCount += 1;
    }
    jumpPressed = false;
  }

  if (!p.onGround) {
    p.vy += WORLD.gravity * dt;
    p.coyote = Math.max(0, p.coyote - dt);
  } else {
    p.vy = 0;
    p.jumpCount = 0;
    p.coyote = 8;
  }

  const previousX = p.x;
  const previousY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  p.x = clamp(p.x, WORLD.minX, WORLD.width - p.w);
  p.onGround = false;

  let wallTouch = false;
  for (const platform of platforms) {
    if (rectsOverlap(p, platform)) {
      const cameFromAbove = previousY + p.h <= platform.y && p.vy >= 0;
      const cameFromBelow = previousY >= platform.y + platform.h && p.vy < 0;
      const cameFromLeft = previousX + p.w <= platform.x;
      const cameFromRight = previousX >= platform.x + platform.w;

      if (cameFromAbove) {
        p.y = platform.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.jumpCount = 0;
        p.coyote = 8;
      } else if (cameFromBelow) {
        p.y = platform.y + platform.h;
        p.vy = 0;
      } else if (cameFromLeft) {
        p.x = platform.x - p.w;
        p.vx = 0;
        wallTouch = true;
      } else if (cameFromRight) {
        p.x = platform.x + platform.w;
        p.vx = 0;
        wallTouch = true;
      } else {
        p.x = previousX;
        p.y = previousY;
        p.vx = 0;
        p.vy = 0;
        wallTouch = true;
      }
    }
  }

  if (!p.onGround && wallTouch && p.vy > 0) {
    p.vy = Math.min(p.vy, 3.5);
  }

  if (p.y > WORLD.height + 120) {
    p.health = 0;
  }

  let attackBox = null;
  if (p.attackTimer > 0) {
    attackBox = p.attackDirection === 'up'
      ? { x: p.x - 5, y: p.y - 34, w: p.w + 10, h: 38 }
      : p.attackDirection === 'down'
        ? { x: p.x - 5, y: p.y + p.h - 4, w: p.w + 10, h: 38 }
        : {
            x: p.x + (p.facing === 1 ? p.w : -32),
            y: p.y + 8,
            w: 38,
            h: 26,
          };

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (rectsOverlap(attackBox, enemy) && !p.attackHitEnemies.has(enemy)) {
        p.attackHitEnemies.add(enemy);
        enemy.health -= state.weaponFound ? 12 : 1;
        enemy.hitFlash = 10;
        enemy.vx = p.facing * (equippedCharm('Thorns') ? 15 : 10);
        enemy.vy = p.attackDirection === 'down' ? 0 : -5;
        enemy.knockbackTimer = p.attackDirection === 'down' ? 4 : 12;
        if (p.attackDirection === 'down') {
          p.vy = -11.5;
          p.onGround = false;
          p.jumpCount = 0;
        }
        makeParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#d9f0ff', 10);
        if (enemy.health <= 0) {
          enemy.alive = false;
          p.soul += equippedCharm('Soul Lens') ? 2 : 1;
          makeParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#d3c1ff', 20);
        }
      }
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const touchedEnemy = rectsOverlap(p, enemy);

    if (touchedEnemy && p.attackTimer > 0 && p.attackDirection === 'down' && attackBox && rectsOverlap(attackBox, enemy)) {
      continue;
    }

    if (p.invuln <= 0 && touchedEnemy) {
      p.health -= enemy.strong ? 2 : 1;
      p.invuln = 45;
      p.hurtFlash = 16;
      p.vx = (p.x < enemy.x ? -6 : 6);
      p.vy = -5.5;
      makeParticles(p.x + p.w / 2, p.y + p.h / 2, '#ff9a9a', 14);
    }
  }

  for (const relic of relics) {
    if (!relic.collected && circleRectOverlap({ x: relic.x, y: relic.y, r: relic.r }, p)) {
      relic.collected = true;
      p.soul += 2;
      state.message = 'Soul gathered';
      makeParticles(relic.x, relic.y, '#cbb8ff', 18);
    }
  }

  for (const charm of charms) {
    if (!charm.collected && circleRectOverlap({ x: charm.x, y: charm.y, r: 13 }, p)) {
      charm.collected = true;
      state.message = `${charm.name} found - press I`;
      makeParticles(charm.x, charm.y, charm.color, 24);
    }
  }

  if (!secretWeapon.collected && circleRectOverlap(
    { x: secretWeapon.x, y: secretWeapon.y, r: 16 },
    p
  )) {
    secretWeapon.collected = true;
    state.weaponFound = true;
    state.message = 'Void Edge found';
    makeParticles(secretWeapon.x, secretWeapon.y, '#e7f4ff', 36);
  }

  if (!secretSpell.collected && circleRectOverlap(
    { x: secretSpell.x, y: secretSpell.y, r: 16 },
    p
  )) {
    secretSpell.collected = true;
    state.secretSpellFound = true;
    state.message = 'Eclipse Lance found';
    makeParticles(secretSpell.x, secretSpell.y, '#d09cff', 36);
  }

  if (p.health <= 0) {
    p.alive = false;
    state.gameOver = true;
    state.message = 'The knight has fallen';
    makeParticles(p.x + p.w / 2, p.y + p.h / 2, '#ffb1b1', 30);
  }

  if (p.x + p.w > shrine.x && p.y + p.h > shrine.y && p.y < shrine.y + shrine.h) {
    const allRelics = relics.every((r) => r.collected);
    if (allRelics && !state.bossStarted) {
      state.bossStarted = true;
      p.x = 3260;
      p.y = 400;
      p.vx = 0;
      p.vy = 0;
      boss.alive = true;
      boss.x = 3450;
      boss.y = 400;
      state.message = 'The portal guardian awakens';
      makeParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#d19cff', 36);
    }
  }

  if (state.bossStarted && !boss.alive) {
    state.victory = true;
    state.message = 'The portal is conquered';
  }

  if (state.victory || state.gameOver) {
    return;
  }

  state.cameraX = clamp(p.x - canvas.width * 0.38, WORLD.minX, WORLD.width - canvas.width);
  const lookDirection = (keys['arrowdown'] ? 1 : 0) - (keys['arrowup'] ? 1 : 0);
  const targetCameraY = lookDirection * 90;
  state.cameraY += (targetCameraY - state.cameraY) * 0.16;

  const nextRoom = rooms.findIndex((room) => p.x >= room.start && p.x < room.end);
  if (nextRoom >= 0 && nextRoom !== state.roomIndex) {
    state.roomIndex = nextRoom;
    state.roomTransition = 90;
    state.message = rooms[nextRoom].name;
  }
  state.roomTransition = Math.max(0, state.roomTransition - dt);
}

function updateEnemy(enemy, dt) {
  if (!enemy.alive || (enemy.isBoss && !state.bossStarted)) return;

  const p = state.player;
  const supported = platforms.some((platform) =>
    enemy.x + enemy.w > platform.x &&
    enemy.x < platform.x + platform.w &&
    Math.abs(enemy.y + enemy.h - platform.y) < 8
  );
  const lookAhead = enemy.x + enemy.w / 2 + enemy.dir * (enemy.w / 2 + 10);
  const hasFloorAhead = platforms.some((platform) =>
    lookAhead > platform.x &&
    lookAhead < platform.x + platform.w &&
    Math.abs(enemy.y + enemy.h - platform.y) < 12
  );

  const atLedge = supported && !hasFloorAhead;
  if (atLedge) {
    enemy.dir *= -1;
    enemy.vx = enemy.dir * 1.1;
    enemy.knockbackTimer = 0;
  }

  if (enemy.knockbackTimer > 0) {
    enemy.knockbackTimer -= dt;
  } else if (atLedge) {
    enemy.vx = enemy.dir * 1.1;
  } else {
    const dx = p.x - enemy.x;
    const distance = Math.abs(dx);
    if (distance < (enemy.isBoss ? 320 : 210)) {
      enemy.dir = dx < 0 ? -1 : 1;
      enemy.vx = enemy.dir * (enemy.isBoss ? 2.2 : enemy.baseX === 1750 ? 1.8 : 1.4 + (distance / 180));
    } else {
      enemy.vx = enemy.dir * 1.1;
      if (enemy.x < enemy.baseX - enemy.range) enemy.dir = 1;
      if (enemy.x > enemy.baseX + enemy.range) enemy.dir = -1;
    }
  }

  enemy.vy += WORLD.gravity * dt;
  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  if (supported && !hasFloorAhead) {
    enemy.x = clamp(enemy.x, 0, WORLD.width - enemy.w);
  }

  for (const platform of platforms) {
    if (rectsOverlap(enemy, platform)) {
      if (enemy.vy >= 0 && enemy.y + enemy.h - enemy.vy * dt <= platform.y + 10) {
        enemy.y = platform.y - enemy.h;
        enemy.vy = 0;
      } else if (enemy.vy < 0 && enemy.y >= platform.y + platform.h - 12) {
        enemy.y = platform.y + platform.h;
        enemy.vy = 0;
      }
    }
  }

  if (enemy.x < WORLD.minX || enemy.x > WORLD.width - enemy.w) {
    enemy.dir *= -1;
  }

  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#101b27');
  sky.addColorStop(0.5, '#0d1118');
  sky.addColorStop(1, '#070b10');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const farParallax = state.cameraX * 0.18;
  ctx.fillStyle = 'rgba(124, 150, 175, 0.14)';
  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 170) - farParallax) % (canvas.width + 220) - 80;
    const y = 200 + (i % 3) * 35;
    ctx.beginPath();
    ctx.moveTo(x, y + 150);
    ctx.lineTo(x + 80, y);
    ctx.lineTo(x + 160, y + 150);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(100, 120, 150, 0.18)';
  for (let i = 0; i < 45; i += 1) {
    const x = ((i * 90) - state.cameraX * 0.4) % (canvas.width + 100);
    const y = 100 + (i % 5) * 30;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlatform(platform) {
  ctx.fillStyle = '#1d2028';
  ctx.fillRect(platform.x - state.cameraX, platform.y - state.cameraY, platform.w, platform.h);
  ctx.fillStyle = '#303a41';
  ctx.fillRect(platform.x - state.cameraX, platform.y - state.cameraY, platform.w, 8);
  ctx.fillStyle = '#4a5c66';
  for (let i = 0; i < platform.w; i += 26) {
    ctx.fillRect(platform.x - state.cameraX + i, platform.y + 10 - state.cameraY, 12, 4);
  }
}

function drawShrine() {
  const x = shrine.x - state.cameraX;
  ctx.fillStyle = '#111922';
  ctx.fillRect(x, shrine.y - state.cameraY, shrine.w, shrine.h);
  ctx.fillStyle = '#98b4ff';
  ctx.fillRect(x + 22, shrine.y + 28 - state.cameraY, shrine.w - 44, 62);
  ctx.fillStyle = '#d9e4ff';
  ctx.fillRect(x + 38, shrine.y + 42 - state.cameraY, 14, 46);
  ctx.fillRect(x + shrine.w - 52, shrine.y + 42 - state.cameraY, 14, 46);
}

function drawRelic(relic) {
  if (relic.collected) return;
  const x = relic.x - state.cameraX;
  ctx.beginPath();
  ctx.fillStyle = '#d5baf8';
  ctx.arc(x, relic.y - state.cameraY, relic.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.arc(x - 2, relic.y - 2 - state.cameraY, relic.r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCharm(charm) {
  if (charm.collected) return;
  const x = charm.x - state.cameraX;
  const y = charm.y - state.cameraY;
  ctx.save();
  ctx.shadowColor = charm.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = charm.color;
  ctx.beginPath();
  ctx.moveTo(x, y - 13);
  ctx.lineTo(x + 12, y);
  ctx.lineTo(x, y + 13);
  ctx.lineTo(x - 12, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSecretWeapon() {
  return;
}

function drawSecretSpell() {
  return;
}

function drawEnemy(enemy) {
  if (!enemy.alive) return;
  const x = enemy.x - state.cameraX;
  if (enemy.isBoss) {
    ctx.fillStyle = enemy.hitFlash > 0 ? '#fff1ff' : '#9c55d8';
    ctx.beginPath();
    ctx.arc(x + enemy.w / 2, enemy.y + enemy.h / 2 - state.cameraY, enemy.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(x + 16, enemy.y + 24 - state.cameraY, 10, 10);
    ctx.fillRect(x + enemy.w - 26, enemy.y + 24 - state.cameraY, 10, 10);
    ctx.fillStyle = '#e2b7ff';
    ctx.fillRect(x - 10, enemy.y - 12 - state.cameraY, enemy.w + 20, 6);
    return;
  }
  const flash = enemy.hitFlash > 0 ? '#ffefee' : enemy.strong ? '#c27cff' : '#8ec5ff';
  ctx.fillStyle = flash;
  ctx.fillRect(x, enemy.y - state.cameraY, enemy.w, enemy.h);
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(x + 7, enemy.y + 8 - state.cameraY, 7, 7);
  ctx.fillRect(x + enemy.w - 14, enemy.y + 8 - state.cameraY, 7, 7);
  if (enemy.strong) {
    ctx.fillStyle = '#f4d2ff';
    ctx.fillRect(x + 4, enemy.y - 6 - state.cameraY, enemy.w - 8, 4);
  }
}

function drawPlayer() {
  const p = state.player;
  const x = p.x - state.cameraX;
  const attackPulse = p.attackTimer > 0 ? 1 : 0;

  ctx.save();
  ctx.translate(x + p.w / 2, p.y + p.h / 2 - state.cameraY);
  ctx.scale(p.facing, 1);

  if (p.hurtFlash > 0) {
    ctx.fillStyle = '#ffd0df';
  } else {
    ctx.fillStyle = '#dce7f3';
  }

  ctx.fillRect(-10, -18, 20, 26);
  ctx.fillRect(-6, -30, 12, 12);
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(-6, -24, 4, 4);
  ctx.fillRect(2, -24, 4, 4);
  ctx.fillStyle = '#5e7ad5';
  ctx.fillRect(-18, -8, 6, 18);
  ctx.fillRect(12, -8, 6, 18);

  if (attackPulse > 0) {
    const swingProgress = 1 - p.attackTimer / 4;
    const swingAngle = -1.15 + swingProgress * 2.3;
    ctx.save();
    if (p.attackDirection === 'side') {
      const flashLength = 34 + swingProgress * 22;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = '#c18cff';
      ctx.shadowBlur = 32;
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#9c5cff';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(flashLength - 4, -16);
      ctx.lineTo(flashLength + 12, 0);
      ctx.lineTo(flashLength - 4, 16);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#c879ff';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(flashLength - 2, -8);
      ctx.lineTo(flashLength + 10, 0);
      ctx.lineTo(flashLength - 2, 8);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fffaff';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(flashLength + 8, 0);
      ctx.lineTo(flashLength - 2, 3);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d26cff';
      ctx.globalAlpha = 0.85;
      for (let shard = 0; shard < 3; shard += 1) {
        const offset = 18 + shard * 11;
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset - 8, -4 - shard * 2);
        ctx.lineTo(offset - 4, 0);
        ctx.lineTo(offset - 8, 4 + shard * 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    } else {
      ctx.strokeStyle = 'rgba(176, 225, 255, 0.28)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      if (p.attackDirection === 'up') {
      ctx.arc(0, -6, 34, Math.PI * 1.05, Math.PI * 1.95);
      } else {
      ctx.arc(0, 10, 34, Math.PI * 0.05, Math.PI * 0.95);
      }
      ctx.stroke();

      if (p.attackDirection === 'up') {
        ctx.rotate(-Math.PI / 2 + swingAngle * 0.22);
      } else {
        ctx.rotate(Math.PI / 2 + swingAngle * 0.22);
      }
      ctx.translate(8, 0);
      ctx.fillStyle = '#f4fbff';
      ctx.shadowColor = '#a9dcff';
      ctx.shadowBlur = 12;
      ctx.fillRect(0, -3, 48, 6);
      ctx.fillStyle = '#718da8';
      ctx.shadowBlur = 0;
      ctx.fillRect(-8, -5, 10, 10);
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / 50);
    ctx.fillRect(p.x - state.cameraX, p.y - state.cameraY, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.fillStyle = 'rgba(11, 15, 20, 0.72)';
  ctx.fillRect(18, 18, 220, 300);

  for (let i = 0; i < state.player.maxHealth; i++) {
    ctx.fillStyle = i < state.player.health ? '#ff8aa4' : '#3a404f';
    ctx.fillRect(30 + i * 22, 30, 14, 18);
  }

  ctx.fillStyle = '#d3ebff';
  ctx.font = '16px Segoe UI';
  ctx.fillText('Move: Arrows', 30, 74);
  ctx.fillText('Look: Up / Down', 30, 96);
  ctx.fillText('Jump: Z', 30, 118);
  ctx.fillText('Attack: X  Dash: C', 30, 140);
  ctx.fillText('Spell: Space (3 Soul)', 30, 162);
  ctx.fillText('Heal: A (2 Soul)', 30, 184);
  ctx.fillText('Inventory: I', 30, 206);
  ctx.fillText(`Soul ${state.player.soul}`, 30, 228);
  ctx.fillText(`Relics ${relics.filter((r) => r.collected).length}/${relics.length}`, 30, 250);
  if (state.weaponFound) {
    ctx.fillStyle = '#dff5ff';
    ctx.fillText('Weapon: Void Edge', 30, 272);
  }
  if (state.secretSpellFound) {
    ctx.fillStyle = '#d09cff';
    ctx.fillText('Spell: Eclipse Lance', 30, 294);
  }
  if (state.bossStarted && boss.alive) {
    const barX = 250;
    const barY = 22;
    const barW = 460;
    const barH = 24;
    ctx.fillStyle = 'rgba(8, 5, 16, 0.82)';
    ctx.fillRect(barX - 8, barY - 8, barW + 16, barH + 34);
    ctx.fillStyle = '#f0d8ff';
    ctx.font = 'bold 18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('PORTAL GUARDIAN', barX + barW / 2, barY + 14);
    ctx.fillStyle = '#321b48';
    ctx.fillRect(barX, barY + 20, barW, barH);
    ctx.fillStyle = '#b65cff';
    ctx.fillRect(barX, barY + 20, barW * clamp(boss.health / boss.maxHealth, 0, 1), barH);
    ctx.strokeStyle = '#ead6ff';
    ctx.strokeRect(barX, barY + 20, barW, barH);
    ctx.textAlign = 'left';
  }

  if (state.gameOver || state.victory) {
    ctx.fillStyle = 'rgba(4, 8, 14, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#eaf6ff';
    ctx.font = 'bold 42px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(state.gameOver ? 'Fallen' : 'The Dream Opens', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Segoe UI';
    ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';
  }
}

function drawRoomTransition() {
  if (state.roomTransition <= 0) return;
  const progress = state.roomTransition / 90;
  const alpha = progress > 0.5 ? (1 - progress) * 2 : progress * 2;
  ctx.fillStyle = `rgba(4, 8, 14, ${0.72 * alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawInventory() {
  if (!state.inventoryOpen) return;
  ctx.fillStyle = 'rgba(3, 7, 14, 0.88)';
  ctx.fillRect(180, 70, 600, 400);
  ctx.strokeStyle = '#8caed0';
  ctx.lineWidth = 2;
  ctx.strokeRect(180, 70, 600, 400);
  ctx.fillStyle = '#edf6ff';
  ctx.font = 'bold 28px Segoe UI';
  ctx.fillText('Charm Inventory', 220, 115);
  ctx.font = '16px Segoe UI';
  ctx.fillStyle = '#b8cbe0';
  ctx.fillText('Press 1-3 to equip or remove charms. Two slots maximum.', 220, 145);

  charms.forEach((charm, index) => {
    const y = 190 + index * 78;
    ctx.fillStyle = charm.collected ? charm.color : '#3c4655';
    ctx.beginPath();
    ctx.arc(240, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#edf6ff';
    ctx.font = '18px Segoe UI';
    ctx.fillText(`${index + 1}. ${charm.name}`, 280, y - 3);
    ctx.font = '14px Segoe UI';
    ctx.fillStyle = '#b8cbe0';
    ctx.fillText(charm.collected ? charm.description : 'Not found', 280, y + 20);
    ctx.fillStyle = charm.equipped ? '#9fffc4' : '#8290a3';
    ctx.fillText(charm.equipped ? 'EQUIPPED' : charm.collected ? 'FOUND' : 'HIDDEN', 620, y + 5);
  });
}

function drawWorld() {
  drawBackground();
  platforms.forEach((platform) => {
    if (!state.bossStarted && platform.x >= 3200) return;
    drawPlatform(platform);
  });
  drawShrine();
  relics.forEach(drawRelic);
  charms.forEach(drawCharm);
  drawSecretWeapon();
  drawSecretSpell();
  enemies.forEach(drawEnemy);
  drawPlayer();
  drawParticles();
  drawSpells();
  drawHud();
  drawInventory();
}

function update(dt) {
  if (state.gameOver || state.victory) {
    if (keys['r']) {
      resetGame();
    }
    return;
  }

  if (state.inventoryOpen) {
    return;
  }

  updatePlayer(dt);
  enemies.forEach((enemy) => updateEnemy(enemy, dt));
  updateParticles(dt);
  updateSpells(dt);
}

function loop(ts) {
  if (!loop.last) loop.last = ts;
  const dt = Math.min((ts - loop.last) / 16.67, 1.6);
  loop.last = ts;
  update(dt);
  drawWorld();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (key === 'i') {
    state.inventoryOpen = !state.inventoryOpen;
    event.preventDefault();
    return;
  }
  if (state.inventoryOpen && ['1', '2', '3'].includes(key)) {
    toggleCharm(Number(key) - 1);
    event.preventDefault();
    return;
  }

  if (event.code === 'Space') {
    spellPressed = true;
    event.preventDefault();
  }
  if (key === 'z') {
    jumpPressed = true;
    event.preventDefault();
  }
  if (key === 'a' && state.player.alive && state.player.health < state.player.maxHealth && state.player.soul >= 2) {
    state.player.soul -= 2;
    state.player.health += 1;
    state.message = 'Focus restored';
    makeParticles(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, '#9fffc4', 18);
    event.preventDefault();
  }
  if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
    event.preventDefault();
  }
  if (key === 'j' || key === 'x') {
    attackPressed = true;
    event.preventDefault();
  }
  if (key === 'shift' || key === 'c') {
    dashPressed = true;
    event.preventDefault();
  }
  if (key === 'r') {
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = false;
});

resetGame();
requestAnimationFrame(loop);

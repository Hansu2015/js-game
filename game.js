'use strict'

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        }

        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    times(n) {
        return new Vector(this.x * n, this.y * n);
    }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);


class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
      throw new Error('Передан неверный тип данных');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  act() {}

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Передан неверный тип данных');
    }
    if (actor === this) {
      return false;
    }
    return actor.left < this.right && actor.right > this.left && actor.top < this.bottom && actor.bottom > this.top;
  }
}

// Пример
/*
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/
// next

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.player = this.actors.find(x => x.type === 'player');
    this.height = this.grid.length;
    this.width = Math.max(0, ...this.grid.map(x => x.length));
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if(!(actor instanceof Actor)) {
      throw new Error('Передан неверный тип данных');
    }
    return this.actors.find(elements => actor.isIntersect(elements));
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error("Необходим объект типа Vector");
    }
    if (pos.x < 0 || (pos.x + size.x >= this.width) || pos.y < 0) {
      return 'wall';
    }
    if (pos.y + size.y >= this.height) {
      return 'lava';
    }

    const horizontalStart = Math.floor(pos.x);
    const horizontalEnd = Math.ceil(pos.x + size.x);
    const verticalStart = Math.floor(pos.y);
    const verticalEnd = Math.ceil(pos.y + size.y);
    for (let verticalIndex = verticalStart; verticalIndex < verticalEnd; verticalIndex++) {
      for (let horizontalIndex = horizontalStart; horizontalIndex < horizontalEnd; horizontalIndex++) {
        const cell = this.grid[verticalIndex][horizontalIndex];
        if (cell) {
          return cell;
        }
      }
    }
  }

  removeActor(actor) {
    const index = this.actors.indexOf(actor);
    if(index !== -1) {
      this.actors.splice(index, 1);
    }
  }

  noMoreActors(type) {
    return !this.actors.some(elem => elem.type === type);
  }

  playerTouched(type, actor) {
    if (this.status !== null) {
      return;
    }
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }
    if (type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

// Пример
/*
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
*/

class LevelParser {
    constructor(dict) {
        this.dict = dict;
    }

    actorFromSymbol(char) {
        if (this.dict !== undefined && char !== undefined && char in this.dict) {
            return this.dict[char];
        }
        return undefined;
    }

    obstacleFromSymbol(char) {
        switch (char) {
            case 'x':
                return 'wall';
            case '!':
                return 'lava';
            default:
                return undefined;
        }
    }

    createGrid(strs) {
        let grid = [];
        for (let i = 0; i < strs.length; i++) {
            let aux = [];
            for (let j = 0; j < strs[i].length; j++) {
                aux.push(this.obstacleFromSymbol(strs[i].charAt(j)));
            }
            grid.push(aux);
        }
        return grid;
    }

    createActors(strs) {
        let actors = [];
        for (let i = 0; i < strs.length; i++) {
            for (let j = 0; j < strs[i].length; j++) {
                let actor = this.actorFromSymbol(strs[i].charAt(j));
                if (actor !== undefined && typeof actor === 'function') {
                    let instance = new actor(new Vector(j, i));
                    if (instance instanceof Actor) {
                        actors.push(instance);
                    }
                }
            }
        }
        return actors;
    }

    parse(strs) {
        return new Level(this.createGrid(strs), this.createActors(strs));
    }
}

//Пример
/*
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));

*/


class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, new Vector(1, 1), speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

    act(time, level) {
        let nextPos = this.getNextPosition(time);
        if (level.obstacleAt(nextPos, this.size) !== undefined && level.obstacleAt(nextPos, this.size) !== false) {
            this.handleObstacle();
        } else this.pos = nextPos;
    }
}

//Пример
/*
const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
*/


class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.newPosition = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  get type() {
    return 'coin';
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }

  getNextPosition(time = 1) {
    this.spring += this.springSpeed * time;
    return this.newPosition.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
  }

  get type() {
    return 'player';
  }
}



const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);

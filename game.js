'use strict';
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
}

plus(vector) {
    if (!(vector instanceof Vector)){
        throw Error('Можно только Vector');
    }
        return new Vector (this.x + vector.x, this.y + vector.y);
    }
    times(n = 1){
        return new Vector (this.x * n, this.y * n);
    }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
function Snake(options) {
    var me = this;   
    me.x = options.x || 0;
    me.y = options.y || 0;

    me.ctx = options.ctx;
    me.currentDirection = 'EAST';

    me.reset();
}

Snake.prototype.reset = function reset() {
    var me = this;
    
    me.head = null;
    me.tail = null;

    var tail = new SnakeSegment({
        x: me.x,
        y: me.y,
        ctx: me.ctx
    });
    var body = new SnakeSegment({
        x: tail.x + SEGMENT_SIZE,
        y: tail.y,
        ctx: me.ctx
    });
    var head = new SnakeSegment({
        x: body.x + SEGMENT_SIZE,
        y: body.y,
        colour: 'red',
        ctx: me.ctx
    });

    tail.next = body;
    body.next = head;
    head.next = null;

    me.head = head;
    me.tail = tail;
};

Snake.prototype.drawAll = function drawAll() {
    var me = this;
    var segment = me.tail;
    segment.draw();
    while(segment.next) {
        segment = segment.next;
        segment.draw();
    }
};

Snake.prototype.clearAll = function clearAll() {
    var me = this;
    var segment = me.tail;
    segment.clear();
    while(segment.next) {
        segment = segment.next;
        segment.clear();
    }
};

Snake.prototype.grow = function grow() {
    var me = this;
    var directionUpdate = updateTailByDirection[me.currentDirection];

    var newTail = new SnakeSegment({
        x: me.tail.x + directionUpdate.x,
        y: me.tail.y + directionUpdate.y,
        ctx: me.ctx
    });
    newTail.next = me.tail;
    me.tail = newTail;
};

function SnakeSegment(options) {
    var me = this;

    me.width = SEGMENT_SIZE;
    me.height = SEGMENT_SIZE;
    me.colour = options.colour || "black";
    me.next = options.next || null;
    me.prev = options.prev || null;
    me.x = options.x;
    me.y = options.y;
    me.ctx = options.ctx;
}

SnakeSegment.prototype.updatePos = function updatePos(x, y) {
    this.x = x;
    this.y = y;
};  

SnakeSegment.prototype.draw = function draw() {
    var me = this;
    me.ctx.fillStyle = me.colour;
    me.ctx.fillRect(me.x, me.y, me.width, me.height);
};

SnakeSegment.prototype.clear = function clear() {
    var me = this;
    me.ctx.clearRect(me.x, me.y, me.width, me.height);
};

SnakeSegment.prototype.equal = function(otherSegment) {
    var me = this;
    if(me.x == otherSegment.x && me.y == otherSegment.y) {
        return true;
    } else {
        return false;
    }
};

function Food(ctx) {
    var me = this;
    me.allFoodPositionsLookup = [];
    var i,j;
    for(i = 0 ; i < canvasWidth ; i += SEGMENT_SIZE) {
        for(j = 0; j < canvasHeight ; j += SEGMENT_SIZE) {
            me.allFoodPositionsLookup.push({ x: i, y: j });
        }
    }
    var startPosition = me.getRandXY();
    me.item = new SnakeSegment({
        ctx: ctx,
        x: startPosition.x,
        y: startPosition.y,
        colour: 'green'
    });
}

Food.prototype.getRandXY = function getRandXY() {
    function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var me = this;
    var min = 0;
    var max = me.allFoodPositionsLookup.length;
    
    return me.allFoodPositionsLookup[getRandomInt(min, max)];
};

Food.prototype.setNewPosition = function setNewPosition() {
    var me = this;
    var pos = me.getRandXY();
    me.item.x = pos.x;
    me.item.y = pos.y;   
};

Food.prototype.draw = function draw() {
    this.item.draw();
}

Food.prototype.clear = function clear() {
    this.item.clear();
}

exports = {
    Food: Food,
    Snake: Snake,
    SnakeSegment: SnakeSegment
};
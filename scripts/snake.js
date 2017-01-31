function Segment(options) {
    var me = this;

    me.width = Segment.SEGMENT_SIZE;
    me.height = Segment.SEGMENT_SIZE;
    me.colour = options.colour || "black";
    me.next = options.next || null;
    me.prev = options.prev || null;
    me.x = options.x;
    me.y = options.y;
    me.d = 0;
    me.dPlusL2 = 0;
    me.ctx = options.ctx;
}

Segment.prototype.updatePos = function updatePos(x, y) {
    this.x = x;
    this.y = y;
};  

Segment.prototype.draw = function draw() {
    var me = this;
    me.ctx.fillStyle = me.colour;
    me.ctx.fillRect(me.x, me.y, me.width, me.height);
};

Segment.prototype.drawTarget = function drawTarget() {
    var me = this;
    me.ctx.fillStyle = "pink";
    me.ctx.fillRect(me.x, me.y, me.width, me.height);
};

Segment.prototype.clear = function clear() {
    var me = this;
    me.ctx.clearRect(me.x, me.y, me.width, me.height);
    me.ctx.strokeStyle="grey";
    me.ctx.strokeRect(me.x, me.y, me.width, me.height);
};

Segment.prototype.equal = function(otherSegment) {
    var me = this;
    if(me.x == otherSegment.x && me.y == otherSegment.y) {
        return true;
    } else {
        return false;
    }
};

Segment.SEGMENT_SIZE = 20;

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

    var tail = new Segment({
        x: me.x,
        y: me.y,
        ctx: me.ctx
    });
    var body = new Segment({
        x: tail.x + Segment.SEGMENT_SIZE,
        y: tail.y,
        ctx: me.ctx
    });
    var head = new Segment({
        x: body.x + Segment.SEGMENT_SIZE,
        y: body.y,
        colour: 'red',
        ctx: me.ctx
    });

    tail.next = body;
    body.next = head;
    head.next = null;

    me.head = head;
    me.tail = tail;

    me.updateTailByDirection = {
        NORTH: {
            y: Segment.SEGMENT_SIZE,
            x: 0
        },
        SOUTH: {
            y: -1 * Segment.SEGMENT_SIZE,
            x: 0
        },
        EAST: {
            y: 0,
            x: -1 * Segment.SEGMENT_SIZE
        },
        WEST: {
            y: 0,
            x: Segment.SEGMENT_SIZE
        },                        
    };

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
    var directionUpdate = me.updateTailByDirection[me.currentDirection];

    var newTail = new Segment({
        x: me.tail.x + directionUpdate.x,
        y: me.tail.y + directionUpdate.y,
        ctx: me.ctx
    });
    newTail.next = me.tail;
    me.tail = newTail;
};

function Food(ctx, canvasWidth, canvasHeight) {
    var me = this;
    me.allFoodPositionsLookup = [];
    var i,j;
    for(i = 0 ; i < canvasWidth ; i += Segment.SEGMENT_SIZE) {
        for(j = 0; j < canvasHeight ; j += Segment.SEGMENT_SIZE) {
            me.allFoodPositionsLookup.push({ x: i, y: j });
        }
    }
    var startPosition = me.getRandXY();
    me.item = new Segment({
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
    me.item.colour = "green";
    me.item.x = pos.x;
    me.item.y = pos.y;   
};

Food.prototype.draw = function draw() {
    this.item.draw();
}

Food.prototype.clear = function clear() {
    this.item.clear();
}

function Grid(ctx, width, height, cellSize) {
    var me = this;
    me.cells = [];
    me.ctx = ctx;
    me.width = width;
    me.height = height;
    me.cellSize = cellSize;

    var x,y;
    for(x = 0; x < width ; x += cellSize) {
        for(y = 0 ; y < height; y += cellSize) {
            var index = x/cellSize;
            var newCell = new Segment({
                x: x,
                y: y,
                width: Segment.SEGMENT_SIZE,
                height: Segment.SEGMENT_SIZE,
                ctx: ctx
            });
            if(!me.cells[index]) {
                me.cells[index] = [newCell];
            } else {
                me.cells[index].push(newCell);
            }
        }
    }
}

Grid.prototype.draw = function draw() {
    var me = this;
    for(x = 0; x < me.width ; x += me.cellSize) {
        for(y = 0 ; y < me.height; y += me.cellSize) {
            var cell = me.cells[x/me.cellSize][y/me.cellSize];
            me.ctx.strokeStyle="grey";
            me.ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
        }
    }    
    
}
    

module.exports = {
    Food: Food,
    Snake: Snake,
    Segment: Segment,
    Grid: Grid,
};

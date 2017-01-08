window.onload = function() {
    const canvasWidth = 1520;
    const canvasHeight = 1520;
    var SEGMENT_SIZE = 20
    var FPS = 60;
    var gameLoop;
    var gameRunning = true;

    var dirKeyLookup = {
        37: 'WEST',
        38: 'NORTH',
        39: 'EAST',
        40: 'SOUTH'
    };

     var reverseDirKeyLookup = {
        WEST: 37,
        NORTH: 38,
        EAST: 39,
        SOUTH: 40
    };

    var unallowedDirLookup = {
        'WEST': 39,
        'NORTH': 40,
        'EAST': 37,
        'SOUTH': 38
    };

    var dirUpdateLookup = {
        NORTH: {
            y: -1 * SEGMENT_SIZE,
            x: 0
        },
        SOUTH: {
            y: SEGMENT_SIZE,
            x: 0
        },
        EAST: {
            y: 0,
            x: SEGMENT_SIZE
        },
        WEST: {
            y: 0,
            x: -1 * SEGMENT_SIZE
        },                        
    }

    function validDirectionChange(keyCode, currentDirection) {
        var unallowed = unallowedDirLookup[currentDirection]
        return keyCode != unallowed;
    }    

    function insideWorldBounds(keyCode, head) {
        var direction = dirKeyLookup[keyCode];
        var dirctionUpdate = dirUpdateLookup[direction];
        var newX = head.x + dirctionUpdate.x;
        var newY = head.y + dirctionUpdate.y;
        return newX < canvasWidth &&  newX >= 0 && newY < canvasHeight && newY >= 0;
    }
    
    function Snake(options) {
        var me = this;   
        var x = options.x || 0;
        var y = options.y || 0;

        me.ctx = options.ctx;
        me.currentDirection = 'EAST';

        var tail = new SnakeSegment({
            isTail: true,
            x: x,
            y: y,
            ctx: me.ctx
        });
        var body = new SnakeSegment({
            x: tail.x + SEGMENT_SIZE,
            y: tail.y,
            ctx: me.ctx
        });
        var head = new SnakeSegment({
            isHead: true,
            x: body.x + SEGMENT_SIZE,
            y: body.y,
            colour: 'red',
            ctx: me.ctx
        });

        tail.next = body;
        body.next = head;
        
        me.head = head;
        me.tail = tail;
    }

    Snake.prototype.drawAll = function drawAll() {
        var me = this;
        var segment = me.tail;
        segment.draw();
        while(segment.next) {
            segment = segment.next;
            segment.draw();
        }
    }


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
    }

    SnakeSegment.prototype.clear = function clear() {
        var me = this;
        me.ctx.clearRect(me.x, me.y, me.width, me.height);
    }

    SnakeSegment.prototype.drawNext = function drawNext(headSegment, direction) {
        var me = this;
        me.isHead = true;
    }

    console.log("GOGOGOGO");

    function updateSnakeFromDirection(snake, keycode) {
        snake.head.colour = 'black';
        snake.head.draw();
        var curHeadX = snake.head.x;
        var curHeadY = snake.head.y;
        snake.tail.clear();
        var newTail = snake.tail.next;
        var newHead = snake.tail
        newHead.next = null;
        snake.head.next = newHead;
        snake.head = newHead;
        snake.tail = newTail;
        var direction = dirKeyLookup[keycode];
        var dirctionUpdate = dirUpdateLookup[direction];
        snake.head.x = curHeadX + dirctionUpdate.x;
        snake.head.y = curHeadY + dirctionUpdate.y;
        snake.head.colour = 'red';
        snake.head.draw();
        snake.currentDirection = direction;
    }

    document.addEventListener('keydown', function(event) {
        if(event.keyCode === 81) {
            clearInterval(gameLoop);
        } else if(event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) { //LEFT
            var validUpdate = validDirectionChange(event.keyCode, snake.currentDirection) && insideWorldBounds(event.keyCode, snake.head);
            if(validUpdate) {
                updateSnakeFromDirection(snake, event.keyCode);
            }
        } else {

        }
    });

    var canvasEl = document.getElementById('main');
    canvasEl.style.backgroundColor = 'rgba(158, 167, 184, 0.2)';
    canvasEl.width = canvasWidth;
    canvasEl.height = canvasHeight;
    var ctx = canvasEl.getContext('2d');
    var snake = new Snake({
        x: canvasWidth/2,
        y: canvasHeight/2,
        ctx: ctx
    });

    gameLoop = setInterval(function() {
        var keyCode = reverseDirKeyLookup[snake.currentDirection];
        var validUpdate = insideWorldBounds(keyCode, snake.head);
        if(validUpdate) {
            updateSnakeFromDirection(snake, keyCode);
        }
        snake.drawAll();
    }, 1000 / FPS);
};
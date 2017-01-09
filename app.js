window.onload = function() {
    const canvasWidth = 1520;
    const canvasHeight = 920;
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

    var updateHeadByDirection = {
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
    };

    var updateTailByDirection = {
        NORTH: {
            y: SEGMENT_SIZE,
            x: 0
        },
        SOUTH: {
            y: -1 * SEGMENT_SIZE,
            x: 0
        },
        EAST: {
            y: 0,
            x: -1 * SEGMENT_SIZE
        },
        WEST: {
            y: 0,
            x: SEGMENT_SIZE
        },                        
    };

    function validDirectionChange(keyCode, currentDirection) {
        var direction = dirKeyLookup[keyCode];
        if(currentDirection === direction) {
            return false;
        }
        var unallowed = unallowedDirLookup[currentDirection]
        return keyCode != unallowed;
    }    

    function insideWorldBounds(keyCode, head) {
        var direction = dirKeyLookup[keyCode];
        var directionUpdate = updateHeadByDirection[direction];
        var newX = head.x + directionUpdate.x;
        var newY = head.y + directionUpdate.y;
        return newX <= canvasWidth &&  newX >= 0 && newY <= canvasHeight && newY >= 0;
    }
    
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
        var dirctionUpdate = updateHeadByDirection[direction];
        snake.head.x = curHeadX + dirctionUpdate.x;
        snake.head.y = curHeadY + dirctionUpdate.y;
        snake.head.colour = 'red';
        snake.head.draw();
        snake.currentDirection = direction;
    }

    function checkCollisions(snake) {
        if(snake.head.equal(food.item)) {
            snake.grow();
            snake.grow();
            food.setNewPosition();
            updateScore();
            return;
        }


        if(snake.head.equal(snake.tail)) {
            resetGame(snake);
        }

        var current = snake.tail;
        while(!snake.head.equal(current) && !current.equal(snake.head)) {
            if(snake.head.equal(current)) {
                resetGame(snake);
            }
            current = current.next;
        }
    }

    document.addEventListener('keydown', function(event) {
        if(event.keyCode === 81) {
            gameRunning = false;
        } else if(event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) { //LEFT
            var validUpdate = validDirectionChange(event.keyCode, snake.currentDirection) && insideWorldBounds(event.keyCode, snake.head);
            if(validUpdate) {
                updateSnakeFromDirection(snake, event.keyCode);
            }
        }
    });



/*
                 (_)      
  _ __ ___   __ _ _ _ __  
 | '_ ` _ \ / _` | | '_ \ 
 | | | | | | (_| | | | | |
 |_| |_| |_|\__,_|_|_| |_|
*/
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

    var food = new Food(ctx);

    var lastFrameTimeMs = 0 // The last time the loop was run
    var maxFPS = 31; // The maximum FPS we want to allow
    snake.currentDirection = 'EAST';
    snake.drawAll();
    var currentScore = -1;
    
    function updateScore(value) {
        document.getElementById("score").textContent = "SCORE: " + ++currentScore;
    }

    updateScore();

    function resetGame(snake) {
        snake.clearAll();
        snake.reset();
        food.clear();
        food.setNewPosition();
        currentScore = -1;
        updateScore();           
    }

    function update() {
        var keyCode = reverseDirKeyLookup[snake.currentDirection];
        var insideWorld = insideWorldBounds(keyCode, snake.head);
        if(insideWorld) {
            updateSnakeFromDirection(snake, keyCode);
        } else {
            resetGame(snake);            
        }
        checkCollisions(snake);
    }

    function draw() {
        food.draw();
        snake.drawAll();
    }

    function gameLoop(timeStamp) {
         if(gameRunning) {
            if(timeStamp < lastFrameTimeMs + (1000 / maxFPS)) {
                requestAnimationFrame(gameLoop);
                return;
            }
            lastFrameTimeMs = timeStamp;
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
    }
    requestAnimationFrame(gameLoop);
};
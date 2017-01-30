var GameObjects = require("./scripts/snake.js");
var Snake = GameObjects.Snake;
var Segment = GameObjects.Segment;
var Food = GameObjects.Food;
var Cell = GameObjects.Cell;
var Grid = GameObjects.Grid;

window.onload = function() {
    const canvasWidth = 1520;
    const canvasHeight = 920;
    
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
            y: -1 * Segment.SEGMENT_SIZE,
            x: 0
        },
        SOUTH: {
            y: Segment.SEGMENT_SIZE,
            x: 0
        },
        EAST: {
            y: 0,
            x: Segment.SEGMENT_SIZE
        },
        WEST: {
            y: 0,
            x: -1 * Segment.SEGMENT_SIZE
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
            food.setNewPosition();
            updateScore();
            return true;
        }

        if(snake.head.equal(snake.tail)) {
            resetGame(snake);
            return false;
        }

        var current = snake.tail;
        while(current != snake.head) {
            if(snake.head.equal(current)) {
                resetGame(snake);
                return false;
            }
            current = current.next;
        }
        return true;
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
    var g = GameObjects;
    var snake = new Snake({
        x: canvasWidth/2,
        y: canvasHeight/2,
        ctx: ctx
    });

    var grid = new Grid(ctx, canvasWidth, canvasHeight, Segment.SEGMENT_SIZE);
    grid.draw();
    var food = new Food(ctx, canvasWidth, canvasHeight);

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
            var check = checkCollisions(snake);
            if(check) {
                updateSnakeFromDirection(snake, keyCode);
            }
            checkCollisions(snake);
        } else {
            resetGame(snake);            
        }
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
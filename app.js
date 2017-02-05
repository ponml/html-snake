var GameObjects = require("./scripts/snake.js");
var Snake = GameObjects.Snake;
var Segment = GameObjects.Segment;
var Food = GameObjects.Food;
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

    var fringeSet = [];
    var closedSet = [];
    var nodePath = [];

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

    function updateSnakeFromNode(node) {
        snake.head.colour = 'black';
        snake.head.draw();
        var curHeadX = snake.head.x;
        var curHeadY = snake.head.y;
        snake.tail.clear();
        var newTail = snake.tail.next;
        var newHead = new Segment({
            x: node.x,
            y: node.y,
            ctx: node.ctx,
            type: "snake"
        });

        newHead.next = null;
        snake.head.next = newHead;
        snake.head = newHead;
        snake.tail = newTail;
        snake.head.colour = 'red';
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

        // if(snake.head.equal(snake.tail)) {
        //     resetGame(snake);
        //     return false;
        // }

        // var current = snake.tail;
        // while(current != snake.head) {
        //     if(snake.head.equal(current)) {
        //         resetGame(snake);
        //         return false;
        //     }
        //     current = current.next;
        // }
        // return true;
    }
    
    function search() {
        fringeSet.forEach(function(node) {
            node.clear();
        });
        
        closedSet.forEach(function(node) {
            node.colour = "yellow";
            node.clear();
        });
        fringeSet = [];
        closedSet = [];
        fringeSet.push(snake.head);

        var node = findRoute();
        if(node.equal(food.item)) {
            food.item.colour = "pink";
            fringeSet.forEach(function(node) {
                node.colour = "orange";
                node.draw();
            });

            closedSet.forEach(function(node) {
                node.colour = "yellow";
                node.draw();
            });

            if(node) {
                nodePath.unshift(node);
                var curNode = node.parent;
                while(curNode) {
                    curNode.draw("blue");
                    nodePath.unshift(curNode);
                    curNode = curNode.parent;
                }
            }
        }

    }

    function addChildrenToFringeSet(parentNode) {
        
        var northCoords = {
            x: parentNode.x/Segment.SEGMENT_SIZE,
            y: (parentNode.y-Segment.SEGMENT_SIZE)/Segment.SEGMENT_SIZE
        };
        var southCoords = {
            x: parentNode.x/Segment.SEGMENT_SIZE,
            y: (parentNode.y+Segment.SEGMENT_SIZE)/Segment.SEGMENT_SIZE
        };
        var westCoords = {
            x: (parentNode.x-Segment.SEGMENT_SIZE)/Segment.SEGMENT_SIZE,
            y: parentNode.y/Segment.SEGMENT_SIZE
        };
        var eastCoords = {
            x: (parentNode.x+Segment.SEGMENT_SIZE)/Segment.SEGMENT_SIZE,
            y: parentNode.y/Segment.SEGMENT_SIZE
        };
        var children = [];


        if(parentNode.y-Segment.SEGMENT_SIZE >= 0) {
            var cellToConsider = grid.cells[northCoords.x][northCoords.y];
            if(cellToConsider && cellToConsider.type !== "snake") {
                children.push(cellToConsider);
            }
        }
        if(parentNode.y+Segment.SEGMENT_SIZE < canvasHeight) {
            var cellToConsider = grid.cells[southCoords.x][southCoords.y];
            if(cellToConsider && cellToConsider.type !== "snake") {
                children.push(cellToConsider);
            }
        }
        if(parentNode.x-Segment.SEGMENT_SIZE >= 0) {
            var cellToConsider = grid.cells[westCoords.x][westCoords.y];
            if(cellToConsider && cellToConsider.type !== "snake") {            
                children.push(cellToConsider);
            }
        }
        if(parentNode.x+Segment.SEGMENT_SIZE < canvasWidth) {
            var cellToConsider = grid.cells[eastCoords.x][eastCoords.y];
            if(cellToConsider && cellToConsider.type !== "snake") {
                children.push(cellToConsider);
            }
        }                        

        children.forEach(function(child) {

            var found = null;
            var childIsInClosed = closedSet.some(function(item) {
                return item.equal(child);
            });
            if(!childIsInClosed) {
                child.d = parentNode.d + distanceFromNodeToNode(parentNode, child);
                var L2 = distanceFromNodeToNode(child, food.item);
                child.dPlusL2 = child.d + L2;
                child.parent = parentNode;
            }
            fringeSet.push(child);
        });

        fringeSet.sort(function(a,b) {
            return a.dPlusL2 > b.dPlusL2 ? 1 : -1;
        });
    }

//http://mnemstudio.org/path-finding-a-star.htm
    function findRoute() {
        if(fringeSet.length === 0) {
            return 0;
        } else {
            var node = fringeSet.shift();
            if(node.equal(food.item)) {
                console.log("found")
                return node;
            } else {
                var found = null;
                var nodeIsInClosed = closedSet.some(function(item) {
                    return item.equal(node);
                });
                if(!nodeIsInClosed) {
                    closedSet.push(node);
                    addChildrenToFringeSet(node);
                }
                return findRoute();
            }

        }

    }

    function distanceFromNodeToNode(node1, node2) {
        var node1X = node1.x;
        var node1Y = node1.y;
        
        var node2X = node2.x;
        var node2Y = node2.y;

        var dx = (node2X - node1X);
        var dy = (node2Y - node1Y);
        var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        return distance;
    }

    document.addEventListener('keydown', function(event) {
        if(event.keyCode === 81) {
            gameRunning = false;
        } else if(event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 40) { //LEFT
            var validUpdate = validDirectionChange(event.keyCode, snake.currentDirection) && insideWorldBounds(event.keyCode, snake.head);
            if(validUpdate) {
                updateSnakeFromDirection(snake, event.keyCode);
            }
        } else if(event.keyCode === 32) {
            search();
            var node = findRoute();
            if(node.equal(food.item)) {
                food.item.colour = "pink";
                fringeSet.forEach(function(node) {
                    node.colour = "orange";
                    node.draw();
                });

                closedSet.forEach(function(node) {
                    node.colour = "yellow";
                    node.draw();
                });

                if(node) {
                    nodePath.unshift(node);
                    var curNode = node.parent;
                    while(curNode) {
                        curNode.draw("blue");
                        nodePath.unshift(curNode);
                        curNode = curNode.parent;
                    }
                }
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

    // function update(direction) {
    //     direction = direction || snake.currentDirection;
    //     var keyCode = reverseDirKeyLookup[direction];
    //     var insideWorld = insideWorldBounds(keyCode, snake.head);
    //     if(insideWorld) {
    //         var check = checkCollisions(snake);
    //         if(check) {
    //             updateSnakeFromDirection(snake, keyCode);
    //         }
    //         checkCollisions(snake);
    //     } else {
    //         resetGame(snake);            
    //     }
    // }

    function update() {
        var node = nodePath.shift();
        if(node) {
            updateSnakeFromNode(node);
            checkCollisions(snake);
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
            if(!nodePath.length) {
                search();
            }           
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
    }
    requestAnimationFrame(gameLoop);
};
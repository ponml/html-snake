window.onload = function() {
    function Snake(options) {
        var me = this;   
        var x = options.x || 0;
        var y = options.y || 0;
        var tail = new SnakeSegment({
            isTail: true,
            x: x,
            y: y
        });
        var body = new SnakeSegment({
            x: tail.x+SEGMENT_SIZE,
            y: tail.y+SEGMENT_SIZE,
        });
        var head = new SnakeSegment({
            isHead: true,
            x: body.x+SEGMENT_SIZE,
            y: body.y+SEGMENT_SIZE,
        });

        me.ctx = options.ctx;
        
        tail.next = body;
        body.prev = tail;
        body.next = head;
        head.prev = body;
        
        me.head = head;
        me.tail = tail;
    }

    Snake.prototype.drawAll = function drawAll() {
        var me = this;
        var segment = me.tail;
        segment.draw(me.ctx);
        while(segment.next) {
            segment = segment.next;
            segment.draw(me.ctx);
        }
    }


    function SnakeSegment(options) {
        var me = this;

        me.width = SEGMENT_SIZE;
        me.height = SEGMENT_SIZE;
        me.fill = "blue";
        me.isTail = options.isTail || false;
        me.isHead = options.isHead || false;
        me.next = options.next || null;
        me.prev = options.prev || null;
        me.x = options.x;
        me.y = options.y;
    }

    SnakeSegment.prototype.updatePos = function updatePos(x, y) {
        this.x = x;
        this.y = y;
    };

    SnakeSegment.prototype.draw = function draw(canvasContext) {
        var me = this;
        canvasContext.fillRect(me.x, me.y, me.width, me.height);
    }

    SnakeSegment.prototype.clear = function clear(canvasContext) {
        var me = this;
        canvasContext.clearRect(me.x, me.y, me.width, me.height);
    }

    SnakeSegment.prototype.drawNext = function drawNext(headSegment, direction) {
        var me = this;
        me.isHead = true;
    }

    const canvasWidth = 1500;
    const canvasHeight = 1500;
    var SEGMENT_SIZE = 20
    var FPS = 60;
    var gameLoop;
    console.log("GOGOGOGO");
    var gameRunning = true;
    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 37) {
            alert('Left was pressed');
            clearInterval(gameLoop);
        }
        else if(event.keyCode == 39) {
            alert('Right was pressed');
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

    gameLoop = setInterval(snake.drawAll(), 1000 / FPS);
};
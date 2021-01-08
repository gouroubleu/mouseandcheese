var app = {
    count: 0,
    state: false,
    timer: null,
    alreadyCount: 0,
    alreadyCountStep: 5,
    ways: [],
    config: {
        size: 20,
        nbX: 25,
        nbY: 25,
        walls: 10,
        step: 1000
    },
    init: function () {
        app.ways.push({ type: 'N', block: false });
        app.ways.push({ type: 'E', block: false });
        app.ways.push({ type: 'S', block: false });
        app.ways.push({ type: 'O', block: false });
        app.actions.recordConfig();
        $('#config>.formButtons>button[type=submit]').click(function () { return app.actions.recordConfig(); });
        $('#start').click(function () { return $('#start').hasClass('active') ? app.actions.start() : ""; });
        $('#stop').click(function () { return $('#stop').hasClass('active') ? app.actions.stop() : ""; });
    },
    draw: {
        init: function () {
            app.draw.set.plan();
            app.draw.set.squares();
            app.draw.set.walls();
            app.draw.set.target();
            app.draw.set.cursor();
        },
        set: {
            plan: function () {
                var width = parseFloat(app.config.size) * parseFloat(app.config.nbX);
                var height = parseFloat(app.config.size) * parseFloat(app.config.nbY);
                $('#draw')
                    .width(width)
                    .height(height)
                    .css({
                    marginLeft: -width * .5,
                    marginTop: -height * .5
                });
            },
            squares: function () {
                var html = "";
                for (var i = 0; i < app.config.nbY; i++) {
                    for (var j = 0; j < app.config.nbX; j++) {
                        html += "<div class='square empty' data-x='" + j + "' data-y='" + i + "'></div>";
                    }
                }
                $('#draw').html(html);
                $('.square').width(app.config.size).height(app.config.size);
            },
            walls: function () {
                for (var i = 0; i < app.config.walls; i++) {
                    app.draw.randomType("wall");
                }
            },
            target: function () {
                app.draw.randomType("target");
            },
            cursor: function () {
                app.draw.randomType("cursor");
            }
        },
        randomType: function (_type) {
            var x = Math.trunc(Math.random() * app.config.nbX);
            var y = Math.trunc(Math.random() * app.config.nbY);
            if ($('.square[data-x=' + x + '][data-y=' + y + ']').hasClass("empty")) {
                app.draw.renderSquare(y, x, _type);
            }
            else {
                app.draw.randomType(_type);
            }
        },
        renderSquare: function (x, y, type) {
            if (!$('.square[data-x=' + y + '][data-y=' + x + ']').hasClass(type)) {
                $('.square[data-x=' + y + '][data-y=' + x + ']').removeClass("empty wall cursor target").addClass(type);
            }
        }
    },
    actions: {
        recordConfig: function () {
            app.actions.stop();
            var errors = [];
            $('.formField>input').each(function () {
                var val = parseInt($(this).val());
                var name = $(this).attr("name");
                if (isNaN(val)) {
                    errors.push(name + " n'est pas un entier");
                }
                else {
                    app.config[name] = val;
                }
            });
            if (errors.length != 0) {
                alert(errors.map(function (error) { return "- " + error; }).join('\n'));
            }
            else {
                app.draw.init();
            }
        },
        stop: function () {
            $('#stop').removeClass('active');
            $('#start').addClass('active');
            app.state = false;
            $('#iframe').remove();
        },
        start: function () {
            app.count = 0;
            $('#start').removeClass('active');
            $('#stop').addClass('active');
            app.state = true;
            app.deplacement.run();
            app.timer = setInterval(function () { return app.deplacement.run(); }, app.config.step);
        }
    },
    deplacement: {
        run: function () {
            if (app.state === false) {
                clearInterval(app.timer);
                return;
            }
            var direction = app.deplacement.chooseDirection();
            app.count++;
            app.deplacement.move(direction);
        },
        chooseDirection: function () {
            var direction = "";
            for (var i = 0; i < app.ways.length; i++) {
                if (app.ways[i].block === false) {
                    direction = app.ways[i].type;
                    app.more = 0;
                }
                else if (app.more !== 0) {
                    app.more = 1;
                }
            }
            if (direction === "") {
                app.more = 1;
                app.ways = app.deplacement.shuffle(app.ways);
                direction = app.deplacement.chooseDirection();
            }
            return direction;
        },
        move: function (_way) {
            var x = parseInt($('.cursor').attr('data-x'));
            var y = parseInt($('.cursor').attr('data-y'));
            var xx = x;
            var yy = y;
            var isOk = false;
            if (_way == 'N' && y > 0) {
                yy = y - 1;
                isOk = true;
            }
            else if (_way == 'E' && x < app.config.nbX - 1) {
                xx = x + 1;
                isOk = true;
            }
            else if (_way == 'S' && y < app.config.nbY - 1) {
                yy = y + 1;
                isOk = true;
            }
            else if (_way == 'O' && x > 0) {
                xx = x - 1;
                isOk = true;
            }
            if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("target")) {
                isOk = false;
                $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
                app.draw.renderSquare(yy, xx, 'finded');
                app.actions.stop();
                setTimeout(function () {
                    $("#app").append('<div id="iframe"><center>BRAVOOOOOOOOO, Count:' + app.count + ' ------- ' + $('.already').length + '/' + ($('.square').length - $('.wall').length) + ' ------- ' + Math.ceil(($('.already').length / ($('.square').length - $('.wall').length) * 100)) + '% <button onClick="$(\'#iframe\').remove();">Close</button></center></div>');
                    alert("Finded\nCount:" + app.count);
                }, 100);
            }
            else if (!$('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("empty")) {
                isOk = false;
            }
            if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("already")) {
                app.alreadyCount++;
            }
            if (app.alreadyCount === app.alreadyCountStep) {
                app.alreadyCount = 0;
                app.alreadyCountStep = Math.max(2, Math.trunc(Math.random() * Math.min(app.config.nbX, app.config.nbY)));
                isOk = false;
            }
            if (isOk) {
                $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
                app.draw.renderSquare(yy, xx, 'cursor');
            }
            else {
                app.deplacement.blockWay(_way);
            }
            return isOk;
        },
        blockWay: function (_way) {
            for (var i = 0; i < app.ways.length; i++) {
                if (app.ways[i].type === _way)
                    app.ways[i].block = true;
            }
        },
        shuffle: function (_ways) {
            var _a;
            for (var i = _ways.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [_ways[j], _ways[i]], _ways[i] = _a[0], _ways[j] = _a[1];
            }
            return _ways.map(function (_way) { _way.block = false; return _way; });
        }
    }
};
$(function () {
    app.init();
});

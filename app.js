jQuery.fn.extend({
    wlick: function (__) {
        return this.click(__);
    },
});

$(function () {
    app.init();
});

let app = {
    sounds:[
        "CpTLFchI8Zk",
    ],
    count:0,
    state:false,
    timer:null,
    alreadyCount: 0,
    alreadyCountStep: 5,
    ways:[
        { type: 'N', block: false },
        { type: 'E', block: false },
        { type: 'S', block: false },
        { type: 'O', block: false },
    ],
    model: {
        square: {
            type: 'empty',
            count: 0,
        }
    },
    config: {
        size: 20,
        nbX: 25,
        nbY: 25,
        walls: 10,
        step: 1000,
    },
    data: {
        
    },
    init() {

        $('#config>.formButtons>button[type=submit]').wlick(() => this.recordConfig());
        $('#start').wlick(() => $('#start').hasClass('active')?this.start():"");
        $('#stop').wlick(() => $('#stop').hasClass('active') ? this.stop() : "");

    },
    recordConfig() {

        this.stop();

        let errors = [];

        $('.formField>input').each(function () {

            const val = parseInt($(this).val());
            const name = $(this).attr("name");

            if (Number.isInteger(val)){
                app.config[name] = val;
            }else{
                errors.push(name+" n'est pas un entier")
            }

        });

        if (errors.length!=0){

            alert(errors.map(error=>"- "+error).join('\n'))

        }else{

            this.drawSet();

        }

    },
    drawSet() {

        this.drawSetPlan();
        this.drawSetSquares();
        this.drawSetWalls();
        this.drawSetTarget();
        this.drawSetCursor();

    },
    drawSetPlan() {
        const width = parseFloat(this.config.size) * parseFloat(this.config.nbX);
        const height = parseFloat(this.config.size) * parseFloat(this.config.nbY);
        $('#draw')
            .width(width)
            .height(height)
            .css({
                marginLeft: -width * .5,
                marginTop: -height * .5,
            });
    },
    drawSetSquares() {
        var html = "";
        for (var i = 0; i < this.config.nbY; i++) {
            for (var j = 0; j < this.config.nbX; j++) {
                html += "<div class='square empty' data-x='" + j + "' data-y='" + i + "'>";
                html += "</div>";
            }
        }
        $('#draw').html(html);
        $('.square').width(this.config.size).height(this.config.size)
    },
    drawSetWalls() {
        for (var i = 0; i < this.config.walls; i++) {
            this.randomType("wall");
        }
    },
    drawSetTarget() {
        this.randomType("target");
    },
    drawSetCursor() {
        this.randomType("cursor");
    },
    randomType(_type) {

        const x = parseInt(Math.random() * parseInt(this.config.nbX));
        const y = parseInt(Math.random() * parseInt(this.config.nbY));

        let isOk = false;

        if ($('.square[data-x=' + x + '][data-y=' + y + ']').hasClass("empty")) {

            this.renderSquare(y, x, _type);
            isOk = true;

        }

        if (!isOk) {

            this.randomType(_type);

        }

    },
    renderSquare(x,y,type) {
        if (!$('.square[data-x=' + y + '][data-y=' + x + ']').hasClass(type)) {
            $('.square[data-x=' + y + '][data-y=' + x + ']').removeClass("empty wall cursor target").addClass(type);
        }
    },
    stop() {
        $('#stop').removeClass('active');
        $('#start').addClass('active');
        this.state = false;
        $('#iframe').remove();
    },
    start() {
        this.count = 0;
        $('#start').removeClass('active');
        $('#stop').addClass('active');
        this.state = true;
        this.run();
        this.timer = setInterval(() => this.run(), this.config.step);
    },
    run() {
        if(this.state === false){
            clearInterval(this.timer);
            return ;
        }

        const direction = this.chooseDirection();

        this.count ++;
        console.log('tic', this.count, direction, this.move(direction), this.alreadyCount, this.alreadyCountStep);

    },
    chooseDirection(){

        let direction = "";

        for(var i=0; i<this.ways.length; i++){

            if (this.ways[i].block === false){
                
                direction = this.ways[i].type;

                this.more = 0;

            } else if (this.more !== 0){

                this.more = 1;

            }

        }

        if(direction === ""){

            this.more = 1;

            this.ways = this.shuffle(this.ways);

            direction = this.chooseDirection();

        }

        return direction;

    },
    move(_way){

        const x = parseInt($('.cursor').attr('data-x'));
        const y = parseInt($('.cursor').attr('data-y'));

        let xx = x;
        let yy = y;

        let isOk = false;

        if (_way == 'N' && y > 0){

            yy = y - 1;
            isOk = true;

        } else if (_way == 'E' && x < this.config.nbX-1) {

            xx = x + 1;
            isOk = true;

        } else if (_way == 'S' && y < this.config.nbY - 1) {

            yy = y + 1;
            isOk = true;

        } else if (_way == 'O' && x > 0) {

            xx = x - 1;
            isOk = true;

        }

        if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("target")) {

            isOk = false;
            $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
            this.renderSquare(yy, xx, 'finded')
            this.stop();
            setTimeout(() => {
                $("#app").append('<div id="iframe"><center>BRAVOOOOOOOOO, Count:' + this.count + ' ------- ' + $('.already').length + '/' + ($('.square').length - $('.wall').length) + ' ------- ' + Math.ceil(($('.already').length / ($('.square').length - $('.wall').length)*100)) + '% <button onClick="$(\'#iframe\').remove();">Close</button></center><iframe src="https://www.youtube.com/embed/'+this.sounds[parseInt(Math.random()*this.sounds.length)]+'?autoplay=1" frameborder = "0" allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen ></iframe ></div>');
                alert("Finded\nCount:"+this.count);
            },100);

        } else if (!$('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("empty")){

            isOk = false;

        }

        if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("already")){

            this.alreadyCount ++;

        }

        if (this.alreadyCount === this.alreadyCountStep){

            this.alreadyCount = 0;
            this.alreadyCountStep = Math.max(2,parseInt(Math.random() * Math.min(this.config.nbX, this.config.nbY)));
            isOk = false;

        }

        if (isOk){

            $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
            this.renderSquare(yy, xx, 'cursor')

        }else{

            this.blockWay(_way);

        }

        return isOk;

    },
    isTarget() {

    },
    blockWay(_way){

        for(var i=0; i<this.ways.length; i++){

            if (this.ways[i].type === _way) this.ways[i].block = true;

        }

    },
    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a.map((l)=>{l.block=false;return l;});
    }
}
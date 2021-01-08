interface WAY {
    type: string;
    block: boolean;
}

let app:any = {
    count:0,
    state:false,
    timer:null,
    alreadyCount: 0,
    alreadyCountStep: 5,
    ways:[],
    config: {
        size: 20,
        nbX: 25,
        nbY: 25,
        walls: 10,
        step: 1000,
    },
    init():void {
        app.ways.push({ type: 'N', block: false } as WAY);
        app.ways.push({ type: 'E', block: false } as WAY);
        app.ways.push({ type: 'S', block: false } as WAY);
        app.ways.push({ type: 'O', block: false } as WAY);
		app.actions.recordConfig();
        $('#config>.formButtons>button[type=submit]').click(() => app.actions.recordConfig());
        $('#start').click(() => $('#start').hasClass('active') ? app.actions.start() : "");
        $('#stop').click(() => $('#stop').hasClass('active') ? app.actions.stop() : "");
    },
    draw:{
        init():void {
            app.draw.set.plan();
            app.draw.set.squares();
            app.draw.set.walls();
            app.draw.set.target();
            app.draw.set.cursor();
        },
        set:{
            plan():void {
                const width:number = parseFloat(app.config.size) * parseFloat(app.config.nbX);
                const height:number = parseFloat(app.config.size) * parseFloat(app.config.nbY);
                $('#draw')
                    .width(width)
                    .height(height)
                    .css({
                        marginLeft: -width * .5,
                        marginTop: -height * .5,
                    });
            },
            squares():void {
                var html:string = "";
                for (let i:number = 0; i < app.config.nbY; i++) {
                    for (let j:number = 0; j < app.config.nbX; j++) {
                        html += "<div class='square empty' data-x='" + j + "' data-y='" + i + "'></div>";
                    }
                }
                $('#draw').html(html);
                $('.square').width(app.config.size).height(app.config.size)
            },
            walls():void {
                for (let i:number = 0; i < app.config.walls; i++) {
                    app.draw.randomType("wall");
                }
            },
            target():void {
                app.draw.randomType("target");
            },
            cursor():void {
                app.draw.randomType("cursor");
            }
        },
        randomType(_type:string):void {
            const x:number = Math.trunc(Math.random() * app.config.nbX);
            const y:number = Math.trunc(Math.random() * app.config.nbY);
            if ($('.square[data-x=' + x + '][data-y=' + y + ']').hasClass("empty")) {
                app.draw.renderSquare(y, x, _type);
            }else{
                app.draw.randomType(_type);
            }
        },
        renderSquare(x:number, y:number, type:string):void {
            if (!$('.square[data-x=' + y + '][data-y=' + x + ']').hasClass(type)) {
                $('.square[data-x=' + y + '][data-y=' + x + ']').removeClass("empty wall cursor target").addClass(type);
            }
        }
    },
    actions:{
        recordConfig():void {
            app.actions.stop();
            let errors:string[] = [];
            $('.formField>input').each(function () {
                const val:number = parseInt(<string>$(this).val());
                const name:string = <string>$(this).attr("name");
                if (isNaN(val)){
                    errors.push(name+" n'est pas un entier")
                }else{
                    app.config[name] = val;
                }
            });
            if (errors.length!=0){
                alert(errors.map(error=>"- "+error).join('\n'))
            }else{
                app.draw.init();
            }
        },
        stop():void {
            $('#stop').removeClass('active');
            $('#start').addClass('active');
            app.state = false;
            $('#iframe').remove();
        },
        start():void {
            app.count = 0;
            $('#start').removeClass('active');
            $('#stop').addClass('active');
            app.state = true;
            app.deplacement.run();
            app.timer = setInterval(() => app.deplacement.run(), app.config.step);
        }
    },
    deplacement:{
        run():void {
            if(app.state === false){
                clearInterval(app.timer);
                return ;
            }
            const direction = app.deplacement.chooseDirection();
            app.count ++;
            app.deplacement.move(direction);
        },
        chooseDirection():string {
            let direction:string = "";
            for(let i:number = 0; i<app.ways.length; i++){
                if (app.ways[i].block === false){
                    direction = app.ways[i].type;
                    app.more = 0;
                } else if (app.more !== 0){
                    app.more = 1;
                }
            }
            if(direction === ""){
                app.more = 1;
                app.ways = app.deplacement.shuffle(app.ways);
                direction = app.deplacement.chooseDirection();
            }
            return direction;
        },
        move(_way:string):boolean {
    
            const x:number = parseInt($('.cursor').attr('data-x'));
            const y:number = parseInt($('.cursor').attr('data-y'));
            let xx:number = x;
            let yy:number = y;
            let isOk:boolean = false;
    
            if (_way == 'N' && y > 0){
                yy = y - 1;
                isOk = true;
            } else if (_way == 'E' && x < app.config.nbX-1) {
                xx = x + 1;
                isOk = true;
            } else if (_way == 'S' && y < app.config.nbY - 1) {
                yy = y + 1;
                isOk = true;
            } else if (_way == 'O' && x > 0) {
                xx = x - 1;
                isOk = true;
            }
    
            if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("target")) {
                isOk = false;
                $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
                app.draw.renderSquare(yy, xx, 'finded')
                app.actions.stop();
                setTimeout(() => {
                    $("#app").append('<div id="iframe"><center>BRAVOOOOOOOOO, Count:' + app.count + ' ------- ' + $('.already').length + '/' + ($('.square').length - $('.wall').length) + ' ------- ' + Math.ceil(($('.already').length / ($('.square').length - $('.wall').length)*100)) + '% <button onClick="$(\'#iframe\').remove();">Close</button></center></div>');
                    alert("Finded\nCount:"+app.count);
                },100);
            } else if (!$('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("empty")){
                isOk = false;
            }
    
            if ($('.square[data-x=' + xx + '][data-y=' + yy + ']').hasClass("already")){
                app.alreadyCount ++;
            }
    
            if (app.alreadyCount === app.alreadyCountStep){
                app.alreadyCount = 0;
                app.alreadyCountStep = Math.max(2,Math.trunc(Math.random() * Math.min(app.config.nbX, app.config.nbY)));
                isOk = false;
            }
    
            if (isOk){
                $('.cursor').removeClass('cursor').addClass('empty').addClass('already');
                app.draw.renderSquare(yy, xx, 'cursor');
            }else{
                app.deplacement.blockWay(_way);
            }
    
            return isOk;
    
        },
        blockWay(_way:(boolean|number)[]):void{
            for(let i:number = 0; i<app.ways.length; i++){
                if (app.ways[i].type === _way) app.ways[i].block = true;
            }
        },
        shuffle(_ways:WAY[]):WAY[] {
            for (let i:number = _ways.length - 1; i > 0; i--) {
                const j:number = Math.floor(Math.random() * (i + 1));
                [_ways[i], _ways[j]] = [_ways[j], _ways[i]];
            }
            return _ways.map((_way:WAY)=>{_way.block=false;return _way;});
        }
    }
}

$(function () {
    app.init();
});
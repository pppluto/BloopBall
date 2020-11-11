// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Graphics)
    ctx: cc.Graphics = null;

    @property(cc.Node)
    mainWorld: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.ctx.lineCap = cc.Graphics.LineCap.ROUND;
    }
    drawCircle(x,r,color){
        x = Math.min(300,x);
        this.ctx.fillColor = color
        this.ctx.lineWidth = 0;
        this.ctx.circle(x,0,r);
        this.ctx.fill();
        this.ctx.stroke();
    }
    drawLine(startX,endX,color){
        endX = Math.min(300,endX);
        this.ctx.lineWidth = 10;
        this.ctx.strokeColor = color
        this.ctx.moveTo(startX,0);
        this.ctx.lineTo(endX,0);
        this.ctx.stroke();
        this.ctx.fill();
    }
    drawProgress(){
        if(!this.ctx) return;
        let mainWorld = this.mainWorld.getComponent('mainWorld');
        let balls = mainWorld.balls;
        let endmark = mainWorld.mapLength;
        if(!balls || !balls.length) return;

        let user = balls[0];
        this.ctx.clear();

        let progressBarLen = 300;
        let userX = user.x / endmark * progressBarLen;
      
        let color = cc.color(100,100,100,255);
        this.drawLine(0,300,color)
        this.drawLine(0,userX,cc.Color.ORANGE)
       
        balls.slice(1).forEach(element => {
            let x =  element.x / endmark * progressBarLen;
            this.drawCircle(x,4,cc.Color.YELLOW)
        });

        this.drawCircle(userX,8,cc.Color.RED);
    }
    update (dt) {
        this.drawProgress()
    }
}

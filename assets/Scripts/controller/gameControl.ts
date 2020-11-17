// http://www.emanueleferonato.com/2011/10/04/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d-%E2%80%93-adding-more-bumps/
import SkillHost from '../roles/skillHost'
import { SkinMapping } from '../roles/RoleMapping'


cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
   
    //减少物理计算步长/迭代次数
    // physicsManager.enabledAccumulator = true;
    // physicsManager['MAX_ACCUMULATOR'] = 1/5 //给物理系统计算的时间
    // physicsManager['FIXED_TIME_STEP'] = 1/24;
    // physicsManager['VELOCITY_ITERATIONS'] = 5;
    // physicsManager['POSITION_ITERATIONS'] = 5;
   
    physicsManager.debugDrawFlags = 
        0;
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;

    // var manager = cc.director.getCollisionManager();
    // manager.enabled = true;
    // manager.enabledDebugDraw = true;
    // manager.enabledDrawBoundingBox = true;

    // cc.macro.SHOW_MESH_WIREFRAME = true;

});


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    mainWorld: cc.Node = null;

    //scene relate
    @property(cc.Node)
    gameBoard: cc.Node = null
    @property(cc.Label)
    gameHint: cc.Label = null
    @property(cc.Node)
    restartBtn: cc.Node = null
    
    @property(cc.Prefab)
    motorBall: cc.Prefab = null
    //camera
    @property(cc.Camera)
    playerCamera: cc.Camera = null
    otherCamera: cc.Camera = null


    @property(cc.Graphics)
    ctx: cc.Graphics = null;


    balls: Array<cc.Node> = [];
    playerRank: number = 1;
    playerFinish: boolean = false;

    onLoad () {
        this.ctx.lineCap = cc.Graphics.LineCap.ROUND;
        this.gameBoard.active = false;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType['TOUCH_START'], this.onTouchStart, this);
        this.prepareBalls();
        // return
        this.scheduleOnce(() => {
            this.startGame();
            // const phyMgr = cc.director.getPhysicsManager();
            // phyMgr.gravity = cc.v2(2 * 32,-10 * 32);
        },3);
        let interval = 2;
        let delay = 3;
        this.schedule(this.autoUseSkill,interval,cc.macro.REPEAT_FOREVER,delay)
    }
    onDestroy(){
        this.unscheduleAllCallbacks();
    }
    onKeyDown (event) {
        console.log('keydow')
        switch(event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.onUpPress();
                break;
        }
    }
    onTouchStart(){
        console.log('touchstart');
        this.onUpPress();
    }
    onUpPress(){
        let player = this.balls[0];
        if(player){
            let bc = player.getComponent('ballControl')
            bc.onUpPress();
        }
    }
    startGame(){
        console.log('startgame');
        this.balls.forEach((b) => {
            let bControl = b.getComponent('ballControl');
            bControl.gameMgr = this;
            bControl.startGame();
        })
    }
    playerWin(isAI){
        console.log('player win',isAI)
        if(this.playerFinish) return;
        if(isAI && !this.playerFinish) {
            this.playerRank +=1;
        } else {
          this.showBoard()
        }
    }
    showBoard(){
        let wjs = this.mainWorld.getComponent('mainWorld');
        wjs.playerFinish = true;
        this.playerFinish = true;
        this.gameBoard.active = true;
        this.gameHint.string = `您获得第${this.playerRank}名`;
    }
    restart(){
        cc.director.loadScene('Main');
    }
    autoUseSkill(){
        let otherPlayers = this.balls.slice(1);
        let random = Math.floor(Math.random() * otherPlayers.length);
        let randomPlayer = otherPlayers[random];
        this.useSkillWithPlayer(randomPlayer)
    }
    useSkill(){
        let player = this.balls[0];
        if(!player) return;
        this.useSkillWithPlayer(player)
       
    }
    useSkillWithPlayer(player){
        let playerCtr = player.getComponent('ballControl');
        playerCtr.triggerSkill()
        
    }
    prepareBalls(){
        let player_num = 4;
        let yPosition = 300;
        let xPosition = 400;
        this.balls = [];
        for (let index = 0; index < player_num; index++) {
            let otherPlayer = cc.instantiate(this.motorBall);
            let ball = otherPlayer.getComponent('motorBall');
            //先确定位置，不然初始化时，会因为堆在一起产生碰撞效果
            ball.initWithPosition(cc.v2( xPosition + (index + 1) * 100, yPosition ));

            let skinConfig = SkinMapping['spider'];
            ball.skinConfig = skinConfig
            this.mainWorld.addChild(otherPlayer);
            ball.enableContact = index === 0;
            ball.prepare()
            
            let bControl = otherPlayer.getComponent('ballControl')
            bControl.gameMgr = this;
            bControl.isAI = index !== 0;
            bControl.AILevel = index;
            bControl.skillConfig = skinConfig.skill;
            this.balls.push(otherPlayer);
            bControl.init();

            if(index === 0){
                let playerC = this.playerCamera.getComponent('camera-control');
                playerC.target = otherPlayer;
            }
        }
    }
    getMapLength(){
        let mainWorld = this.mainWorld.getComponent('mainWorld');
        let endmark = mainWorld.mapLength;
        return endmark;
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
        let balls = this.balls;
        let endmark = this.getMapLength();
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

    // update (dt) {}
}

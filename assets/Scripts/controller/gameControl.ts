// http://www.emanueleferonato.com/2011/10/04/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d-%E2%80%93-adding-more-bumps/
import { RoleList, RoleSkinMapping,SkillMapping } from '../roles/RoleMapping'
import Global from '../global';
import PlayerHelper from '../helper/player';
import { ZoneMapping } from '../helper/ZoneMapping';

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
export default class GameControl extends cc.Component {

    @property(cc.Node)
    mainWorld: cc.Node = null;

    @property(cc.Prefab)
    motorBall: cc.Prefab = null
    //camera
    @property(cc.Camera)
    playerCamera: cc.Camera = null
    otherCamera: cc.Camera = null


    @property(cc.Graphics)
    ctx: cc.Graphics = null;


    balls: Array<cc.Node> = [];
    playerIndex: number = 0;
    playerRank: number = 1;
    playerFinish: boolean = false;

    onLoad () {

        // let {AIRange,highAINum} = PlayerHelper.instance.matchAI();
        // let [low,high] = AIRange;

        PlayerHelper.instance.setup()

        this.ctx.lineCap = cc.Graphics.LineCap.ROUND;
        // this.gameBoard.active = false;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType['TOUCH_START'], this.onTouchStart, this);
        this.prepareBalls();
        // return
        this.scheduleOnce(() => {
            this.startGame();
            const phyMgr = cc.director.getPhysicsManager();
            phyMgr.gravity = cc.v2(0,-15 * 32);//重力高一些
        },3);

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
        let player = this.balls[this.playerIndex];
        if(player){
            let bc = player.getComponent('ballControl')
            bc.onUpPress();
        }
    }
    startGame(){
        console.log('startgame');
        this.balls.forEach((b) => {
            let bControl = b.getComponent('ballControl');
            bControl.gameCtr = this;
            bControl.startGame();
        })
    }
    playerWin(ballControl){
        console.log('****',ballControl.isAI ? 'AI finish' :'player finish');
        if(this.playerFinish) return;
        if(ballControl.isAI && !this.playerFinish) {
            this.playerRank +=1;
        } else {
          this.showBoard()
        }
    }
    showBoard(){
        let sortBalls = this.balls.slice().sort((a,b) => {
            return a.x - b.x;
        })
        let roleRankResult = sortBalls.map((b) => {
            let bc = b.getComponent('ballControl');
            return {
                role: bc.role,
                seq: bc.playerSeq
            }
        })
        let wjs = this.mainWorld.getComponent('mainWorld');
        wjs.playerFinish = true;
        this.playerFinish = true;
      
        Global.lastGameResult = {
            ballRankList: roleRankResult,
            userSeq: this.playerIndex,
            playerRank: this.playerRank
        };

        cc.director.loadScene('Result');

    }
    restart(){
        cc.director.loadScene('Main');
    }
    relaunch(){
        cc.director.loadScene('Start');
    }
    autoUseSkill(){
        let players = this.balls.filter((_,v) => v !== this.playerIndex)
        let random = Math.floor(Math.random() * players.length);
        let randomPlayer = players[random];
        this.useSkillWithPlayer(randomPlayer)
    }
    useSkill(){
        let player = this.balls[this.playerIndex];
        this.useSkillWithPlayer(player)
       
    }
    useSkillWithPlayer(player){
        if(!player) return;

        let playerCtr = player.getComponent('ballControl');
        playerCtr.triggerSkill()
        
    }
    prepareSkillBtn(){
        let userUsedRole = Global.roleUsed;
        let unlockSkillNames = PlayerHelper.getUnlockedRoleSkillNames(userUsedRole.id);
    }
    prepareBalls(){
        let player_num = 2;
        let yPosition = 300;
        let xPosition = 400;
        this.balls = [];
        let userIndex = Math.floor(Math.random() * player_num);
        this.playerIndex = userIndex;

        //TODO:随机生成其它的电脑角色
        let userUsedRole = Global.roleUsed || RoleList[0];
        // let zoneConfig = ZoneMapping[Global.zoneUsed.name];
        // let roleIds = zoneConfig.avaliableRoleIds.filter(i => i !== userUsedRole.id);

        for (let index = 0; index < player_num; index++) {
            let player = cc.instantiate(this.motorBall);
            let ball = player.getComponent('motorBall');
            //先确定位置，不然初始化时，会因为堆在一起产生碰撞效果
            ball.initWithPosition(cc.v2( xPosition + (index + 1) * 100, yPosition ));

            let role = userUsedRole;
            if(userIndex === index) {
                role = userUsedRole;
            }
            let roleSkin =  RoleSkinMapping[role.name]

            let isAI = index !==  userIndex;
            let RoleSKinConfig = roleSkin;
            ball.RoleSKinConfig = RoleSKinConfig
            this.mainWorld.addChild(player);
            ball.enableContact = true;
            ball.isAI = isAI
            ball.prepare()
            
            let bControl = player.getComponent('ballControl')
            bControl.role = role;
            bControl.playerSeq = index;
            bControl.gameCtr = this;
            bControl.isAI = isAI;
            bControl.AILevel = index;
            bControl.skillConfig = SkillMapping[role.defaultSkillName];
            this.balls.push(player);
            bControl.init();

            if(!isAI){
                let playerC = this.playerCamera.getComponent('camera-control');
                playerC.target = player;
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

        let user = balls[this.playerIndex];
        this.ctx.clear();

        let progressBarLen = 300;
        let userX = user.x / endmark * progressBarLen;
      
        let color = cc.color(100,100,100,255);
        this.drawLine(0,300,color)
        this.drawLine(0,userX,cc.Color.ORANGE)
       
        balls.forEach((element,index) => {
            if(index === this.playerIndex) return;
            let x =  element.x / endmark * progressBarLen;
            this.drawCircle(x,4,cc.Color.YELLOW)
        });

        this.drawCircle(userX,8,cc.Color.RED);
    }
    showDebug(msg:string){
        let debug = this.node.getChildByName('debug');
        let debugjs = debug.getComponent('debugTool');
        debugjs.showDebug(msg);
    }
    showDebugList(){
        cc.director.pause();
        let debug = this.node.getChildByName('debug');
        debug.active = true;
    }
    updateConfig(){
        this.balls.forEach(b => {
            let bcontrol = b.getComponent('ballControl');
            if(bcontrol){
                bcontrol.updateAIConfig();
                bcontrol.updateBallConfig();
            }
            let motorBall = b.getComponent('motorBall');
            if(motorBall){
                motorBall.updateBallConfig();
            }
        })
    }
    update (dt) {
        this.drawProgress()
    }

    // update (dt) {}
}

import {TagType}from '../mainWorld'
import GameControl from './gameControl'
const {ccclass, property} = cc._decorator;

@ccclass
export default class BallController extends cc.Component{

    buffState: number = TagType.DEFAULT;
    gameStart: boolean = false;
    minXSpeed: number = 150;
    AILevel: number = 1;
    prePressTS: number = 1;
    isAI: boolean = false;
    _finished: boolean = false;
    body: cc.RigidBody = null;
    gameMgr: GameControl = null;
    _collideCount: number = 0;

    onLoad() {

    }

    init(){
        this.prePressTS = 0;
        if(this.isAI) {
            let interval = 3;
            this.schedule(this.autoJump, interval);
            return;
        };

    }
    start () {
        let ballJS = this.getComponent('motorBall');
        this.body = ballJS.spheres[0];
    }
    startGame (){
        this.gameStart = true;
        let randomY = Math.round(Math.random() * 100);
        // this.applyForce(cc.v2(300,randomY));
        let rigid = this.body;
        let center = rigid.getWorldCenter()
        rigid.applyLinearImpulse(cc.v2(2000,randomY),center,true);

    }
    jump(){
        let body = this.body;
        let center = body.getWorldCenter();
        let mass = body.getMass()
        let vec = cc.v2(0,100000)
        body.applyForce(vec,center,true);
    }

    applyImpluse(){
        let ballJS = this.getComponent('motorball');
        if(!ballJS || !ballJS.spheres) return;
        ballJS.spheres.forEach(element => {
            let rigid = element;
            let center = rigid.getWorldCenter()
            rigid.applyLinearImpulse(cc.v2(0,100),center,true);
        });  
       
    }
    applyForce(force=-300){
        if(this.buffState === TagType.DEBUFF_TAG) {
            force += 100;
        }
        let body = this.body;
        body.applyTorque(force,true);
    }
    disableSchedule(){
        this.unschedule(this.autoJump)
    }
    autoJump() {
        let AILevel = this.AILevel;
        let random = 1 / AILevel;
        let shouldJump = Math.random() < random;
        if(shouldJump){
            this.jump();
        }
    }
    // jump(){
    //     if(this._finished) return;
    //     this.applyForce(cc.v2(0,300));
    // }
    // applyForce(impulse){
    //     let ball2 = this.getComponent('ball2');

    //     let rigidBodies = ball2.spheres;
    //     impulse = impulse.mul(4)
    //     impulse = impulse.div(rigidBodies.length)
    //     rigidBodies.forEach(rigid => {
    //         var worldCenter = rigid.getWorldCenter();
    //         rigid.applyLinearImpulse(impulse,worldCenter,true);
    //         // rigid.applyAngularImpulse(-2000)
    //         // rigid.applyTorque(-1000)
    //     });
    // }

    onUpPress(){
        let now = new Date().getTime();
        if(now - this.prePressTS < 300) return;

        this.prePressTS = now;
        let collideCount = this._collideCount;
        console.log('upPress--collider count',collideCount)
        if(collideCount <= 0) {
            return;
        }
        this.jump()
    }

    jumpIfNeed() {
        this.onUpPress();
    }

    //中心刚体碰撞
    onBeginContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台

        if(otherCollider.tag === TagType.FINAL_TAG){
            console.log('****',this.isAI ? 'AI finish' :'player finish');
            this.winGame()
        }

        //TODO:区分世界障碍和技能障碍？
        if(otherCollider.tag === TagType.DEBUFF_TAG){

            let skillhost = otherCollider.node.parent.getComponent('skillHost');
            let isMy = false;
            if(skillhost){
                isMy = skillhost.trigger === this.node;
                // let effect = skillhost.skillConfig.effect;
            }
            if(isMy) return;
        
            this.buffState = TagType.DEBUFF_TAG;
        }
    }
    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        if(otherCollider.tag === TagType.FINAL_TAG){
            console.log('*************endcontact',this.isAI)
        }
        if(otherCollider.tag === TagType.DEBUFF_TAG){
            this.buffState = null
        }

    }
    /**
     *  //球边缘碰撞
     * 拿到barrier信息，来限制或增益球的运动
     *
     */
    onAroundBeginContact (contact, selfCollider, otherCollider) {
        // let barrierHost = otherCollider.node.parent.getComponent('barrierHost');
        //需要去重处理，有多个边缘球碰撞事件
        // TODO:技能块区分自己还是别人
        let controlNode = otherCollider.node.parent;
        if(controlNode){
            let otherBallControl = controlNode.getComponent('ballControl')
        }
      

        let otherGroup = otherCollider.node.group
        if(otherGroup ==='ground' || otherGroup ==='block' ){
            this._collideCount += 1;
        }
    }
    onAroundEndContact (contact, selfCollider, otherCollider) {
        // let barrierHost = otherCollider.node.parent.getComponent('barrierHost');

        let controlNode = otherCollider.node.parent;
        if(controlNode){
            let otherBallControl = controlNode.getComponent('ballControl')
        }

        let otherGroup = otherCollider.node.group
        if(otherGroup ==='ground' || otherGroup ==='block' ){
            this._collideCount -= 1;
        }
    }
    winGame(){
        this._finished = true;
        this.disableSchedule();
        this.gameMgr.playerWin(this.isAI);
    }
    update (dt) {
     
        if(!this.gameStart) return;
        // if(this._finished) return;

        this.applyForce();

        // if(this.buffState === TagType.DEBUFF_TAG) {
        //     let velocity = this.body.linearVelocity;
        //     let vx = Math.min(20,velocity.x);
        //     let vy = Math.min(20,velocity.y)
        //     let av = this.body.angularVelocity;
        //     this.body.linearVelocity = cc.v2(vx,vy);
        //     this.body.angularVelocity = Math.min(av,20);
        // }

        // return;

        // if(!this.isAI) {
        //     return;
        // } 

        let velocity = this.body.linearVelocity;

        if(this.node.y > 600){
            this.node.y = 600;

            this.body.linearVelocity = cc.v2(velocity.x,0);

        }
        //不能直接修改速度，可能导致球滑行
        if(velocity.x <= this.minXSpeed){
            this.body.linearVelocity = cc.v2(this.minXSpeed,velocity.y);
        }

        if(this.buffState === TagType.DEBUFF_TAG) {
            this.body.linearVelocity = cc.v2(20,20);
            this.body.angularVelocity = this.body.angularVelocity/2
        }
    }
}

import {Global} from '../global'
import MainWorld,{TagType}from '../mainWorld'
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
    gameMgr: MainWorld = null;
    onLoad() {
        //main中控制是否游戏开始
        // this.gameStart = false;
        // this.minXSpeed = 200;
        // this.AILevel = 1;

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
        let motorBall = this.getComponent('motorBall');
        this.body = motorBall.spheres[0];
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
    applyForce(){
        let body = this.body;
        body.applyTorque(-300,true);
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
        let collideCount = Global.instance._collideCount;
        console.log('upPress--collider count',collideCount)
        if(collideCount <= 0) {
            return;
        }
        this.jump()
    }

    jumpIfNeed() {
        this.onUpPress();
    }

    onBeginContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        if(otherCollider.tag === TagType.FINAL_TAG){
            console.log('****',this.isAI ? 'AI finish' :'player finish');
            this.winGame()
        }

        if(otherCollider.tag === TagType.DEBUFF_TAG && this.isAI){
            this.buffState = TagType.DEBUFF_TAG;
        }
    }
    winGame(){
        this._finished = true;
        this.gameMgr.playerWin(this.isAI);
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
    update (dt) {
     
        if(!this.gameStart) return;
        this.applyForce();
        return;

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
        }
    }
}

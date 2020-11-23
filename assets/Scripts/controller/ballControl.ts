import {TagType}from '../mainWorld'
import GameControl from './gameControl'
import {SkillConfig} from '../roles/RoleMapping'
import SkillHost from '../roles/skillHost'
import AIHelper, { AIConfig,getAIConfigByLevel } from '../helper/AI'
import Storage from '../common/Storage'
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
    gameCtr: GameControl = null;
    _collideCount: number = 0;
    skillConfig: SkillConfig = null;
    aiHelper: AIHelper = null
    preSkillTriggerTS: number = 0;
    preBehaveTS: number = 0;

    //TODO: 期望改成 map 结构，或者2进制做与或操作来判断
    // flagStateMap: Map<string,any> = new Map()
    stateFlag: string = null;

    onLoad() {

    }

    init(){
        this.prePressTS = 0;
        if(this.isAI) {
            let helper = new AIHelper();
            // helper.config = getAIConfigByLevel(this.AILevel)
            helper.config = Storage.getItem(Storage.AI_CONFIG_KEY)
            this.aiHelper = helper;

            let interval = helper.config.behaveInterval || 2;
            this.schedule(this.autoControl, interval);
        };

    }
    updateAIConfig(){
        if(!this.aiHelper) return;
        let config = Storage.getItem(Storage.AI_CONFIG_KEY);
        console.log('update',config)
        this.aiHelper.config = config
    }
    start () {
        let ballJS = this.getComponent('motorBall');
        this.body = ballJS.spheres[0];
    }
    startGame (){
        this.gameStart = true;
        return;
        let randomY = Math.round(Math.random() * 30);
        // this.applyForce(cc.v2(300,randomY));
        let rigid = this.body;
        let center = rigid.getWorldCenter()
        rigid.applyLinearImpulse(cc.v2(2000,randomY),center,true);

    }
    skillAvaliable(){
        let now = new Date().getTime();
        let cd = this.skillConfig.cd * 1000;
        return !cd || now - this.preSkillTriggerTS > cd;
    }
    triggerSkill(){
        if(!this.skillAvaliable()){
            return;
        }
        this.preSkillTriggerTS = new Date().getTime();
        let node = new cc.Node();
        node.setPosition(this.node.position);
        node.parent = this.node.parent;
        let host = node.addComponent(SkillHost);
        host.skillConfig = this.skillConfig
        host.trigger = this.node;
        host.useSkill();
    }
    //TODO:根据质量确定力，扭矩的大小
    jump(){
        if(this._collideCount <= 0) {
            return;
        }
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
        let m = body.getMass()
        body.applyTorque(m * force,true);
    }
    disableSchedule(){
        this.unschedule(this.autoControl)
    }
    autoControl() {

        let now = new Date().getTime()
        this.preBehaveTS = now;
        console.log('jump',this.stateFlag)

        if(this.stateFlag === 'block') {
           this.jumpWhenBlocked()
        }

        this.aroundCheck();

        //TODO:拿到周围障碍信息

    }
    showDebugInfo(msg){
        this.gameCtr.showDebug(msg);
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

    jumpWhenBlocked() {
        if(this.aiHelper){
            let jump =  this.aiHelper.shouldJumpWhenBlocked();
            let tmp = jump?'选择跳过':'选择不跳过'
            this.showDebugInfo('碰到障碍,'+tmp);
            if(jump){
                this.jump();
            }
        }
    }
    aroundCheck(){
        // return;
        // 先检查cd,会快一点，放下面方便调试
        // if(!this.skillAvaliable()){
        //     this.showDebugInfo('技能未准备好')
        //     return;
        // }
        let otherballs = <any>this.gameCtr.balls.filter(v => v.position.sub(this.node.position).mag() > 10);
        let has = this.aiHelper.hasEnemyInSkill(this.node,otherballs,this.skillConfig.effect);
        let mapLength = this.gameCtr.getMapLength();
        let shouldTrigger = this.aiHelper.shouldUseSkill(this.node,mapLength);
        if(has && shouldTrigger){
            if(!this.skillAvaliable()){
                this.showDebugInfo('技能未准备好')
                return;
            }
            this.showDebugInfo('使用技能')
            this.triggerSkill()
        } else {
            let tmp = has?'周围有敌人，不使用技能':'周围无敌人';
            this.showDebugInfo(tmp)
        }
        //TODO:范围检测，技能，特殊障碍，放这里
    }

    //中心刚体碰撞
    onBeginContact (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        let otherGroup = otherCollider.node.group
        if(otherGroup ==='ground' || otherGroup ==='block' ){
            this._collideCount += 1;
            if(otherGroup === 'block'){
                // this.jumpWhenBlocked();
                this.stateFlag = otherGroup;
            }
        }

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
        let otherGroup = otherCollider.node.group
        if(otherGroup ==='ground' || otherGroup ==='block' ){
            this._collideCount -= 1;
            if(otherGroup === 'block'){
                this.stateFlag = '';
            }
        }
        
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
            if(otherGroup === 'block'){
                this.stateFlag = otherGroup;
            }
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
            if(otherGroup === 'block'){
                this.stateFlag = '';
            }
        }
    }
    winGame(){
        this._finished = true;
        this.disableSchedule();
        this.gameCtr.playerWin(this.isAI);
    }
    update (dt) {
     
        if(!this.gameStart) return;
        // if(this._finished) return;


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
        let angularV = this.body.angularVelocity;

        if(this.node.y > 600){
            this.node.y = 600;

            this.body.linearVelocity = cc.v2(velocity.x,0);

        }

        if(angularV < 600) {
            this.applyForce();
        }
       
        // //不能直接修改速度，可能导致球滑行
        if(velocity.x <= this.minXSpeed){
            this.body.linearVelocity = cc.v2(this.minXSpeed,velocity.y);
        }

        if(this.buffState === TagType.DEBUFF_TAG) {
            this.body.linearVelocity = cc.v2(20,20);
            this.body.angularVelocity = angularV / 2
        }
    }
}

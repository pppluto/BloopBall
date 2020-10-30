var global = require('./global')

const MOVE_LEFT = 1;
const MOVE_RIGHT = 2;
var {TagType} = require('./main')
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        //main中控制是否游戏开始
        this.gameStart = false;
        this.minXSpeed = 200;
        this.AILevel = 1;
        this._collideCount = 0;
       
        this.moveFlags = 0;
    },

    init(){
        console.log('ballcontrol',this.isAI)
        if(this.isAI) {
            let interval = 3;
            this.schedule(this.autoJump, interval);
            return;
        };

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        var canvas = cc.find('/Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

    },
    start () {
        this.body = this.getComponent(cc.RigidBody);

        // this.body.applyForceToCenter(cc.v2(100,0),true);
    },
    startGame (){
        this.gameStart = true;
        let randomY = Math.round(Math.random() * 100);
        this.applyForce(cc.v2(300,randomY));

    },
    disableSchedule(){
        this.unschedule(this.autoJump)
    },
    autoJump() {
        let AILevel = this.AILevel;
        let random = 1 / AILevel;
        let shouldJump = Math.random() < random;
        if(shouldJump){
            this.jump();
        }
    },
    jump(){
        if(this._finished) return;
        // if(!this.gameStart) return;
      
        // this.body = this.getComponent(cc.RigidBody);
        // var worldCenter = this.body.getWorldCenter();
        // let localCenter = this.body.getLocalCenter();
        // this.body.applyLinearImpulse(cc.v2(0,150),worldCenter,true);

        this.applyForce(cc.v2(0,300));

        // let velocity = this.body.linearVelocity;
        // if(velocity.x <= this.minXSpeed){
        //     this.body.linearVelocity = cc.v2(60,velocity.y);
        // }
    },
    applyForce(impulse){
        let ball1 = this.getComponent('ball1');

        let rigidBodies = ball1.spheres;
        impulse = impulse.div(rigidBodies.length)
        rigidBodies.forEach(rigid => {
            var worldCenter = rigid.getWorldCenter();
            rigid.applyLinearImpulse(impulse,worldCenter,true);
        });
    },
    onKeyDown (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveFlags |= MOVE_LEFT;
                this.updateMotorSpeed();
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveFlags |= MOVE_RIGHT;
                this.updateMotorSpeed();
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.onUpPress();
                break;
        }
    },
    onUpPress(){
        let collideCount = global._collideCount;
        console.log('upPress--collider count',collideCount)
        if(collideCount <= 0) {
            return;
        }
        this.jump()
    },
    onKeyUp (event) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveFlags &= ~MOVE_LEFT;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveFlags &= ~MOVE_RIGHT;
                break;
        }
    },

    onTouchStart: function (event) {
        let touchLoc = event.touch.getLocation();
        if (touchLoc.x < cc.winSize.width/2) {
            this.moveFlags |= MOVE_LEFT;
        }
        else {
            this.moveFlags |= MOVE_RIGHT;
        }
        this.updateMotorSpeed();
    },

    onTouchEnd: function (event) {
        let touchLoc = event.touch.getLocation();
        if (touchLoc.x < cc.winSize.width/2) {
            this.moveFlags &= ~MOVE_LEFT;
        }
        else {
            this.moveFlags &= ~MOVE_RIGHT;
        }
        // this.updateMotorSpeed();
    },
    updateMotorSpeed () {
        return;
        // if ( !this.body )
        //     return;
        // var desiredSpeed = 0;
        // if ( (this.moveFlags & MOVE_LEFT) == MOVE_LEFT )
        //     desiredSpeed = -500;
        // else if ( (this.moveFlags & MOVE_RIGHT) == MOVE_RIGHT )
        //     desiredSpeed = 500;


        // this.body.applyForceToCenter(cc.v2(desiredSpeed,0));

        // this.body.angularVelocity = desiredSpeed / 100;
    },
    onBeginContact: function (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        if(otherCollider.tag === TagType.FINAL_TAG){
            this._finished = true;
            console.log('****',this.isAI ? 'AI finish' :'player finish');
            this.gameMgr.playerWin(this.isAI);
        }

        if(otherCollider.tag === TagType.DEBUFF_TAG && this.isAI){
            this.buffState = TagType.DEBUFF_TAG;
        }
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        if(otherCollider.tag === TagType.FINAL_TAG){
            console.log('*************endcontact',this.isAI)
        }
        if(otherCollider.tag === TagType.DEBUFF_TAG){
            this.buffState = null
        }

    },
    update: function (dt) {
        if(!this.gameStart) return;
        // if(!this.isAI) {
        //     return;
        // } 

        let velocity = this.body.linearVelocity;

        if(this.node.y > 600){
            this.node.y = 600;

            this.body.linearVelocity = cc.v2(velocity.x,0);

        }
        if(velocity.x <= this.minXSpeed){
            this.body.linearVelocity = cc.v2(this.minXSpeed,velocity.y);
        }

        if(this.buffState === TagType.DEBUFF_TAG) {
            this.body.linearVelocity = cc.v2(20,20);
        }
    },
});

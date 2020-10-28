var global = require('./global')

const MOVE_LEFT = 1;
const MOVE_RIGHT = 2;
var {FINAL_TAG} = require('./infinite-world')
cc.Class({
    extends: cc.Component,

    properties: {
        isAI: false,
        minXSpeed: 200,
    },

    // use this for initialization
    onLoad: function () {

        this._collideCount = 0;
        if(this.isAI) {
            let interval = 2;
            this.schedule(this.autoJump, interval);
            this.body = this.getComponent(cc.RigidBody);
            this.body.linearVelocity = cc.v2(100,0);
            return;
        };

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        var canvas = cc.find('/Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        canvas.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.moveFlags = 0;
    },

    start: function () {
        this.body = this.getComponent(cc.RigidBody);

        // this.body.applyForceToCenter(cc.v2(100,0),true);
    },
    disableSchedule(){
        this.unschedule(this.autoJump)
    },
    autoJump() {

        let shouldJump = Math.random() > 0.2;
        if(shouldJump){
            this.jump()
        }

    },
    jump(){
        if(this._finished) return;
      
        this.body = this.getComponent(cc.RigidBody);
        var worldCenter = this.body.getWorldCenter();
        let localCenter = this.body.getLocalCenter()
        this.body.applyLinearImpulse(cc.v2(0,300),localCenter,true);
      
        // let velocity = this.body.linearVelocity;
        // if(velocity.x <= this.minXSpeed){
        //     this.body.linearVelocity = cc.v2(60,velocity.y);
        // }
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
        if(otherCollider.tag === FINAL_TAG){
            this._finished = true;
            console.log('****',this.isAI ? 'AI finish' :'player finish')
        }
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        //只计算地面，空中平台
        if(otherCollider.tag === FINAL_TAG){
            console.log('*************endcontact',this.isAI)
        }

    },
    update: function (dt) {
        // if(!this.isAI) {
        //     return;
        // } 
        // if (this.moveFlags) {
        //     this.updateMotorSpeed();
        // }
        let velocity = this.body.linearVelocity;

        if(this.node.y > 600){
            this.node.y = 600;

            this.body.linearVelocity = cc.v2(velocity.x,0);

        }
        if(velocity.x <= this.minXSpeed){
            this.body.linearVelocity = cc.v2(this.minXSpeed,velocity.y);
        }
    },
});

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
   
    physicsManager.debugDrawFlags = 
        0;
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;
});

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    ball2: cc.Prefab;

    player: cc.Node;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.prepareBall();
    }
    prepareBall(){
        let yPosition = 0;
        let xPosition = 0;
        let player = cc.instantiate(this.ball2);
        let ball = player.getComponent('ball2');
        //先确定位置，不然初始化时，会因为堆在一起产生碰撞效果
        ball.initWithPosition(cc.v2( xPosition, yPosition ));

        this.node.addChild(player);
        ball.prepare();
        this.player = ball
    }
    start () {

    }
    jump(){
        let bjs = this.player.getComponent('ball2');
        bjs.jump();
    }
    back(){
        // this.jump()
        // return;
        cc.director.loadScene("Start");
    }

    // update (dt) {}
}

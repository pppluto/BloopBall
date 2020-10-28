cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        this.camera = this.getComponent(cc.Camera);
    },

    // called every frame, uncomment this function to activate update callback
    lateUpdate: function (dt) {
        let ballJS = this.target.getComponent('ballControl');
        if(ballJS._finished){
            return;
        }
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.node.x = this.node.parent.convertToNodeSpaceAR(targetPos).x;

        let ratio = targetPos.y / cc.winSize.height;
        
        this.camera.zoomRatio = 1 + (0.4 - ratio) * 0.1;
    },
});
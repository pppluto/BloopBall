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
        this.initY = this.node.y;
    },

    // called every frame, uncomment this function to activate update callback
    lateUpdate: function (dt) {
        if(!this.target) return;
        let ballJS = this.target.getComponent('ballControl');
        if(ballJS._finished){
            return;
        }
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let localTargetPos = this.node.parent.convertToNodeSpaceAR(targetPos)
        this.node.x = Math.max( localTargetPos.x,0);
        // this.node.y = Math.max(localTargetPos.y,this.initY)

        let ratio = targetPos.y / cc.winSize.height;
        let zoomRatio = 1 + (0.4 - ratio) * 0.1;
        this.camera.zoomRatio = zoomRatio;
        this.node.y = this.initY + cc.winSize.height/2 * (1-zoomRatio);
    },
});
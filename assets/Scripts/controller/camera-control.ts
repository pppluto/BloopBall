
const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;
    
    camera: cc.Camera;
    initY: number = 0;
    // use this for initialization
    onLoad () {
        this.camera = this.getComponent(cc.Camera);
        this.initY = this.node.y;
    }

    // called every frame, uncomment this function to activate update callback
    lateUpdate(dt) {
        if(!this.target) return;
        let ballJS = this.target.getComponent('ballControl');
        if(ballJS._finished){
            return;
        }
        let mBall = this.target.getComponent('motorBall');
        let ps = mBall.spheres[0];
        // let targetPos = ps.getWorldCenter();
        
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let localTargetPos = this.node.parent.convertToNodeSpaceAR(targetPos)
        this.node.x = Math.max( localTargetPos.x,0);
        // this.node.y = Math.max(localTargetPos.y,this.initY)

        //TODO:摄像头的移动缩放空间限制
        let ratio = targetPos.y / cc.winSize.height;
        //越大越近
        let zoomRatio = Math.min(1, 1 + (0.5 - ratio) * 0.6);
        this.camera.zoomRatio = zoomRatio;
        this.node.y = this.initY + cc.winSize.height/2 * (1-zoomRatio);
    }
}

var smooth = require('smooth');
import ColliderListener = require('../roles/colliderListener');

const {ccclass,property} = cc._decorator;

@ccclass
export default class BounceBall extends cc.Component{

    particleNumber: number = 6
    particleRadius: number = 30
    sphereSize: number = 6

    enableContact: boolean = false

    ctx: cc.Graphics = null

    spheres: Array<cc.RigidBody> = []
    onLoad(){
        this.ctx = this.getComponent(cc.Graphics);
        this.ctx.lineWidth = 6;
        this.ctx.strokeColor = cc.color().fromHEX('#495069');
        this.ctx.fillColor = cc.color().fromHEX('#ffde59');
        this.init();
    }
    init () {

        let x = this.node.x;
        let y = this.node.y;

        let particleNumber = this.particleNumber;
        let particleRadius = this.particleRadius;
        let sphereSize = this.sphereSize;

        let particleAngle = (2*Math.PI)/particleNumber;
        let particleDistance = Math.sin(particleAngle) * particleRadius * Math.sin((Math.PI - particleAngle)/2);

        let spheres = [];
        let body = this.getComponent(cc.RigidBody);
        spheres.push(body)
        // spheres.push( this._createSphere(0, 0, sphereSize, this.node) );

        for (let i=0; i<particleNumber; i++) {
            let angle = particleAngle*i;
            let posX = particleRadius * Math.cos(angle);
            let posY = particleRadius * Math.sin(angle);
            let sphere = this._createSphere(posX, posY, sphereSize);
            spheres.push( sphere );
            
            let joint = sphere.node.addComponent(cc.DistanceJoint);
            joint.connectedBody = spheres[0];
            joint.distance = particleRadius;
            joint.dampingRatio = 0.5;
            joint.frequency = 4;

            if (i > 0) {
                joint = sphere.node.addComponent(cc.DistanceJoint);
                joint.connectedBody = spheres[spheres.length - 2];
                joint.distance = particleDistance;
                joint.dampingRatio = 1;
                joint.frequency = 0;
            }

            if (i === particleNumber - 1) {
                joint = spheres[1].node.addComponent(cc.DistanceJoint);
                joint.connectedBody = sphere;
                joint.distance = particleDistance;
                joint.dampingRatio = 1;
                joint.frequency = 0;
            }

            sphere.node.parent = this.node;
        }

        this.spheres = spheres;
        //TODO: 
        //创建一个sensor collider 来获取碰撞事件，
    }

    _createSphere (x, y, r, node?) {
        if (!node) {
            node = new cc.Node();
            node.x = x;
            node.y = y;
        }

        node.group = 'ball';
        let body = node.addComponent(cc.RigidBody);
        body.enabledContactListener = true;
        let collider = node.addComponent(cc.PhysicsCircleCollider);
        collider.density = 0.2;
        collider.restitution = 0
        collider.friction = 0.2;
        collider.radius = r;

        if(this.enableContact){
            node.addComponent(ColliderListener);
        }
        return body;
    }

    // onBeginContact: function (contact, selfCollider, otherCollider) {
    //     //只计算地面，空中平台
    //     this._collideCount +=1;
    // },

    // // 只在两个碰撞体结束接触时被调用一次
    // onEndContact: function (contact, selfCollider, otherCollider) {
    //     //只计算地面，空中平台

    //     this._collideCount -=1;
    // },

    update (dt) {
        var ctx = this.ctx;

        var points = this.spheres.map(sphere => {
            return this.expandPosition( sphere.node.position );
        });

        points.shift();

        var result = smooth( points );
        var firstControlPoints = result[0];
        var secondControlPoints = result[1];

        var pos = points[0];

        ctx.clear();
        ctx.moveTo(pos.x, pos.y);

        for (var i = 1, len = points.length; i < len; i++) {
            var firstControlPoint = firstControlPoints[i - 1],
                secondControlPoint = secondControlPoints[i - 1];

            ctx.bezierCurveTo(
                firstControlPoint.x, firstControlPoint.y,
                secondControlPoint.x, secondControlPoint.y,
                points[i].x, points[i].y
            );
        }

        ctx.close();
        ctx.fill();
        ctx.stroke();
    },

    expandPosition (pos) {
        return pos.mul(1.3);
    }
}
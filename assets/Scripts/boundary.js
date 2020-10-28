
cc.Class({
    extends: cc.Component,

    properties: {
        size: cc.size(0, 0),
        mouseJoint: true
    },

    // use this for initialization
    onLoad: function () {
        let width   = this.size.width || this.node.width;
        let height  = this.size.height || this.node.height;

        let node = new cc.Node();

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        if (this.mouseJoint) {
            // add mouse joint
            let joint = node.addComponent(cc.MouseJoint);
            joint.mouseRegion = this.node;    
        }
        

        node.groupIndex = 1;

        this._addBound(node, 0, height/2, width, 20);
        this._addBound(node, 0, -height/2, width, 20);
        this._addBound(node, -width/2, 0, 20, height);
        this._addBound(node, width/2, 0, 20, height);

        node.parent = this.node;

        let matrix = cc.game.collisionMatrix[node.groupIndex];
        var categoryBits = 1 << node.groupIndex;
        var maskBits = 0;
        var bits = cc.game.collisionMatrix[node.groupIndex];
        for (let i = 0; i < bits.length; i++) {
            if (!bits[i]) continue;
            maskBits |= 1 << i;
        }

        var filter = {
            categoryBits: categoryBits,
            maskBits: maskBits,
            groupIndex: 0
        };
        console.log('martrix',matrix,filter)
    },
    _addBound (node, x, y, width, height) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
        return collider
    }
});

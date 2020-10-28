
var smooth = require('../smooth');
var ColliderListener = require('../colliderListener');

const gfx = cc.gfx;
cc.Class({
    extends: cc.Component,

    properties: {
        particleNumber: 6,
        particleRadius: 30,
        sphereSize: 6,

        enableContact: false,

        meshRenderer: cc.MeshRenderer,
        spriteFrame: cc.SpriteFrame,
    },

    // use this for initialization
    onLoad(){
        console.log('render');
        this.init();
        let spriteFrame = this.spriteFrame;
        if (spriteFrame) {
            let newTexture = spriteFrame.getTexture();
            if (newTexture && newTexture.loaded) {
                this.onSpriteFrameLoaded();
            } else {
                spriteFrame.once('load', this.onSpriteFrameLoaded, this);
            }
        }
    },
    init: function () {

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
    },

    _createSphere (x, y, r, node) {
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
    },

    emitTo (target) {
        var x = target.x;
        var y = target.y;

        var selfX = this.node.x;
        var selfY = this.node.y;

        var distance = Math.sqrt((x-selfX)*(x-selfX) + (y-selfY)*(y-selfY));
        var velocity = cc.v2(x-selfX, y-selfY);
        velocity.normalizeSelf();
        velocity.mulSelf(distance*2);

        this.spheres.forEach(function (sphere) {
            sphere.linearVelocity = velocity;
        });
    },
    // onBeginContact: function (contact, selfCollider, otherCollider) {
    //     //只计算地面，空中平台
    //     this._collideCount +=1;
    // },

    // // 只在两个碰撞体结束接触时被调用一次
    // onEndContact: function (contact, selfCollider, otherCollider) {
    //     //只计算地面，空中平台

    //     this._collideCount -=1;
    // },
    onSpriteFrameLoaded(){
        this.drawMesh();
    },
    drawMesh(){

        this.meshRenderer.width = 100;
        this.meshRenderer.height = 100;

        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);
        mesh.init(vfmtColor,8,false);
        
        let {vertices, uvs,indices} = this.makeVertex();

        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        mesh.setIndices(indices);
       
        const texture = this.spriteFrame.getTexture();
        texture.update({premultiplyAlpha: true})
        const material = this.meshRenderer.getMaterial(0);
        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);

        this.meshRenderer.mesh = mesh;
        this._initMesh = true;
    },
    updateMeshVertex(){
        if(!this._initMesh) return;
        var points = this.spheres.map(sphere => {
            let pos = sphere.node.parent.convertToWorldSpaceAR(sphere.node.position);
            let localPos = this.meshRenderer.node.convertToNodeSpaceAR(pos);
            return this.expandPosition( localPos );
        });

        let vertices = points;
        this.meshRenderer.mesh.setVertices(gfx.ATTR_POSITION, vertices);
    },
    makeVertex(){
        let vertices = [], uvs = [],indices = [];

        var points = this.spheres.map(sphere => {
            let pos = sphere.node.parent.convertToWorldSpaceAR(sphere.node.position);
            let localPos = this.meshRenderer.node.convertToNodeSpaceAR(pos);
            return this.expandPosition( localPos );
        });

        vertices = points;
        let center =  vertices[0];
        let radius = 20;
        for (let index = 0; index < vertices.length; index++) {
            const vertex = vertices[index];
            let uvX = (vertex.x - center.x) / radius / 2 + 0.5;
            let uvY =  0.5- (vertex.y - center.y) / radius / 2;

            uvs.push(cc.v2(uvX,uvY));
            
            ;
            if(index === 0){

            } else if(index === vertices.length -1){
                indices.push(0,1,index)
            } else {
                indices.push(0,index,index + 1)
            }
           
        }
        let obj = {vertices,uvs,indices}
        return obj;

    },

    update (dt) {
        this.updateMeshVertex()
    },

    expandPosition (pos) {
        return pos.mul(1.4);
    }
});

/**
 * 物理世界和节点世界的坐标转换。
 */
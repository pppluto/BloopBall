
import ColliderListener from '../common/colliderListener';

const { ccclass, property } = cc._decorator;

const gfx = cc['gfx'];
@ccclass
export default class Ball extends cc.Component {
    

    @property(cc.MeshRenderer)
    meshRenderer: cc.MeshRenderer = null;

    @property(cc.SpriteFrame)
    spriteFrame1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    spriteFrame2: cc.SpriteFrame = null;
    
    @property(cc.Float)
    particleNumber: number = 8
    @property(cc.Float)
    particleRadius: number = 15
    @property(cc.Float)
    sphereSize: number = 9

    enableContact: boolean = false
    _initMesh: boolean = false;
    bodySpriteFrame: cc.SpriteFrame = null;

    spheres: Array<any> = []
    // use this for initialization
    onLoad(){
    }
    initWithPosition(position){
        this.node.x = position.x;
        this.node.y = position.y;
    }
    prepare() {
        let particleNumber = this.particleNumber;
        let particleRadius = this.particleRadius;
        let sphereSize = this.sphereSize;

        let particleAngle = (2*Math.PI)/particleNumber;
        let particleDistance = Math.sin(particleAngle) * particleRadius * Math.sin((Math.PI - particleAngle)/2);

        let spheres = [];
        let body = this.getComponent(cc.RigidBody);
        spheres.push(body)
        // spheres.push( this._createSphere(0, 0, sphereSize, this.node) );

        //TODO: joint 应该要调得迟钝一些
        for (let i=0; i<particleNumber; i++) {
            let angle = particleAngle*i;
            let posX = particleRadius * Math.cos(angle);
            let posY = particleRadius * Math.sin(angle);
            let sphere = this._createSphere(posX, posY, sphereSize,null);
            spheres.push( sphere );
            
            let joint = sphere.node.addComponent(cc.DistanceJoint);
            joint.connectedBody = spheres[0];
            joint.distance = particleRadius;
            joint.dampingRatio = 0.5;
            joint.frequency = 10;

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
        let spriteFrame = this.spriteFrame1;
        if(this.enableContact) {
            spriteFrame = this.spriteFrame2
        }
        this.bodySpriteFrame = spriteFrame;
        if (spriteFrame) {
            let newTexture = spriteFrame.getTexture();
            if (newTexture && newTexture.loaded) {
                this.onSpriteFrameLoaded();
            } else {
                spriteFrame.once('load', this.onSpriteFrameLoaded, this);
            }
        }

    }

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
        collider.density = 0.3;
        collider.restitution = 0
        collider.friction = 0.8;
        collider.radius = r;

        if(this.enableContact){
            node.addComponent(ColliderListener);
        }
        return body;
    }

    onSpriteFrameLoaded(){
        // this.drawMesh();
    }
    drawMesh(){

        this.meshRenderer.node.width = 100;
        this.meshRenderer.node.height = 100;

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
       
        const texture = this.bodySpriteFrame.getTexture();

        const material = this.meshRenderer.getMaterial(0);
        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);

        this.meshRenderer.mesh = mesh;
        this._initMesh = true;
    }
    smoothPoints(points) {
  
        let center = points[0];
        let vertices = [center];
        // let radians =  Math.PI / this.particleNumber;
        for (let index = 1; index < points.length; index++) {
            const position = points[index];
            let comparePoint = index === points.length - 1 ? points[1] : points[index+1];
           
            let offset = comparePoint.sub(position);
            // let ratio = comparePoint.mag() > position.mag() ? 1.05 : 0.95;
            //TODO: ratio 应该要更灵活，不然在某些情况下会部分凸起或者尖锐
            let ratio = 1.05;
            let insertNum = 3;
            vertices.push(position);

            for (let index = 1; index <= insertNum; index++) {
                let part = index / (insertNum + 1); 
                let insertPos = position.add(offset.mul(part)).mul(ratio);
                vertices.push(insertPos);
            }
        }
        return vertices;
    }
    smoothPoints2(points) {
        //可以根据两向量的长度差，确定插值点大概位置
        let center = points[0];
        let vertices = [center];
        //每一部分的弧度
        let radians =  Math.PI / this.particleNumber;
        for (let index = 1; index < points.length; index++) {
            const position = points[index];
            let comparePoint = index === points.length - 1 ? points[1] : points[index+1];
            //长度差            
            let offsetLen = comparePoint.mag() - position.mag();
            let vector = position.normalize();
            //插值弧度
            let insertNum = 3;
            radians = radians / (insertNum + 1);
            vertices.push(position);
            for (let index = 1; index <= insertNum; index++) {
                let part = index / (insertNum + 1);
                //插值向量
                //FIX:这里插值的东西没意义，点就在两向量连线上
                let insertPos = position.add(vector.mul(part *　offsetLen));
                insertPos =cc.v2(position).rotate(radians);
                vertices.push(insertPos);
            }
        }
        return vertices;
    }
    updateMeshVertex(){
        if(!this._initMesh) return;
        var points = this.getRawPoints();

        let vertices = points;
        vertices = this.smoothPoints(points);

        this.meshRenderer.mesh.setVertices(gfx.ATTR_POSITION, vertices);
    }
    makeVertex(){
        let vertices = [], uvs = [],indices = [];

        var points = this.getRawPoints();

        vertices = points;
        let center =  vertices[0];
        vertices = this.smoothPoints(points);
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

    }

    update (dt) {
        this.updateMeshVertex()
    }
    getRawPoints(){
        let center = this.spheres[0];
        let pos = center.node.parent.convertToWorldSpaceAR(center.node.position);
        let centerLocalPos = this.meshRenderer.node.convertToNodeSpaceAR(pos);
        let points = this.spheres.map((sphere,index) => {
            let pos = sphere.node.parent.convertToWorldSpaceAR(sphere.node.position);
            let localPos = this.meshRenderer.node.convertToNodeSpaceAR(pos);

            if(index === 0) {
                return localPos;
            }
            let vector = localPos.sub(centerLocalPos).normalize();;
            let vertex =  localPos.add(vector.mul(this.sphereSize));

            return vertex;
        });
        return points;
    }
}
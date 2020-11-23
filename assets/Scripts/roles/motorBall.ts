
import ColliderListener from './colliderListener';
import { SKinConfig,SkinBody,SkinMapping } from './RoleMapping'
const { ccclass, property } = cc._decorator;

//余弦定理
const getThirdEdge  = (a,b,a2b) => {
    let tmp = a * a + b * b - 2*a*b*Math.cos(a2b);
    return Math.sqrt(tmp);
}

const gfx = cc['gfx'];
@ccclass
export default class Ball extends cc.Component {
    

    @property(cc.MeshRenderer)
    meshRenderer: cc.MeshRenderer = null;

    @property(cc.SpriteFrame)
    spriteFrame: cc.SpriteFrame = null;
    
    // particleNumber: number = 6  //最好是偶数，保证落地时不会摇晃
    // motorOffset: number = 40
    // sphereSize: number = 20

    particleNumber: number = 10  //最好是偶数，保证落地时不会摇晃
    motorOffset: number = 28
    sphereSize: number = 8

    centerSize: number = 20

    beautyNode: cc.Node = null;
    beautyBackNode: cc.Node = null;

    enableContact: boolean = false
    _initMesh: boolean = false;
    bodySpriteFrame: cc.SpriteFrame = null;

    spheres: Array<any> = []

    skinConfig: SKinConfig = null// SkinMapping.spider
    skinSpritesCache: cc.Asset | cc.Asset[] = []

    isAI: boolean = false;
    // use this for initialization
    onLoad(){
        // this.prepare();
      
        this.beautyNode = new cc.Node();
        this.beautyNode.parent = this.node;
        this.beautyNode.position = cc.v3(0,0,0);
        this.beautyNode.zIndex = 100;

        this.meshRenderer.node.zIndex = 15;

        this.beautyBackNode = new cc.Node();
        this.beautyBackNode.parent = this.node;
        this.beautyBackNode.position = cc.v3(0,0,0);
        this.beautyBackNode.zIndex = 0;

        //TODO:
        // this.preloadSkin()
    }
    initWithPosition(position){
        this.node.x = position.x;
        this.node.y = position.y;
    }
    prepare() {
        let particleNumber = this.particleNumber;
        let motorOffset = this.motorOffset;
        let sphereSize = this.sphereSize;

        let particleAngle = (2*Math.PI)/particleNumber;
        let particleDistance =  Math.sin(particleAngle) * motorOffset * Math.sin((Math.PI - particleAngle)/2);

        let spheres = [];
        // let body =  this._createSphere(0, 0, this.centerSize,null);
        // body.node.parent = this.node;
        let body = this.node.getComponent(cc.RigidBody);
      
        //无弹性效果
        if( true || cc.sys.os === 'iOS') {
            let collider = this.node.getComponent(cc.PhysicsCircleCollider);
            collider.radius = this.centerSize + 2 * this.sphereSize;
            collider.apply();
            particleNumber = 0;
        }

        spheres.push(body);

        let aroundDistance = getThirdEdge(sphereSize,this.centerSize,particleAngle);

        for (let i=0; i<particleNumber; i++) {
            //
            let angle = particleAngle*i + particleAngle/2;
            let posX = motorOffset * Math.cos(angle);
            let posY = motorOffset * Math.sin(angle);
            let sphere = this._createSphere(posX, posY, sphereSize,null);
            spheres.push( sphere );
          
            let motorOffsetVec = cc.v2(-posX,-posY);

            let joint = sphere.node.addComponent(cc.DistanceJoint);
            joint.distance = aroundDistance;
            joint.dampingRatio = 1;
            joint.frequency = 1;
            
            let motorJoint = sphere.node.addComponent(cc.MotorJoint);
            motorJoint.linearOffset  = motorOffsetVec;
            motorJoint.maxForce = 300
            motorJoint.maxTorque = 300
            motorJoint.connectedBody = spheres[0];

            sphere.node.parent = this.node;
        }
        for (let i = 0; i<particleNumber; i++) {
            //
            let sphere = spheres[i + 1];
            
            let joint = sphere.node.getComponent(cc.DistanceJoint);

            if (i === 0) {
                joint.connectedBody = spheres[spheres.length - 1];
              
            } else {
                joint.connectedBody = spheres[i];
            }
        }

        
       
        this.spheres = spheres;
        this.beautify();
    }
    preloadSkin(){
        if(this.skinConfig){
            let skinConfig = this.skinConfig;
            let bodies = skinConfig.bodies;
            let paths = bodies.map(e => `roleSkin/${skinConfig.name}/` + e.name);
            //TODO:测试一下paths只有一个时，返回的是数组还是单个对象
            cc.resources.load(paths, cc.SpriteFrame,(err,sprites) => {
                if(!sprites) return;
                this.skinSpritesCache = sprites
             });
        }
      
    }
    beautify(){
        let skinConfig = this.skinConfig;
        if(!skinConfig) return;
        let bodies = skinConfig.bodies;
        // tail
        let paths = bodies.map(e => `roleSkin/${skinConfig.name}/` + e.name);
        cc.resources.load(paths, cc.SpriteFrame,(err,sprites) => {
        //    console.log('sprites',sprites);
           if(!sprites) return;
           this.createBeautifyNode(sprites,bodies);
        });
    }
    drawBody(spriteFrame){
        this.bodySpriteFrame = spriteFrame;
        if (spriteFrame) {

            //牺牲一些效果
            if(this.spheres.length === 1) {
                this.createBodyNode(spriteFrame)
                return;
            }

            let newTexture = spriteFrame.getTexture();
            if (newTexture && newTexture.loaded) {
                this.onSpriteFrameLoaded();
            } else {
                spriteFrame.once('load', this.onSpriteFrameLoaded, this);
            }
        }
    }
    createBodyNode(spriteFrame){
        let spNode = new cc.Node();
        let size = this.sphereSize * 4 + this.centerSize * 2;
        let sp = spNode.addComponent(cc.Sprite)
        sp.spriteFrame = spriteFrame;
        spNode.parent = this.node;
        spNode.scale = size / spriteFrame.getTexture().width
    }
    createBeautifyNode(sprites,bodies:Array<SkinBody>){
        let edge = this.sphereSize + this.motorOffset;
        sprites.forEach((element,index) => {
            if(index === 0) {
                this.drawBody(element)
                return;
            }
            if(this.isAI) return;
            let body = bodies[index];
            let spNode = new cc.Node();
            let sp = spNode.addComponent(cc.Sprite)
            sp.spriteFrame = element;
            spNode.scale = 0.5;
            spNode.position = cc.v3(edge * body.x,edge * body.y,0)
            if(body.isBack){
                spNode.parent = this.beautyBackNode;

            } else {
                spNode.parent = this.beautyNode;

            }
        });
        

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
        // body.type = cc.RigidBodyType.Static;
        let collider = node.addComponent(cc.PhysicsCircleCollider);
        collider.density = 1;
        collider.restitution = 0
        collider.friction = 0.2;
        collider.radius = r;

        if(this.enableContact){
            node.addComponent(ColliderListener);
        }
        return body;
    }

    onSpriteFrameLoaded(){
        this.drawMesh();
    }
    drawMesh(){

        this.meshRenderer.node.width = 256;
        this.meshRenderer.node.height = 256;

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
        // return points;
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
        //这个半径点
        let radius = this.sphereSize + this.motorOffset;
        for (let index = 0; index < vertices.length; index++) {
            const vertex = vertices[index];
            let uvX = (vertex.x - center.x) / radius / 2 + 0.5;
            let uvY =  0.5- (vertex.y - center.y) / radius / 2;

            uvs.push(cc.v2(uvX,uvY));

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
    followRotate(){
        let center = this.spheres[0]
        let pos = center.node.parent.convertToWorldSpaceAR(center.node.position);
        let first = this.spheres[1];
        let pos2 = first.node.parent.convertToWorldSpaceAR(first.node.position);
        let vector = pos2.sub(pos);

        let vec = vector.y < 0 ? -1:1
        let angle = vec *　cc.Vec2.angle(vector,cc.v2(1,0)) * 180 / Math.PI ;
        if(this.beautyNode){
            this.beautyNode.angle = angle;
        }
    }
    // start(){
    //     setInterval(() => {
    //         let body = this.spheres[0];
    //         let center = body.getWorldCenter();
    //         let mass = body.getMass()
    //         console.log('rotate',mass)
    //         let vec = cc.v2(0,100000)
    //         body.applyForce(vec,center,true);
    //     },2000)
    // }
    applyForce(){
        let body = this.spheres[0];
        body.applyTorque(-300,true);
    }
    update (dt) {
        if(this.spheres.length < 2) return;
        this.updateMeshVertex();
        // let body = this.spheres[0];
        // if(!body) return;
        // let targetPos = body.getWorldCenter()
        // let localTargetPos = this.node.parent.convertToNodeSpaceAR(targetPos)

        // this.node.setPosition(localTargetPos);
        // this.followRotate();
        // this.applyForce()
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
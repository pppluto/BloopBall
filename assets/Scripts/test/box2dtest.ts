const { ccclass, property } = cc._decorator;

let particleSystem;
let particleGroup;
const PTM_RATIO = cc.PhysicsManager.PTM_RATIO;
const PSD_RADIUS = 4;

const gfx = cc['gfx'];

@ccclass
export default class LiquidBox2dTest extends cc.Component {


    @property(cc.MeshRenderer)
    meshRenderer: cc.MeshRenderer = null;

    @property(cc.SpriteFrame)
    spriteFrame: cc.SpriteFrame = null;
    
    @property(cc.Graphics)
    graphics: cc.Graphics = null;
    @property(cc.Node)
    testNode: cc.Node = null;
    
    onLoad() {
        const phyMgr = cc.director.getPhysicsManager();
        phyMgr.enabled = true;
        phyMgr.debugDrawFlags = 
        0;
        cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;
        return;
        let spriteFrame = this.spriteFrame;
        if (spriteFrame) {
            let newTexture = spriteFrame.getTexture();
            if (newTexture && newTexture.loaded) {
                this.onSpriteFrameLoaded();
            } else {
                spriteFrame.once('load', this.onSpriteFrameLoaded, this);
            }
        }
        
        //TODO创建一个body
        // return;
        this.draw();
        this.test();
        this.debugInfo();
    }
    start(){
        setInterval(() => {
            let body = this.testNode.getComponent(cc.RigidBody);
            let center = body.getWorldCenter();
            let rotate = body.getWorldRotation();
            let mass = body.getMass()
            console.log('rotate',mass)
            rotate =( rotate % 360) * Math.PI / 180 ;
            let vec = cc.v2(0,1).rotate(rotate).mul(100000)
            vec = cc.v2(0,100000)
            body.applyForce(vec,center,true);
        },2000)
    }
    applyForce(){
        let body = this.testNode.getComponent(cc.RigidBody);
        body.applyTorque(-2000,true);
    }
    debugInfo() {
        const phyMgr = cc.director.getPhysicsManager();
        const world = phyMgr['_world'];
        let headBody = world.GetBodyList();
        let nextbody = headBody.GetNext();
        let fixtures = nextbody.GetFixtureList();

        //syncnode
        // let pos = nextbody.GetPosition();
        // let realPos = this.convertToNode(pos);
        // let bindNode = fixtures.m_userData.node;
        // let nodePos = bindNode.parent.convertToNodeSpaceAR(realPos);
    }
    draw(){
        let graphics = this.graphics;
        let nodePos = graphics.node.position;
        graphics.clear();
        graphics.circle(nodePos.x+100,nodePos.y,32);

        graphics.fill();
        graphics.stroke();
    }

    test(){
        //物理世界
        const phyMgr = cc.director.getPhysicsManager();
        const world = phyMgr['_world'];

        let bd = new b2.BodyDef();
        bd.type = b2.BodyType.b2_dynamicBody;
        bd.linearVelocity = cc.v2(-5,0);
        let circle1 = world.CreateBody(bd);
        let pos1 = this.graphics.node.convertToWorldSpaceAR(cc.v2(0,0));

        let fixture = this.createCircleFixture(pos1);
        fixture.userData = {node:this.graphics.node};
        circle1.CreateFixtureDef(fixture);
        console.log('***********',fixture);
        // this.createGround(world);
    }
    createGround(world){
        let bd = new b2.BodyDef();
        bd.type = b2.BodyType.b2_staticBody;

        let ground = world.CreateBody(bd);
        let bottomY = 100-cc.winSize.height/2;
        let pos = this.graphics.node.convertToWorldSpaceAR(cc.v2(0,bottomY));

        let fixture = this.createBoxFixture(pos);
        ground.CreateFixtureDef(fixture);
    }
    createCircleFixture(pos){
        let shape = new b2.CircleShape();
        let center = this.convertToBoxWorld(cc.v2(pos.x+100,pos.y));
        shape.Set(center,1);

        let fixture = new b2.FixtureDef();
        fixture.restitution=0.5;
        fixture.shape = shape;

        let filter = new b2.Filter();
        filter.groupIndex = 0;
        filter.categoryBits = 5;
        filter.maskBits = 3;
        fixture.filter = filter;

        return fixture;
    }
    createBoxFixture(pos){
        let shape = new b2.PolygonShape();
        let center = this.convertToBoxWorld(pos);
        
        let size = cc.winSize;
        shape.SetAsBox(size.width/2/PTM_RATIO, 10/2/PTM_RATIO,center);
        let fixture = new b2.FixtureDef();
        fixture.shape = shape;
        return fixture;
    }
    createMesh(vertices,uvs,indices){
        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);
        mesh.init(vfmtColor,8,false);
    
        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        mesh.setIndices(indices);
        return mesh;
    }
    getVertices(){
        let scale = 0.25;
        let radius =  scale * 256/PTM_RATIO/2
        let posBuffer = particleSystem.GetPositionBuffer();
        let center = particleGroup.GetCenter();
        posBuffer = posBuffer.filter(v => {
            if(!v) return;

            let vv = cc.v2(v.x,v.y);
            vv = vv.sub(center);
            let distance = vv.mag();
            if(distance > radius * 0.95) {
                return true;
            }
        })

        let tmp_vertexes = [];
            
        tmp_vertexes = [center,...posBuffer];
        tmp_vertexes = tmp_vertexes.map(v => {
            let tmp = this.convertToNode(v)
            return this.meshRenderer.node.convertToNodeSpaceAR(tmp);
        });
        return tmp_vertexes

    }
    makeVertices(radius){

        let posBuffer = particleSystem.GetPositionBuffer();
        let center = particleGroup.GetCenter();
        posBuffer = posBuffer.filter(v => {
            if(!v) return;
            let vv = cc.v2(v.x,v.y);
            vv = vv.sub(center);
            let distance = vv.mag();
            if(distance > radius * 0.95) {
                return true;
            }
        })

        let tmp_ids = [],
            tmp_uv = [],
            tmp_vertexes = [];
            
        tmp_vertexes = [center,...posBuffer];

        tmp_vertexes.forEach((element,index) => {
            if(index === 0) return;

            if(index === posBuffer.length -1){
                tmp_ids.push(0,1,index)
            } else {
                tmp_ids.push(0,index,index + 1)
            }
        });
        tmp_uv = tmp_vertexes.map(v => {
            let uvX = (v.x - center.x) / radius / 2 + 0.5;
            let uvY =  0.5- (v.y - center.y) / radius / 2;
            return cc.v2(uvX,uvY)
        })

        tmp_vertexes = tmp_vertexes.map(v => {
            let tmp = this.convertToNode(v)
            return this.meshRenderer.node.convertToNodeSpaceAR(tmp);
        });

        let mesh = this.createMesh(tmp_vertexes,tmp_uv,tmp_ids)
        return mesh;
    }
    createGroup(radius){
        // return
        const phyMgr = cc.director.getPhysicsManager();
        const world = phyMgr['_world'];

        var psd = new b2.ParticleSystemDef();
        psd.gravityScale = 1;
        psd.radius = PSD_RADIUS / PTM_RATIO / 3;
        psd.elasticStrength = 1

        particleSystem = world.CreateParticleSystem(psd);

        let pos = this.graphics.node.convertToWorldSpaceAR(cc.v2(0,0));
        let center = this.convertToBoxWorld(pos);
        var circle = new b2.CircleShape();
        circle.Set(cc.Vec2.ZERO,radius);
        var pgd = new b2.ParticleGroupDef();
        pgd.flags = b2.ParticleFlag.b2_elasticParticle;
        pgd.groupFlags = b2.ParticleGroupFlag.b2_solidParticleGroup;
        pgd.shape = circle;
        pgd.color.Set(0, 255, 0, 255);
        pgd.position.Set(center.x,center.y);
        particleGroup = particleSystem.CreateParticleGroup(pgd);

        this.drawPos();

        // particleSystem.SetPaused(true);
        // let posBuffer = particleSystem.GetPositionBuffer();
        // posBuffer = posBuffer.filter(v => !!v)
        // setInterval(() => {
        //     console.log('applyforce');
        //     let force = 3000;
        //     particleSystem.ApplyForce(0,posBuffer.length-1,cc.v2(force,force));

        //     let contacts = particleSystem.GetContactCount();
        //     console.log('contacts',contacts)
        // },5000);
    }
    // 绘制粒子
    drawPos(){
        return;
        let posBuffer = particleSystem.GetPositionBuffer();
        
        let maxParticles = posBuffer.length;
        this.graphics.clear();
        for (let i = 0; i < maxParticles; i += 1) {
            let b2pos = posBuffer[i];
            if(!b2pos) break;
            b2pos = this.convertToNode(b2pos);
            b2pos = this.graphics.node.convertToNodeSpaceAR(b2pos);
            let x = b2pos.x;
            let y = b2pos.y;
            this.graphics.circle(x, y,PSD_RADIUS);
            this.graphics.fill();
            this.graphics.stroke();
        }

        let contactCount = particleSystem.GetBodyContactCount();
        // console.log('contact',contactCount)

    }
    convertToBoxWorld(position){
        return cc.v2(position.x/PTM_RATIO,position.y/PTM_RATIO)
    }
   
    convertToNode(position) {
        return cc.v2(position.x*PTM_RATIO,position.y*PTM_RATIO)
    }
    update(){
        // this.debugInfo();
        this.applyForce()
    }
    onSpriteFrameLoaded() {


        let scale = 0.25;
        const texture = this.spriteFrame.getTexture();
        console.log('123',texture)
        let gRadius = scale * texture.width/PTM_RATIO/2
        this.createGroup(gRadius);

        this.meshRenderer.node.width = texture.width * scale;
        this.meshRenderer.node.height = texture.height * scale;

        let mesh  = this.makeVertices(gRadius);
        const material = this.meshRenderer.getMaterial(0);
        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);
        this.meshRenderer.mesh = mesh;

    }

    private _lerp(a: number, b: number, w: number) {
        return a + w * (b - a);
    }

    lateUpdate() {
        if(!particleSystem) return;
        // this.drawPos();
        // this.drawSprite();
    }
    drawSprite(){
        if (!particleSystem) return;

        const vertexes = this.getVertices()

       
        // this.graphics.fill();
        // this.graphics.stroke();
        this.meshRenderer.mesh.setVertices(gfx.ATTR_POSITION, vertexes);
    }
    onDestroy() {
        cc.log('onDestroy');
        const phyMgr = cc.director.getPhysicsManager();
        const world = phyMgr['_world'];
        world.DestroyParticleSystem(particleSystem);
        particleSystem = null;
    }
}

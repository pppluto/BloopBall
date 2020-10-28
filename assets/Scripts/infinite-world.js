// http://www.emanueleferonato.com/2011/10/04/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d-%E2%80%93-adding-more-bumps/

cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
    
    physicsManager.debugDrawFlags = 
        0;
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;

    // var manager = cc.director.getCollisionManager();
    // manager.enabled = true;
    // manager.enabledDebugDraw = true;
    // manager.enabledDrawBoundingBox = true;

});

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 250;
export const FINAL_TAG = 99; //终点
export const DIE_TAG = 88;   //死亡障碍
export const BUFF_TAG = 77;  //加速
export const DEBUFF_TAG = 66;//减速

cc.Class({
    extends: cc.Component,

    properties: {
        pixelStep: 10,
        xOffset: 0,
        yOffset: 100,

        target: {
            default: null,
            type: cc.Node
        },
        ground: cc.Node,
        mapLength: 4000,
        sf: cc.SpriteFrame,

        //barrier prefabs
        airBarrier1: cc.Prefab,
        airBarrier2: cc.Prefab,
        groundBarrier1: cc.Prefab,
        groundBarrier2: cc.Prefab,
        
        //buff prefabs

    },


    // use this for initialization
    onLoad: function () {
        this.hills = [];
        this.pools = [];
        this.initHeight = this.yOffset;
        //mesh点
        this._meshPoints = [];
        //极值点 (用来确定空中障碍位置)
        this._extremePoints = []
        // cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;

        this.prepareTerrian();
        this.prepareBarriers()
    },
    
    prepareTerrian(){

        this.creatBoundary(-this.pixelStep);

        while (this.xOffset < this.mapLength) {
            this.generateTerrian();
        }

        this.createFinalTerrian();
        this.creatBoundary(this.xOffset - 600)
        const texture = this.sf.getTexture();
        texture.update({premultiplyAlpha: true})

        let vertices = this._meshPoints; 
        let indices = []; //

        let lens = vertices.length / 2 - 1; 
        for (let index = 0; index < lens; index++) {
           
            let a1 = index*2
            let b1 = index*2 + 1;
            let a2 = index*2 + 2;
            let b2 = index*2 + 3;
            indices = indices.concat([a1,b1,a2,b1,a2,b2]);
        }
        let texWidth =  texture.width;
        let texHeight = texture.height;
        let uvs = this._meshPoints.map((v,index) => {
            let num = Math.floor(index/2);
            let isTop = index % 2 !== 0;
            let width = num * this.pixelStep;

            let reverse = Math.floor(width/texWidth) %2 !==0;
            let mod = width % texWidth;
            let uvx = reverse ? 1 - mod / texWidth : mod/texWidth;
          
            let uvy = isTop ?  1-Math.ceil(v.y) % texHeight/texHeight : 1;
            return cc.v2(uvx,uvy);
        })
        this.renderMesh(vertices,indices,uvs);
    },
    creatBoundary(xOffset){
        let points = [];
        let yHeight = 600
        let nextY = 600
        let pixelStep = this.pixelStep;
        points.push( cc.v2( 0,     0) );
        points.push( cc.v2( 0,   yHeight  ));
        points.push( cc.v2( pixelStep,nextY) );
        points.push( cc.v2( pixelStep, 0) );
        
        let node = new cc.Node();
        node.x = xOffset;
        node.group = 'ground'

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        let collider = node.addComponent(cc.PhysicsPolygonCollider);
        collider.points = points;
        collider.friction = 0;
        collider.tag = FINAL_TAG;
        collider.sensor = true;

        node.parent = this.node;
        
    },
    createFinalTerrian(){
        //平缓坡度
        this.generateTerrian();
        //延长水平面
        this.generateTerrian(true);
    },
    renderMesh(vertices,indices,uvs){
        const gfx = cc.gfx;

        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);
        mesh.init(vfmtColor,8,false);
    
        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        mesh.setIndices(indices);

        // let meshRender = this.meshRender;
        let meshRender = this.ground.getComponent(cc.MeshRenderer);
        let material = meshRender.getMaterial(0);
        // Reset material
        let texture = this.sf.getTexture();
        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);
        meshRender.mesh = mesh;
    },
    generateTerrianPiece (xOffset, points) {
        let hills = this.hills;

        //游戏中不会往后退，可以通过下面来复用 collider 地形
        //注意同时要更新 mesh 的顶点数据
        // let first = hills[0];
        // if (first && (this.target.x - first.node.x > 1000)) {
        //     first.node.x = xOffset;
        //     first.collider.points = points;
        //     first.collider.apply();
        //     hills.push( hills.shift() );
        //     return;
        // }

        let node = new cc.Node();
        node.x = xOffset;
        node.group = 'ground'

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        let collider = node.addComponent(cc.PhysicsPolygonCollider);
        collider.points = points;
        collider.friction = 1;

        node.parent = this.node;

        hills.push( {node: node, collider: collider} );
    },

    generateTerrian () {
        let pixelStep = this.pixelStep;
        let xOffset = this.xOffset;
        let yOffset = this.yOffset;

        //每一小段地形的长度
        let hillWidth = 120 + Math.ceil(Math.random()*26)*20;

        //开始结束平面
        if(xOffset === 0 ) {
            hillWidth = 1200;
        }

        let numberOfSlices = hillWidth/pixelStep;

        let j;

        //TODO: 这里生成的点需要测试确定y不会溢出

        // first step
        let randomHeight;
        if (xOffset === 0) {
            randomHeight = 0;
            this._meshPoints.push(cc.v2(xOffset,0))
            this._meshPoints.push(cc.v2(xOffset,yOffset))
        }
        else if(xOffset > this.mapLength) {
            randomHeight = (this.initHeight - yOffset) / 2
        }
        else {
            randomHeight = Math.min( Math.random() * hillWidth / 7.5,  MAX_HEIGHT - yOffset); 
        }
        randomHeight = Math.round(randomHeight)

        yOffset += randomHeight;
     
        for (j = 0; j < numberOfSlices/2; j++) {
            let points = [];
            let yHeight =  yOffset - randomHeight*Math.cos(2*Math.PI/numberOfSlices*j);
            let nextY = yOffset - randomHeight*Math.cos(2*Math.PI/numberOfSlices*(j+1));

            points.push( cc.v2( 0,     0) );
            points.push( cc.v2(0,   yHeight  ));
            points.push( cc.v2( pixelStep,nextY) );
            points.push( cc.v2( pixelStep, 0) );
            this.generateTerrianPiece(xOffset+ j*pixelStep, points);

            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,0))
            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,nextY))
        }

        yOffset += randomHeight;
        let extremePoint = cc.v2(xOffset+hillWidth/2,yOffset)
        this._extremePoints.push(extremePoint);

        // second step
        if (xOffset === 0) {
            randomHeight = 0;
        }
        else if(xOffset > this.mapLength) {
            randomHeight = 0;
        }
        else {
            randomHeight = Math.min( Math.random()*hillWidth/5,  yOffset - MIN_HEIGHT); 
        }
        randomHeight = Math.round(randomHeight)

        yOffset -= randomHeight;
    
        for (j = numberOfSlices/2; j < numberOfSlices; j++) {
            let points = [];
            let yHeight = yOffset - randomHeight*Math.cos(2*Math.PI/numberOfSlices*j)
            let nextY = yOffset - randomHeight*Math.cos(2*Math.PI/numberOfSlices*(j+1));

            points.push( cc.v2( 0,     0) );
            points.push( cc.v2( 0,     yHeight) );
            points.push( cc.v2( pixelStep, nextY) );
            points.push( cc.v2( pixelStep, 0) );
            this.generateTerrianPiece(xOffset+ j*pixelStep, points);

            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,0))

            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,nextY))

        }
        yOffset -= randomHeight;

       
        this.xOffset += hillWidth;
        this.yOffset = yOffset;
        extremePoint = cc.v2(this.xOffset,this.yOffset)
        this._extremePoints.push(extremePoint);
    },

    //创建障碍物
    prepareBarriers(){
        //应该在所有点中去生成障碍，这里只做demo
        this._extremePoints.forEach((ePoint,index) => {
            if(index < 5 ||　index % 3 !== 0) return; 

            if(ePoint.x > this.xOffset - 1000) return;

            if(ePoint.y > MIN_HEIGHT) {
               let tmp = Math.random() > 0.2;
               if(tmp){
                   this.generateGroundBarrier(ePoint,this._extremePoints[index-1])
               } else {
                   this.generateAirBarrier(ePoint)
               }
            }
        });
    },
    
    generateAirBarrier(position,index){
        let bPrefab =Math.random() > 0.5 ? this.airBarrier1 : this.airBarrier2
        let barrier = cc.instantiate(bPrefab);
        
        let randomH = Math.round(Math.random() * 100) + 100;
        this.node.addChild(barrier);
        barrier.setPosition(cc.v2( position.x, position.y+randomH))
    },
    generateGroundBarrier(position,position2){
        let cos = (position.y - position2.y) / (position.x - position2.x)
        let angle = 180 * Math.acos(cos) / Math.PI;
        let bPrefab =Math.random() > 0.5 ? this.groundBarrier1 : this.groundBarrier2
        let barrier = cc.instantiate(bPrefab);
        
        this.node.addChild(barrier);
        let offset = barrier.height/2
        barrier.setPosition(cc.v2( position.x, position.y+offset-10));
        // barrier.angle  = angle;

    }, 
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.target) return;
    },
});

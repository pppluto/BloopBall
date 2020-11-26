// http://www.emanueleferonato.com/2011/10/04/create-a-terrain-like-the-one-in-tiny-wings-with-flash-and-box2d-%E2%80%93-adding-more-bumps/
import { Barrier, BarrierConfig, BarrierList, BarrierMapping, BarrierRegular, BarrierType, NegtiveBarrierList, NertualBarrierList, PositiveBarrierList } from './barrier/Barrier';
import { BarrierHost } from './barrier/barrierHost';


const MIN_HEIGHT = 100;
const MAX_HEIGHT = 250;

//TODO:改成 enum TagType，这样写拿不到类型
export const TagType = cc.Enum({
    FINAL_TAG: 99,
    DIE_TAG: 88,
    BUFF_TAG: 77,
    DEBUFF_TAG: 66,
    GROUND_TAG: 55,
    BLOCK_TAG: 44,
    BALL_TAG: 10,
    DEFAULT: 0
});

interface BarrierHolder {
    x: number,
    barrier: Barrier
}

const {ccclass,property} = cc._decorator

@ccclass
export default class MainWorld extends cc.Component{
    //map config
    @property(cc.Float)
    pixelStep: number = 10
    @property(cc.SpriteFrame)
    sf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    surfaceSf: cc.SpriteFrame = null;
    //mesh
    @property(cc.Node)
    groundMesh: cc.Node = null
    @property(cc.Node)
    surfaceMesh: cc.Node = null
   
    @property(cc.Node)
    gameCtr: cc.Node = null
    //mark prefabs
    @property(cc.Prefab)
    flag: cc.Prefab = null;
    
    mapLength: number = 15000;
    hills: Array<any> = [];
    pools: Array<any> = [];
    playerFinish: boolean = false;
    initHeight: number = 150;
    xOffset: number = 0
    yOffset: number = this.initHeight;
    //mesh点
    _meshPoints: Array<any> = [];
    //极值点 (用来确定空中障碍位置)
    _extremePoints: Array<any> = [];
    _barrierCaches: BarrierHolder[] = [];
    // cc.macro.FIX_ARTIFACTS_BY_STRECHING_TEXEL_TMX = 1;
    mapEnd: boolean = false;

    onLoad () {
        this.groundMesh.zIndex = 100;
        this.surfaceMesh.zIndex = 101;

        this.prepareTerrian();
    }

    prepareTerrian(){
        this.createBoundary(20);

        //TODO:只创建部分地形，后面根据游戏动态创建(障碍道具同理)
        //创建地形
        // this.mapLength
        let partMapLength = cc.winSize.width * 2;
        while (this.xOffset < partMapLength) {
            this.generateTerrian();
        }
        this.prepareBarriers();

        // this.createEndMark(200)
        this.updateMesh()
      
    }
    addTerrian(){
        if(this.mapEnd) return;
        console.log('add more terrian',this.xOffset)
        let currentMapLength = this.xOffset + cc.winSize.width;
        while (this.xOffset < currentMapLength) {
            this.generateTerrian();
        }
        this.prepareBarriers();
        let offset = cc.winSize.width / 2 +  100;

        if(this.xOffset > this.mapLength + offset ){
            this.createEndMark(this.mapLength);
            this.createFinalTerrian();
            this.createBoundary(this.xOffset);
            this.mapEnd = true;
        }

        this.updateMesh();
    }
    updateMesh(){
        let {vertices,indices,uvs} =  this.calcVerties()
        this.renderMesh(vertices,indices,uvs);
        this.renderSurface()
    }
    calcVerties(){
        const texture = this.sf.getTexture();
        let offscreenX = this.getOffscreenX();
        let vertices = this._meshPoints.filter(v => v.x >= offscreenX); 
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
        let uvs = vertices.map((v,index) => {
            let num = Math.floor(index/2);
            let isTop = index % 2 !== 0;
            let width = num * this.pixelStep + offscreenX;

            let reverse = Math.floor(width/texWidth) %2 !==0;
            let mod = width % texWidth;
            let uvx = reverse ? 1 - mod / texWidth : mod/texWidth;
            let ry = (Math.ceil(v.y) )/texHeight;
            let uvy = isTop ?  1 - ry : 1;
            return cc.v2(uvx,uvy);
        });
        return {vertices,indices,uvs};
    }
    createBoundary(xOffset){
        let positionX = xOffset;
        let node = new cc.Node();
        node.x = positionX;
        node.group = 'ground';
        this.addCollider(node);
        node.parent = this.node;
    }
    createEndMark(positionX){
        let flagPosition = this.getMaxPosWithXOffset(positionX);
        let flag = cc.instantiate(this.flag);
        this.node.addChild(flag);
        flag.setPosition(flagPosition);
       
        let node = new cc.Node();
        node.x = positionX
        node.group = 'ground'
        this.addCollider(node, TagType.FINAL_TAG)
        node.parent = this.node;  
    }
    createFinalTerrian(){
        //平缓坡度
        this.generateTerrian();
        //延长水平面
        this.generateTerrian();
    }
    addCollider(node,tag?) {
        let points = [];
        let yHeight = cc.winSize.height;
        let pixelStep = this.pixelStep;
        points.push( cc.v2( 0,     0) );
        points.push( cc.v2( 0,   yHeight  ));
        points.push( cc.v2( pixelStep,yHeight) );
        points.push( cc.v2( pixelStep, 0) );
        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        let collider = node.addComponent(cc.PhysicsPolygonCollider);
        collider.points = points;
        collider.friction = 0;
        collider.sensor = tag ? true : false;
        if(tag) collider.tag = tag;

    }
    renderSurface(){
        let offscreenX = this.getOffscreenX();
        let vertices = this._meshPoints.filter(v => v.x > offscreenX); 
        let indices = []; //
        let texture = this.surfaceSf.getTexture();
        let surfaceH = 20;
        vertices = vertices.map((v,k) => {
            if(k % 2===0) {
                return vertices[k+1].sub(cc.v2(0,surfaceH))
            } else {
                return v;
            }
        })

        let lens = vertices.length / 2 - 1; 
        for (let index = 0; index < lens; index++) {
           
            let a1 = index*2
            let b1 = index*2 + 1;
            let a2 = index*2 + 2;
            let b2 = index*2 + 3;
            indices = indices.concat([a1,b1,a2,b1,a2,b2]);
        }
        let uvs = vertices.map((v,index) => {
            let isTop = index % 2 !== 0;
            let uvy = isTop ? 0 : 1;
            return cc.v2(0,uvy);
        });
        // 246,231,76      228,161,46
        // 效果图的渐变只在边缘，还有持续高亮部分，下面种达不到效果
        let colors = this._meshPoints.map((_,index) => {
            let isTop = index % 2 !== 0;

            let topColor = cc.color(246,231,76,255)
            let bottomColor = cc.color(228,161,46,255)
            let color = isTop ? topColor : bottomColor
            return color;
        });
        const gfx = cc['gfx'];

        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            // { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },  
        ]);
        mesh.init(vfmtColor,8,false);
    
        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        // mesh.setVertices(gfx.ATTR_COLOR,colors);
        mesh.setIndices(indices);

        // let meshRender = this.meshRender;
        let meshRender = this.surfaceMesh.getComponent(cc.MeshRenderer);
        let material = meshRender.getMaterial(0);
        // Reset material
        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);

        meshRender.mesh = mesh;
        
    }
    renderMesh(vertices,indices,uvs){
        const gfx = cc['gfx'];

        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            // { name: gfx.ATTR_NORMAL,type: gfx.ATTR_TYPE_FLOAT32, num: 2 }
        ]);
        mesh.init(vfmtColor,8,false);
    
        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        mesh.setIndices(indices);

        // let meshRender = this.meshRender;
        let meshRender = this.groundMesh.getComponent(cc.MeshRenderer);
        let material = meshRender.getMaterial(0);
        // Reset material
        let texture = this.sf.getTexture();
        // material.define("USE_DIFFUSE_TEXTURE", true);
        // material.setProperty('diffuseTexture', texture);

        // custom shader
        material.define("USE_TEXTURE", true);
        material.setProperty('texture', texture);

        meshRender.mesh = mesh;
    }
    getBalls(){
        let gameCtr = this.gameCtr.getComponent('gameControl');
        let balls = gameCtr.balls;
        return balls
    }
    getOffscreenX(){
        let balls = this.getBalls()
        if(!balls || !balls.length) return 0;
    
        let lastX = balls[0].x;
        for (let index = 1; index < balls.length; index++) {
            const element = balls[index];
            if(element.x < lastX){
                lastX = element.x
            }            
        }
        return Math.max(lastX - cc.winSize.width/2-100,0); //留一点余量
    }
    getFirstBall(){
        let balls = this.getBalls()
        if(!balls || !balls.length) return null

        let first = balls[0];
        for (let index = 1; index < balls.length; index++) {
            const element = balls[index];
            if(element.x > first.x){
                first = element;
            }            
        }
        return first;
    }
    generateTerrianPiece (xOffset, points) {
        let hills = this.hills;

        //游戏中不会往后退，可以通过下面来复用 collider 地形
        //注意同时要更新 mesh 的顶点数据
       
        let offscreenX = this.getOffscreenX()
        let first = hills[0];
        if (first && (offscreenX > first.node.x)) {
            first.node.x = xOffset;
            first.collider.points = points;
            first.collider.apply();
            hills.push( hills.shift() );
            return;
        }

        //Y不能未负数？？
        try {
            let node = new cc.Node();
            node.x = xOffset;
            node.group = 'ground';
    
            let body = node.addComponent(cc.RigidBody);
            body.type = cc.RigidBodyType.Static;
    
            let collider = node.addComponent(cc.PhysicsPolygonCollider);
            collider.points = points;
            collider.friction = 1;
            collider.tag = TagType.GROUND_TAG;
            node.parent = this.node;
    
            hills.push( {node: node, collider: collider} );
        } catch (error) {
            console.log('error',error,points)
        }
       
    }

    generateTerrian () {
        let pixelStep = this.pixelStep;
        let xOffset = this.xOffset;
        let yOffset = this.yOffset;

        //每一小段地形的长度
        // let hillWidth = 120 + Math.ceil(Math.random()*26)*20;
        let hillWidth = 120 + 13 * 20;

        //开始结束平面
        if(xOffset === 0 ) {
            hillWidth = 1200;
        }

        let numberOfSlices = hillWidth/pixelStep;

        let j = 0;

        //TODO: 这里生成的点需要测试确定y不会溢出

        // first step
        let randomHeight = 0;
        if (xOffset === 0) {
            randomHeight = 0;
            this._meshPoints.push(cc.v2(xOffset,0))
            this._meshPoints.push(cc.v2(xOffset,yOffset))
        }
        else if(xOffset > this.mapLength) {
            randomHeight = (this.initHeight - yOffset) / 2
        }
        else {
            randomHeight = Math.min( Math.random() * hillWidth / 10,  MAX_HEIGHT - yOffset); 
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

            //碰撞效果不对
            let disable = false;
            //间隔开，并不影响物理效果，节省collider node
            if(disable || j % 2){
                this.generateTerrianPiece(xOffset+ j*pixelStep, points);
            }

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
            // randomHeight = Math.min( Math.random()*hillWidth/5,  yOffset - MIN_HEIGHT);
            //保证不会小于最小值
            randomHeight = Math.round(Math.random() * yOffset-MIN_HEIGHT) / 2;
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

            let disable = false;
            if(disable || j % 2){
                this.generateTerrianPiece(xOffset+ j*pixelStep, points);
            }


            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,0))

            this._meshPoints.push(cc.v2(xOffset+ (j+1)*pixelStep,nextY))

        }
        yOffset -= randomHeight;

       
        this.xOffset += hillWidth;
        this.yOffset = yOffset;
        extremePoint = cc.v2(this.xOffset,this.yOffset)
        this._extremePoints.push(extremePoint);
    }

    getMaxPosWithXOffset(xOffset):cc.Vec2{
        let index = Math.round(xOffset / this.pixelStep);
        let allTopPoints = this._meshPoints.filter((_,index) => index % 2 !== 0)
        let pos = allTopPoints[index];
        return pos;
    }
    //创建障碍物
    prepareBarriers(){
        let preBarrierX = cc.winSize.width;
        let preBarrier = this._barrierCaches[this._barrierCaches.length-1];
        if(preBarrier){
            preBarrierX = preBarrier.x;
        }
        let tmpBarrierX = preBarrierX;
        let ballW = 40;// HARD CODE
        let {spaceRange:[minSpace,maxSpace]} = BarrierRegular;
      
        //规则见 doc/barrier.md
        let spaceOffset = 100;
        let finalOffset = 100;
        let offset = maxSpace * ballW + finalOffset + spaceOffset;
        while(preBarrierX < this.xOffset - offset) {
            let x = preBarrierX + Math.round( Math.random() * (maxSpace - minSpace)  * ballW ) + minSpace * ballW + spaceOffset;
            let y:number = this.getMaxPosWithXOffset(x).y;
            preBarrierX = x;

            if(x > this.mapLength - finalOffset) {
                break;
            }

            let tmp = this.getBarrierConfig();
            if(!tmp) {
                return;
            }
            let {barrier,barrierConfig} = tmp;
          
            this.prepareBarrier(cc.v2(x,y),barrierConfig);
            this._barrierCaches.push({x,barrier});
        }

        //         出现1个50%
        // 出现2个35%
        // 出现3个15%
        while(tmpBarrierX < this.xOffset - offset) {
            let x = tmpBarrierX +  2 * 8 * ballW + spaceOffset;
            tmpBarrierX = x;

            let seqSeed =  Math.random();
            // let holder = Array.from({length:20},(_,k) => {
            //     if(k < 10) return 1
            //     else if(k < 17) return 2
            //     else return 3
            // })
            // let seqNum = holder[Math.floor(seqSeed * holder.length)];
            //这样算 概率是不是正确的？
            let seqNum = seqSeed < 0.15 ? 3 :(seqSeed < 0.5 ? 2 : 1) 
            for (let index = 0; index < seqNum; index++) {
                x += index * 340

                if(x > this.mapLength - finalOffset || x > this.xOffset - offset) {
                    break;
                }

                let y:number = this.getMaxPosWithXOffset(x).y;

                let seed = Math.floor(Math.random() * NertualBarrierList.length);
                let barrier = NertualBarrierList[seed];
                if(!barrier) {
                    return;
                }
                let barrierConfig = BarrierMapping[barrier.name];
                
                this.prepareBarrier(cc.v2(x,y),barrierConfig);
                tmpBarrierX = x;

            }

           
        }        
    }
    getBarrierConfig(){
        let preBarrierX = cc.winSize.width;
        let preType = null;
        let preBarrier = this._barrierCaches[this._barrierCaches.length-1];
        if(preBarrier){
            preBarrierX = preBarrier.x;
            preType = preBarrier.barrier.type;
        }
        let {sameSeed} = BarrierRegular;
        let barrierCandidates:Barrier[] = [];
        let [aList,bList] = [PositiveBarrierList,NegtiveBarrierList];
        if(preBarrier && preBarrier.barrier.type !== BarrierType.NEUTRAL) {
            let type = preBarrier.barrier.type;
            let sameFlag = Math.random() < sameSeed;

            type = sameFlag ? type : (type === BarrierType.POSITIVE ? BarrierType.NEGTIVE : BarrierType.POSITIVE);
            switch (type) {
                case BarrierType.POSITIVE:
                    barrierCandidates = aList;
                    break;
                case BarrierType.NEGTIVE:
                    barrierCandidates = bList;
                    break;
                default:
                    break;
            }

        } else {
            let seed = Math.floor(Math.random() * 2);
            barrierCandidates = [aList,bList][seed];
        }
        if(preBarrier){
            barrierCandidates = barrierCandidates.slice().filter(v => v.name !== preBarrier.barrier.name);
        }
        let tmp = Math.floor(Math.random() * barrierCandidates.length);
        let barrier = barrierCandidates[tmp];
        let barrierConfig = BarrierMapping[barrier.name];
        if(!barrierConfig) {
            console.log('barrierconfig',preBarrier,barrier,barrierConfig);
            console.warn('障碍信息错误，请检查barrierMapping')
            return null;
        }
        return {barrier,barrierConfig};

    }
    prepareBarrier(ePoint,bConfig:BarrierConfig){
        if(ePoint.y < MIN_HEIGHT) return;
        let preX = ePoint.x - 10;
        let preY:number = this.getMaxPosWithXOffset(preX).y;
        this.generateBarrier(ePoint,cc.v2(preX,preY),bConfig)
    }
    generateBarrier(position,position2,bConfig:BarrierConfig){
        let angle = 0;
        if(bConfig.syncGroundAngle){
            let cos = (position.y - position2.y) / (position.x - position2.x)
            angle = 180 * Math.atan(cos) / Math.PI;
        }
        let barrier = new cc.Node();
        let bc = barrier.addComponent(BarrierHost);
        bc.barrierConfig = bConfig;

        bc.initWithPosition(cc.v2( position.x, position.y ),angle);
        this.node.addChild(barrier);
    }
    
    // called every frame, uncomment this function to activate update callback
    update (dt) {
        if(this.playerFinish) return;
        //动态创建地形和障碍，回收之前的地形和障碍
        let firstBall = this.getFirstBall();
        // return;
        if(firstBall && this.xOffset - firstBall.x < cc.winSize.width){
            this.addTerrian();
        }
    }
}   
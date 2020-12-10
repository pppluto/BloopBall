cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
   
    physicsManager.debugDrawFlags = 
        // 0;
        // cc.PhysicsManager.DrawBits.e_aabbBit |
        // cc.PhysicsManager.DrawBits.e_jointBit |
        cc.PhysicsManager.DrawBits.e_shapeBit
        ;

});

import {TerrainConfig,TerrainList,BOTTOM_HEIGHT,PIXEL_STEP} from './terrainMapping'
const {ccclass, property} = cc._decorator;

//底座高度

@ccclass
export default class Terrain extends cc.Component {

    @property(cc.SpriteFrame)
    spriteFrame: cc.SpriteFrame;
    meshRender: cc.MeshRenderer;
   
    // LIFE-CYCLE CALLBACKS:
    barrierWrapper: cc.Node;
    terrainNode: cc.Node;
    graphics: cc.Graphics;

    terrainGroupConfig: TerrainConfig;

    onLoad () {
        this.barrierWrapper = this.node.getChildByName('bWrapper');
        this.terrainNode = this.node.getChildByName('tNode');
        this.meshRender = this.node.addComponent(cc.MeshRenderer);
        let gnode = new cc.Node()
        this.node.addChild(gnode);
        this.graphics = gnode.addComponent(cc.Graphics);
        
        this.graphics.lineWidth = 10;
        this.graphics.strokeColor = new cc.Color(255,0,0)
        this.graphics.lineCap = cc.Graphics.LineCap.ROUND;
        this.graphics.lineJoin = cc.Graphics.LineJoin.ROUND;

        let material = <cc.Material>cc.assetManager.builtins.getBuiltin('material', 'builtin-unlit');
        this.meshRender.setMaterial(0,material)
        let terrainConfig = TerrainList[1];
        this.updateTerrain(terrainConfig);
    }

    updateTerrain(terrainConfig:TerrainConfig){
        //FIX 只有平台连接块能这样设置
        let polyCollider = this.terrainNode.addComponent(cc.PhysicsPolygonCollider);
        let controlPoints = terrainConfig.controlPoints;
        //加上底座高度
        let basedControlPoints = controlPoints.map(v => v.add(cc.v2(0,BOTTOM_HEIGHT)));
        let lastControlP = basedControlPoints[basedControlPoints.length - 1]
        this.node.width = lastControlP.x;
        
        let points = this.getPolyPoints(basedControlPoints,terrainConfig.isBox);
        polyCollider.points = points
        polyCollider.apply();
        if(!this.spriteFrame) return;

        this.drawMesh()
    
    }
    getPolyPoints(controlPoints,isBox){
        let lastPoint = controlPoints[controlPoints.length-1]
        let bottomLP = cc.v2(0,0);
        let bottomRP = cc.v2(lastPoint.x,0);
        let polyPoints = [bottomLP,bottomRP];

        
        let topPoints = [];
        if(isBox) {
            topPoints = controlPoints.reverse();
            polyPoints = polyPoints.concat(topPoints);

            return polyPoints;
        }
        if(controlPoints.length < 2) return;

        for (let index = 0; index < controlPoints.length - 1; index++) {
            let startP = controlPoints[index];
            let nextP = controlPoints[index + 1];
            
            let yOffset = nextP.y - startP.y;
            let xOffset = nextP.x - startP.x;
            let pieces = Math.floor(xOffset / PIXEL_STEP);
            if(pieces < 3) {
                topPoints.unshift(startP);
                continue;
            } 

            for (let j = 0; j < pieces; j++) {
                let yStepH = (yOffset - yOffset*Math.cos(Math.PI/pieces*j)) / 2;
                let p = startP.add(cc.v2(j * PIXEL_STEP,yStepH));
                topPoints.unshift(p);
            }
        }
        topPoints.unshift(lastPoint);
        polyPoints = polyPoints.concat(topPoints);

        return polyPoints;
    }
    drawMesh(){
        let {vertices,indices,uvs} = this.calcVerties()
        this.updateMesh(vertices,indices,uvs);
    }
    getMeshPoints(){
        let cNode = this.terrainNode;
        let polyPoints = cNode.getComponent(cc.PhysicsPolygonCollider).points;
        let meshPoints = polyPoints.filter(v => v.y !== 0).sort((a,b) => a.x - b.x);
        let newPoints = [];

        for (let index = 0; index < meshPoints.length; index++) {
            const element = meshPoints[index];
            newPoints.push(cc.v2(element.x,0));
            newPoints.push(element)
        }

        return newPoints
    }
    updateMesh(vertices,indices,uvs){
        const gfx = cc['gfx'];

        let mesh = new cc.Mesh();
        let vfmtColor = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            // { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
        ]);
        mesh.init(vfmtColor,8,false);
        
        // let colors = vertices.map(() =>  cc.color(246,231,76))
        mesh.setVertices(gfx.ATTR_POSITION,vertices);
        mesh.setVertices(gfx.ATTR_UV0,uvs);
        // mesh.setVertices(gfx.ATTR_COLOR,colors);
        mesh.setIndices(indices);

        let meshRender = this.meshRender;
        let material = meshRender.getMaterial(0);
        // Reset material
        let texture = this.spriteFrame.getTexture();

        material.define("USE_DIFFUSE_TEXTURE", true);
        material.setProperty('diffuseTexture', texture);

        meshRender.mesh = mesh;
    }
     calcVerties(){
        const texture = this.spriteFrame.getTexture();
        let vertices = this.getMeshPoints();
        let indices = []; //

        let lens = vertices.length / 2 - 1; 
        for (let index = 0; index < lens; index++) {
           
            let a1 = index*2
            let b1 = index*2 + 1;
            let a2 = index*2 + 2;
            let b2 = index*2 + 3;
            indices = indices.concat([a1,b1,a2,b1,a2,b2]);
        }
        let texWidth =  texture.width * 4;
        let texHeight = texture.height * 4;

        let uvs = vertices.map((v,index) => {
            let isTop = index % 2 !== 0;
            let width = v.x + this.node.x;

            let reverse = Math.floor(width/texWidth) %2 !==0;
            let mod = width % texWidth;
            let uvx = reverse ? 1 - mod / texWidth : mod/texWidth;
            let ry = (Math.ceil(v.y) )/texHeight;
            let uvy = isTop ?  1 - ry : 1;
            return cc.v2(uvx,uvy);
        });
        return {vertices,indices,uvs};
    }
    getCurveList(pointList) {
        // 长度比例系数
        var lenParam = 1/3;
        // 存储曲线列表
        var curveList = [];
        // 第一段曲线控制点1为其本身
        curveList.push({
           start:pointList[0],
           end:pointList[1],
           dot1:pointList[0],
           dot2:null
        });
        for(var i=1;i<pointList.length-1;i++){
           var cur = pointList[i];
           var next = pointList[i+1];
           var pre = pointList[i-1];
           // 上一段曲线的控制点2
           var p1 = cc.v2(cur.x-lenParam*(Math.abs(cur.x-pre.x)),cur.y);
           // 当前曲线的控制点1
           var p2 = cc.v2(cur.x+lenParam*(Math.abs(cur.x-next.x)),cur.y);
           // 上一段曲线的控制点2
           curveList[i-1].dot2 = p1;
           curveList.push({
              start:cur,
              end:next,
              dot1:p2,
              dot2:null
           });
        }
        // 最后一段曲线的控制点2为其本身
        curveList[curveList.length-1].dot2=pointList[pointList.length-1];
        return curveList;
     }
    drawLine(){
        if(!this.graphics) return

        let cNode = this.terrainNode.children[0]
        if(!cNode) return

        let polyPoints = cNode.getComponent(cc.PhysicsPolygonCollider).points;
        let points = polyPoints.filter(v => v.y !== 0).sort((a,b) => a.x - b.x);
        if(!polyPoints || !polyPoints.length) return;

        let ctx = this.graphics;
        var pos = points[0];
        ctx.clear();
        ctx.moveTo(pos.x, pos.y);
       
        // var list = this.getCurveList(points);
        // // 调用canvas三次贝塞尔方法bezierCurveTo逐一绘制
        // for(let i=0;i<list.length;i++){
        // //    ctx.moveTo(list[i].start.x,list[i].start.y);
        //    ctx.bezierCurveTo(list[i].dot1.x,list[i].dot1.y,list[i].dot2.x,list[i].dot2.y,list[i].end.x,list[i].end.y);
        // }
        // ctx.stroke();

        for (let i = 1, len = points.length; i < len; i++) { 
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    }
    update (dt) {

        this.drawLine()
       
    }
}

#### 球

- 碰撞组在cocos的设置 [](https://github.com/cocos-creator/engine/blob/master/cocos2d/core/physics/collider/CCPhysicsCollider.js#L178)
- box2d碰撞组的检查 box2d.js L12373

创建box2d物体，关联 UI 物体坐标
- position -> b2Vec
- groupIndex -> b2fixture filter
- collider形状 -> b2fixture shape

贴图
- positionBuffer(b2vec) ->  mesh vertices(cc.vec2) -> ui (画点效果太差了)
- 通过判断点到中心的距离还决定是否画这个三角形? 上下左右边界点确定，顶点数据的顺序也会影响到 render (particles无序，需要按顺逆时针排序，不然无法保证三角形覆盖了整个圆)


- distance joint 来模拟弹性， 周围球顶点位置容易获取，需要差值来使球更光滑
- 碰撞事件管理如何管理。强力下容易扭曲变形 (使joint迟钝一些)
- joint 多个刚体碰撞事件如何过滤
- 多个小球ai的碰撞区分(加tag)


#### 2d地形

- 通过小矩形模拟曲线
优化点
- 取顶点数据时，以拐点来切分出每一部分，比通过小矩形的方式要少50%的顶点数据
贴图
- 图片先进行预乘处理，防止黑边
- uv点计算需要取0-1-0-1连续范围，不然在边缘处因为从 1 直接跨到 0，贴图压在一块而导致闪烁不连贯

(ferrain)

TODO: 
- [x]摄像头控制(终点sensor)
- []障碍位置与地形要协调

优化
- []软体求用shader来模拟，(shader <-> collider) 碰撞时将碰撞点和力？传给shader来做顶点变化，考虑旋转,手动管理物理形变速度之类的东西
- []参数调整
- []地图调整


- [u3d 移植一下](https://github.com/cjacobwade/HelpfulScripts/blob/master/SmearEffect/Smear.shader)



#### 基础物理知识
力f = 物体质量m * 加速度a   牛顿第二定律
阻力f = 阻力系数k * 相对速度v 
弹力f = 弹性系数 k * 伸缩距离 x  胡克定律


#### 向量
多边形如何插值来模拟平滑曲线
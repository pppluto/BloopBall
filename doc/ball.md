#### 球模型

**note** 目前使用第一种模型

1. motorBall
   1. distance + motor joint 模拟
   2. 持续施加力矩来模拟马达动力，distance joint 保证不会过度变形,
   3. 不需要同步节点旋转，局部效果明显，整体效果有时会不自然
2. ball2
   1. 主要distance joint模拟，
   2. 需要同步节点旋转，模拟力矩旋转是个问题
   3. 周围球顶点位置容易获取，需要差值来使球更光滑
   4. 强力下容易扭曲变形
   1. 这个可能性能好一些 (少了一半左右的joint)
3. experiment/box2dTest
   1. 使用box2d引擎内部的粒子来模拟 (liquidfun)
   2. 碰撞还是可以通过sensor球来模拟(略微的误差应该不影响逻辑)
   3. 如何贴图
      1. positionBuffer(b2vec) -> mesh vertices(cc.vec2) -> ui (画点效果太差了)
      2. 通过判断点到中心的距离还决定是否画这个三角形? 上下左右边界点确定，顶点数据的顺序也会影响到 render (particles 无序，需要按顺逆时针排序，不然无法保证三角形覆盖了整个圆)


#### mess

- 碰撞组在 cocos 的设置 [](https://github.com/cocos-creator/engine/blob/master/cocos2d/core/physics/collider/CCPhysicsCollider.js#L178)
- box2d 碰撞组的检查 box2d.js L12373

创建 box2d 物体，关联 UI 物体坐标

- position -> b2Vec
- groupIndex -> b2fixture filter
- collider 形状 -> b2fixture shape
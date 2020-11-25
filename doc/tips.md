
#### 2d 地形

- 通过小矩形模拟曲线
  贴图
- 图片先进行预乘处理，防止黑边
- uv 点计算需要取 0-1-0-1 连续范围，不然在边缘处因为从 1 直接跨到 0，贴图压在一块而导致闪烁不连贯(正弦)

- [u3d 移植一下](https://github.com/cjacobwade/HelpfulScripts/blob/master/SmearEffect/Smear.shader)

#### 基础物理知识

力 f = 物体质量 m * 加速度 a 
阻力 f = 阻力系数 k * 相对速度 v  /  v * v * k
弹力 f = 弹性系数 k * 伸缩距离

#### 向量

多边形如何插值来模拟平滑曲线

#### shader

- 注意 shader 的作用范围，如果节点初始位置不对，可能会导致画面有偏移
- 添加 normals. uv1 来叠加图片，做出边缘渐变(优化)

#### bundle

- 资源bundle要选对平台，不同平台默认配置不同，会导致异常
- 微信除了resources包，其它拿不到？？(多测试)
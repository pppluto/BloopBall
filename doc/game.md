核心点: 球体滚动，而非滑动,在游戏世界上如何模拟

通过 motor joint 固定方向，跟随中心球滚动，同时通过 distance joint 保证外围球位置不会超出范围
摩擦力,力矩，重力因子，粒子个数/半径，粒子密度
要注意同步 node 节点位置
iOS巨卡

#### 目录结构

- scripts

  - checkin 签到
  - roles 角色相关(解锁/未解锁, 角色技能配置)
    - AI
  - rank 段位/排行
  - controller //player,camera,game
  - common // 广告，统计，录屏。。。
  - barrier //障碍相关的东西
    global
    config

- prefabs

  - roles
  - deco

- scenes

  - start
  - game

- resources spine/image/
  - barriers
  - spine
  - role skin

- textures

  - barrier
  - terrian
  - deco

- shaders


#### 障碍

加减速
反弹

#### 通用

签到系统
角色解锁系统
成就/排行系统

#### 场景

开始场景

- 签到
- 角色
- 排行

游戏场景

- 三个摄像头管理三层，最底层背景装饰，第二层地图游戏相关，第三层开始结算游戏进度，可能还包括一些全局的技能道具效果

角色解锁

#### 独立 ui

签到
其它视觉效果 (地形边缘,tree,)
地形边缘考虑用 uniform 数据来搞，用同一个 mesh 渲染
结算部分

#### 球模型

- motorBall  球UI表现 (distance + motor joint模拟，持续施加力矩来模拟马达动力，不需要同步节点旋转，通过 motor joint 模拟弹性碰撞效果，distance joint 保证不会过度变形)
- ball2 (主要distance joint模拟，需要同步节点旋转，模拟力矩旋转是个问题，ps:这个可能性能好一些)
- ballControl 控制球运动，监听球碰撞(障碍，技能)

##### 技能 (触发放到ballControl中去)

- skillHost 

> 释放技能，根据技能属性，在世界地图节点上生成技能节点，传入释放者 trigger，便于碰撞事件中过滤



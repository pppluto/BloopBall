核心点: 球体滚动，而非滑动,在游戏世界上如何模拟

通过 motor joint 固定方向，跟随中心球滚动，同时通过 distance joint 保证外围球位置不会超出范围
摩擦力,力矩，重力因子，粒子个数/半径，粒子密度
要注意同步 node 节点位置
iOS巨卡

#### 目录结构

- scripts

  - roles 角色相关(角色技能配置，球表现，技能节点host)
  - controller //player,camera,game
  - common // 广告，统计，录屏。。。
  - barrier //障碍相关的东西
  - helper // ai，本地用户，比赛配置，签到等辅助
  - experiment // 实验测试
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
- 角色解锁
- 段位积分
- 设置

游戏场景

- 三个摄像头管理三层，最底层背景装饰，第二层地图游戏相关，第三层开始结算游戏进度，可能还包括一些全局的技能道具效果
- 结算场景
  - 排行
  - 角色积分段位更新动画

> 转场动画 常驻节点、camera

#### 独立 ui

签到
其它视觉效果 (地形边缘,tree,)
地形边缘考虑用 uniform 数据来搞，用同一个 mesh 渲染


##### 技能 (触发放到ballControl中去)

- skillHost 

> 释放技能，根据技能属性，在世界地图节点上生成技能节点，传入释放者 trigger，便于碰撞事件中过滤



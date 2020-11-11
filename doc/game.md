核心点: 球体滚动，而非滑动,在游戏世界上如何模拟

通过 motor joint 固定方向，跟随中心球滚动，同时通过 distance joint 保证外围球位置不会超出范围
摩擦力,力矩，重力因子，粒子个数/半径，粒子密度
要注意同步 node 节点位置

#### 目录结构

- scripts

  - checkin 签到
  - roles 角色相关(解锁/未解锁, 角色技能配置)
  - rank 段位/排行
  - AI
  - controller //player,camera
  - common // 广告，统计，录屏。。。
    global
    config

- prefabs

  - roles
  - barriers
  - common

- scenes

  - start
  - game

- resources 需要动态加载的资源 spine/image/

  - spine
  - role skin

- textures

  - barrier
  - terrian
  - deco

- shaders

#### 角色 UI,技能

角色视觉和行为解耦，皮肤和装饰通过配置表读，配置项包括名字，位置，前后层级
每个角色 UI 放在同一文件夹，方便动态读取

#### 角色技能相关技术点

加减速
可视区域限制 mask/shader
变身 -> mesh 贴图更新，碰撞区域也要变?
禁锢眩晕
免疫
天空道具跟随移动，camera 层级考虑

#### 障碍

加减速
反弹

#### 通用

签到系统
角色解锁系统
成就/排行系统

#### 场景

开始场景

游戏场景

- 三个摄像头管理三层，最底层背景装饰，第二层地图游戏相关，第三层开始结算游戏进度，可能还包括一些全局的技能道具效果

角色解锁

#### 独立 ui

签到
其它视觉效果 (地形边缘,tree,)
地形边缘考虑用 uniform 数据来搞，用同一个 mesh 渲染
结算部分

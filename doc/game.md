
核心点: 球体滚动，而非滑动,在游戏世界上如何模拟


#### 目录结构

- scripts 
    - checkin  签到
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

- resources 需要动态加载的资源  spine/image/

- textures
    - barrier
    - roles
    - terrian
    - deco

- shaders
    

#### 角色技能相关技术点
加减速
可视区域限制  mask/shader
变身  -> mesh贴图更新，碰撞区域也要变?
禁锢眩晕
免疫
天空道具跟随移动，camera层级考虑

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
结算场景
角色解锁

#### 独立ui
签到
其它视觉效果 (地形边缘,tree,)

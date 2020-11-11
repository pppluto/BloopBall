var platformCtx = null;
if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
  platformCtx = tt;
} else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
  platformCtx = wx;
}
const generateUUID = () => {
  let ts = new Date().getTime();
  let sub = String(ts).substr(-16);
  let randomTail = Math.floor(Math.random() * 10000);
  let uuid = sub + randomTail;
  return uuid;
};

const GAME_INFO = {
  gameName: 'bloop-go',
};
// https://up.jiyibian.com/
/**
 * 主事件名 t:
 * 游戏配置数据 gameInfo
 * 通用数据:
 *    当前场景: currentScene,
 *    当前关卡: currentLevel
 * 系统数据 sysInfo
 * 用户数据 uesrInfo
 */
const UPLOAD_HOST = 'https://up.jiyibian.com/';

class Statistics {
  constructor() {
    this.gameInfo = GAME_INFO;
    this.sysInfo = {};
    this.userInfo = {};
    this.init();
    this.restoreUUID();

  }
  restoreUUID(){
    let localUUID = cc.sys.localStorage.getItem('_uuid');
    this.uuid = localUUID || generateUUID();
    if(!localUUID){
      cc.sys.localStorage.setItem('_uuid',this.uuid);
    }
  }
  init() {
    if (platformCtx) {
      platformCtx.onShow((res) => {
        let { scene } = res;
        console.log('程序回到前台', res);
        this.trackEvent('gameShow', { wxScene: scene });
      });
      platformCtx.onHide((res) => {
        console.log('程序到后台', res);
        this.trackEvent('gameHide');
      });
      platformCtx.onError((err) => {
        let { message, stack } = err;
        console.log('程序错误', message, stack);
        this.trackEvent('gameError', { message, stack });
      });
      platformCtx.onMemoryWarning((res) => {
        this.trackEvent('gameMemoryWarn', res);
      });
      //TODO:小游戏程序启动场景
      let { scene } = platformCtx.getLaunchOptionsSync();
      this.trackEvent('gameStart', { wxScene: scene });
      try {
        const res = platformCtx.getSystemInfoSync();
        let {
          model,
          language,
          platform,
          version,
          brand,
          system,
          benchmarkLevel,
        } = res;

        this.sysInfo = {
          model,
          language,
          platform,
          version,
          brand,
          benchmarkLevel,
          system,
        };
        console.log('stat init', this.sysInfo);
      } catch (e) {
        // Do something when catch error
      }
    }
  }
  setUserInfo(userInfo) {
    this.userInfo = userInfo;
  }
  trackingSceneShowTS(sceneName, duration) {
    let t = 'sceneExistTS';
    let extra = {
      duration,
    };
    this.uploadStat(t, extra);
  }
  trackingSceneLoadTS(sceneName, preSceneName, duration) {
    let extra = {
      preScene: preSceneName,
      duration,
    };
    let t = 'sceneLoadTS';

    this.uploadStat(t, extra);
  }

  trackEvent(eventName, extra) {
    let extraInfo = {
      ...extra,
    };
    this.uploadStat(eventName, extraInfo);
  }
  uploadStat(eventName, extraInfo = {}) {
    if (!eventName) {
      console.warn('stat should has eventName');
      return;
    }
    console.log('upload stat----', eventName, extraInfo);
    let cScene = cc.director.getScene() || {};
    let currentScene = cScene.name || '';

    let statData = {
      t: eventName,
      currentScene,
      platform: cc.sys.platform,
      uuid: this.uuid,
      ...this.gameInfo,
      ...this.sysInfo,
      ...this.userInfo,
      ...extraInfo,
    };
    if (platformCtx) {
      platformCtx.request({
        url: UPLOAD_HOST,
        data: statData,
        success(res) {},
        fail(err) {
          console.log('upload stat error', err);
        },
      });
    }
  }
}

let stat = new Statistics();

module.exports = stat;

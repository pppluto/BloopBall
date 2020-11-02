var platformCtx = null;
if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
  platformCtx = tt;
} else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
  platformCtx = wx;
}

const GAME_INFO = {
  _name: 'bloop-go',
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
function buildQuery(params) {
  var esc = encodeURIComponent;
  var query = Object.keys(params)
    .map((k) => esc(k) + '=' + esc(params[k]))
    .join('&');
  return query;
}
class Statistics {
  constructor() {
    this.gameInfo = GAME_INFO;
    this.sysInfo = {};
    this.userInfo = {};
    this.init();

    this._preScene = null;
    this._curSceneStartLoadingTS = new Date().getTime();
    this._curSceneLoadedTS = new Date().getTime();

    //新场景加载, 这个加载事件在global里做的hack
    cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, () => {
      let scene = cc.director.getScene();
      if (!scene) {
        return;
      }
      let sceneName = scene.name;
      let nowTS = new Date().getTime();
      // console.log('EVENT_BEFORE_SCENE_LOADING--', sceneName);

      //记录当前场景名和
      this._preScene = sceneName;
      this._curSceneStartLoadingTS = nowTS;
    });

    //新场景运行, 这里减去before的，就是场景加载时间
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
      let scene = cc.director.getScene();
      if (!scene) {
        return;
      }
      let sceneName = scene.name;
      let nowTS = new Date().getTime();
      let loadDuration = nowTS - this._curSceneStartLoadingTS;
      let showDuration = nowTS - this._curSceneLoadedTS;

      // console.log('EVENT_AFTER_SCENE_LAUNCH', sceneName);

      if (this._preScene) {
        // console.log('场景', this._preScene, '持续时间', showDuration);
        this.trackingSceneShowTS(this._preScene, showDuration);
      }

      // console.log('前一场景', this._preScene);
      // console.log('当前场景', sceneName, '加载时间', loadDuration);
      this.trackingSceneLoadTS(sceneName, this._preScene, loadDuration);

      this._preScene = sceneName;
      this._curSceneLoadedTS = nowTS;
    });
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
      _platform: cc.sys.platform,
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

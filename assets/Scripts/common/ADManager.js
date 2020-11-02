var platformCtx = null;
if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
  platformCtx = tt;
} else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
  platformCtx = wx;
}
// //结算页底部
// var BANNER_ADID = 'adunit-a9cde8a4ba43d710';
// //激励广告
// var REWARD_ADID = 'adunit-8d8852c25d94a0c3';
// //插屏广告
// var INSERT_ADID = 'adunit-a4564199a98797f5';
// //首页广告
// var MAIN_ADID = 'adunit-5af16a764a821727';

// if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
//   BANNER_ADID = '84kjf063711lee6230';
//   REWARD_ADID = '1862bpi7metgo49jer';
//   INSERT_ADID = 'n49qkiwrw5d1i34oaj';
//   MAIN_ADID = 'q24m747j94l3dfd957';
// }

class AdManager {
  constructor() {
    this.enableDebug = false;
    this.maxWidth = 750;
    this.maxHeight = 1334;
    this.adIdConfig = null;
    let isBytedanceGame = cc.sys.platform === cc.sys.BYTEDANCE_GAME;
    this.rewardADAvaliable = false || isBytedanceGame;
    if (platformCtx) {
      try {
        const {windowHeight, windowWidth} = platformCtx.getSystemInfoSync();
        this.maxWidth = windowWidth;
        this.maxHeight = windowHeight;
      } catch (e) {}
    }
  }

  /**
   *
   * @param {广告id参数} config
   */
  init(config) {
    this.adIdConfig = config;
    this.createRewardedAd();
    this.createInsertAd();
  }
  log(...params) {
    if (this.enableDebug) {
      console.log(params);
    }
  }
  createRewardedAd() {
    if (!platformCtx || !platformCtx.createRewardedVideoAd) {
      return;
    }
    if (!this.adIdConfig) {
      return console.warn('广告id未配置');
    }
    let isBytedanceGame = cc.sys.platform === cc.sys.BYTEDANCE_GAME;
    this.rewardADAvaliable = false || isBytedanceGame;
    this._rewardedVideo = platformCtx.createRewardedVideoAd({
      adUnitId: this.adIdConfig.REWARD_ADID,
    });

    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      this._rewardedVideo.onLoad(() => {
        this.log('激励广告加载成功');
        this.rewardADAvaliable = true;
      });
    }
    this._rewardedVideo.onError((err) => {
      this.log('激励广告加载错误', err);
      this.rewardADAvaliable = false;
    });
    this._rewardedVideo.onClose((res) => {
      // 用户点击了【关闭广告】按钮
      // 小于 2.1.0 的基础库版本，res 是一个 undefined
      if ((res && res.isEnded) || res === undefined) {
        this.log('激励视频播放结束');
        this._playCallback && this._playCallback({isEnded: true});
      } else {
        this.log('激励视频播放中途退出');
        this._playCallback && this._playCallback({isEnded: false});
      }
      this._playCallback = null;
      // if(cc.sys.platform === cc.sys.BYTEDANCE_GAME){
      //   this._rewardedVideo.load();
      // }
    });
  }
  showRewardedAd(cb) {
    if (this.rewardADAvaliable) {
      this._playCallback = cb;
      if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
        this.showBDRewardAd();
      } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        this.showWXRewardAd();
      }
    } else {
      //TODO: upload stat
      platformCtx.showToast({
        title: '暂无视频可看，请稍后再试吧~~。',
      });
    }
  }
  showWXRewardAd() {
    this._rewardedVideo.show().then(() => this.log('激励视频 广告显示'));
  }
  showBDRewardAd() {
    this._rewardedVideo
      .show()
      .then(() => {
        this.log('广告显示成功');
      })
      .catch((err) => {
        this.log('广告组件出现问题', err);
        // 可以手动加载一次
        this._rewardedVideo
          .load()
          .then(() => {
            this.log('手动加载成功');
            // 加载成功后需要再显示广告
            return this._rewardedVideo.show();
          })
          .catch((err) => {
            this.log('手动加载展示错误', err);
          });
      });
  }
  createBannerAd(isMain = false, cb) {
    if (!platformCtx || !platformCtx.createBannerAd) {
      return;
    }
    if (!this.adIdConfig) {
      return console.warn('广告id未配置');
    }
    if (this._bannerAd) {
      this._bannerAd.destroy();
      this._bannerAd = null;
    }

    let adid = isMain ? this.adIdConfig.MAIN_ADID : this.adIdConfig.BANNER_ADID;
    let margin = 10;
    this._bannerAd = platformCtx.createBannerAd({
      adUnitId: adid,
      style: {
        left: margin,
        top: this.maxHeight,
        width: this.maxWidth - 10 * margin,
      },
    });
    this._bannerAd.onLoad(() => {
      this.log('banner广告加载成功');
      if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
        cb && cb(true);
        this._bannerAd.show().catch((err) => console.log('bannerad show err'));
        return;
      }
    });
    this._bannerAd.onError((err) => {
      this.log('bannerad 加载失败', err);
      this._bannerAd && this._bannerAd.destroy();
      this._bannerAd = null;
    });
    this._bannerAd.onResize((res) => {
      if(!this._bannerAd.style) return;

      this._bannerAd.style.left = this.maxWidth / 2 - res.width / 2 + 0.1;
      this._bannerAd.style.top = this.maxHeight - res.height + 0.1;
    });
  }
  showBottomAd(cb) {
    //抖音在onload里直接展示
    if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
      return;
    }
    if (this._bannerAd) {
      this._bannerAd
        .show()
        .then(() => {
          cb && cb(true);
        })
        .catch((err) => {
          this.log('banner 显示失败', err);
        });
    }
  }
  hideBottomAd() {
    if (this._bannerAd) {
      this._bannerAd.destroy();
      this._bannerAd = null;
    }
  }
  createInsertAd() {
    if (!platformCtx || !platformCtx.createInterstitialAd) {
      return;
    }
    if (!this.adIdConfig || !this.adIdConfig.INSERT_ADID) {
      return console.warn('广告id未配置');
    }
    //微信是一个单例。抖音每次都去创建展示
    if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
      return;
    }

    if (this._insertBannerAd) {
      this._insertBannerAd.destroy();
      this._insertBannerAd = null;
    }

    this._insertBannerAd = platformCtx.createInterstitialAd({
      adUnitId: this.adIdConfig.INSERT_ADID,
    });
    this._insertBannerAd.onLoad(() => {});
    this._insertBannerAd.onError((err) => {
      this.log('插屏广告加载失败', err);
      this._insetCallback && this._insetCallback(err);
      this._insertBannerAd = null;
    });
    this._insertBannerAd.onClose(() => {
      this._insetCallback && this._insetCallback(null, {status: 'closed'});
      this._insetCallback = null;
    });
    this._insertBannerAd.load();
  }
  showInsertAd(cb) {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      this.showWXInsertAd(cb);
    } else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
      this.showBDInsertAd(cb);
    } else {
      cb && cb({msg: '平台不支持'});
    }
  }
  showWXInsertAd(cb) {
    if (!this._insertBannerAd) {
      cb && cb();
      return;
    }

    this._insetCallback = cb;
    this._insertBannerAd.show().catch((err) => {
      cb && cb(err);
    });
  }
  showBDInsertAd(cb) {
    cb && cb({msg: 'TESTING'});
    return;
    //有点问题
    if (this._operating) return;

    this._operating = true;
    const interstitialAd = tt.createInterstitialAd({
      adUnitId: this.adIdConfig.INSERT_ADID,
    });

    interstitialAd
      .load()
      .then(() => {
        interstitialAd.onClose(() => {
          this._operating = false;
          interstitialAd.destroy();
          cb && cb();
        });
        interstitialAd.onError((err) => {
          this.log('insert error', err);
          this._operating = false;
          interstitialAd.destroy();
          cb && cb();
        });
        interstitialAd.show();
      })
      .catch((err) => {
        this.log('inset load', err);
        this._operating = false;
        cb && cb();
      });
  }
}

let adMgr = new AdManager();

module.exports = adMgr;

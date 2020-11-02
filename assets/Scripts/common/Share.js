const wrapWXShare = (params) => {
  let { success, fail, ...others } = params;
  wx.shareAppMessage(others);
  setTimeout(() => {
    success && success();
  }, 1000);
};

var platformCtx = null;
if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
  platformCtx = tt;
  platformContext.commonShare = platformCtx.shareAppMessage;
} else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
  platformCtx = wx;
  platformCtx.commonShare = wrapWXShare;
}

const titles = [
  '哈哈！老娘又弄死一个渣男！',
  '你知道怎么对付渣男吗！来我教你！',
  '碰到渣男怎么办？这几种办法你可以试试！',
  '渣男何止锡纸烫！被整蛊的丑态也千千万！',
];
const SHARE_IMG_URL = 'https://cdn.wanhuahai.com/upload/live/192655/326e355459-7498a8d0-15d3-11eb-9ecd-7cd30ac4edd8.png';
function setupShare() {
  if (platformCtx) {
    platformCtx.showShareMenu({
      withShareTicket: false,
      menus: ['shareAppMessage', 'shareTimeline'],
    });

    let title = titles[Math.floor(Math.random() * titles.length)];
    title = '弄死渣男的100种方法！';
    platformCtx.onShareAppMessage(() => {
      return {
        title,
        imageUrl: SHARE_IMG_URL
      };
    });
  }
}

/**
 * 
 * @param {参数跟微信/抖音官方一致} params 
 */
function shareMessage({title,...others}) {
  let randomTitle = titles[Math.floor(Math.random() * titles.length)];
  title = title || randomTitle;
  title = '弄死渣男的100种方法！';
  if(platformCtx){
    platformCtx.commonShare({title, imageUrl: SHARE_IMG_URL, ...others});
  }
}
module.exports = {
  setupShare,
  shareMessage
};

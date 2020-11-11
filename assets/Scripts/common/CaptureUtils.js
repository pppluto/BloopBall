/**
 * 官方示例
 * https://github.com/cocos-creator/example-cases/tree/v2.4.3/assets/cases/07_capture_texture
 * 
 * 这里只支持了小程序
 * 修改了生成图片返回，在图片onload里返回图片，保证图片已经创建好
 */

var platformCtx = null;
if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
  platformCtx = tt;
} else if(cc.sys.platform === cc.sys.WECHAT_GAME) {
  platformCtx = wx;
} else {
  platformCtx = {
      createImage: () => {
        return document.createElement('img');
      },
      createCanvas: () => {
        return document.createElement('canvas');
      }
  }
}
class CaptureUtil {
  constructor(props) {
    this._callback = null;
  }
  /**
   * 
   * @param {回调，返回一个Image对象} cb 
   */
  captureScreen(cb) {
    if(!platformCtx) return cb({msg:'no context'});

    this._callback = cb;
    cc.director.once(cc.Director.EVENT_AFTER_DRAW,() => {
      this.createImg();
    });
  }
  createImg() {
    var dataURL = cc.game.canvas.toDataURL('image/png');
    var img = platformCtx.createImage();
    img.onload = (res) => {
      this._callback && this._callback(null, img);
    };
    img.onerror = (err) => {
      this._callback && this._callback(err);
    };
    img.src = dataURL;
  }
  /**
   * 
   * @param {Image 对象} img 
   * 返回一个 全屏 sprite node
   */
  createSpirteNode(img) {
    let texture = new cc.Texture2D();
    texture.initWithElement(img);

    let spriteFrame = new cc.SpriteFrame();
    spriteFrame.setTexture(texture);

    let node = new cc.Node();
    let sprite = node.addComponent(cc.Sprite);
    sprite.spriteFrame = spriteFrame;

    node.height = cc.winSize.height;
    node.width = cc.winSize.width;

    node.x = 0;
    node.y = 0;
    node.width = cc.winSize.width;
    return node;
  }
}

var obj = new CaptureUtil();

module.exports = obj;

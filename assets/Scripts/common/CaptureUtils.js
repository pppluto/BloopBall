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
   * @param {捕捉所需截取内容的camera} camera 
   * @param {回调，返回一个Image对象} cb 
   */
  captureScreen(camera, cb) {
    if(!platformCtx) return cb({msg:'no context'});

    this._callback = cb;
    let texture = new cc.RenderTexture();
    texture.initWithSize(
      cc.visibleRect.width,
      cc.visibleRect.height,
      cc.gfx.RB_FMT_S8
    );
    camera.targetTexture = texture;
    this.createCanvas(camera, texture);
    this.createImg();
  }
  createImg() {
    var dataURL = this._canvas.toDataURL('image/png');
    var img = platformCtx.createImage();
    img.onload = (res) => {
      this._callback && this._callback(null, img);
    };
    img.onerror = (err) => {
      this._callback && this._callback(err);
    };
    img.src = dataURL;
  }
  createCanvas(camera, texture) {
    let width = texture.width;
    let height = texture.height;
    if (!this._canvas) {
      this._canvas = platformCtx.createCanvas();

      this._canvas.width = width;
      this._canvas.height = height;
    } else {
      this.clearCanvas();
    }
    let ctx = this._canvas.getContext('2d');
    camera.render();
    let data = texture.readPixels();
    // write the render data
    let rowBytes = width * 4;
    for (let row = 0; row < height; row++) {
      let srow = height - 1 - row;
      let imageData = ctx.createImageData(width, 1);
      let start = srow * width * 4;
      for (let i = 0; i < rowBytes; i++) {
        imageData.data[i] = data[start + i];
      }

      ctx.putImageData(imageData, 0, row);
    }
    return this._canvas;
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
  clearCanvas() {
    let ctx = this._canvas.getContext('2d');
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
}

var obj = new CaptureUtil();

module.exports = obj;

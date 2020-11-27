const {ccclass,property} = cc._decorator;
const platformCtx = {
    createImage: () => {
      return document.createElement('img');
    },
    createCanvas: () => {
      return document.createElement('canvas');
    }
}
@ccclass
export default class Start extends cc.Component{
    @property(cc.Sprite)
    sceneSpriteHolder: cc.Sprite

    previousSceneName: string = '';
    onLoad(){
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,() => {
            if(!this.previousSceneName) return;
          
            cc.director.once(cc.Director.EVENT_AFTER_DRAW,() => {
                this.onSceneLoading()

            })

        });
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,() => {

            console.log('EVENT_AFTER_SCENE_LAUNCH',  this.previousSceneName);

           
            this.previousSceneName = cc.director.getScene().name;
            this.startAnimation();

            
        })
    }
    createImg() {
        var dataURL = cc.game.canvas.toDataURL('image/png');
  
        var img = platformCtx.createImage();
        img.onload = (res) => {
            let texture = new cc.Texture2D();
            texture.initWithElement(img);
        
            let spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(texture);

            this.sceneSpriteHolder.spriteFrame = spriteFrame;
        };
        img.onerror = (err) => {
            console.log('createimg',err);
        };
        img.src = dataURL;
    }
    startAnimation(){
        this.sceneSpriteHolder.node.scale = 1;
        this.sceneSpriteHolder.node.angle = 0;
        cc.tween(this.sceneSpriteHolder.node)
            .to(1,{scale:0,angle:360})
            .call(() => {
            })
            .start();
    }
    onSceneLoading(){
        this.createImg()
    }
}
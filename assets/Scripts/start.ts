const {ccclass,property} = cc._decorator;

@ccclass
export default class Start extends cc.Component{
    onLoad () {
        cc.director.preloadScene("Main");
    }

    start () {
     
    }
    startGame(){
        cc.director.loadScene("Main");
    }
}
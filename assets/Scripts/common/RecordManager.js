class RecordManager {
    constructor() {
      this._videoPath = '';
      this._rManager = null;
      this._callback = null;
      this.init();
    }
    init() {
      if (cc.sys.platform === cc.sys.BYTEDANCE_GAME) {
        let grm = tt.getGameRecorderManager();
  
        grm.onStart((res) => {
          console.log('录屏开始', res);
        });
        grm.onStop((res) => {
          console.log('录屏结束', res.videoPath);
          this._callback && this._callback(null,res.videoPath);
          this._videoPath = res.videoPath;
          this._callback = null;
        });
        grm.onPause((res) => {
          console.log('录屏暂停', res);
        });
        grm.onResume((res) => {
          console.log('录屏恢复', res);
        });
        grm.onError((errMsg) => {
          console.log('录屏错误', errMsg);
          this.recording = false;
          this._callback && this._callback(errMsg);
          this._videoPath = null;
          this._callback = null;
        });
        this._rManager = grm;
      }
    }
    start() {
      if (!this._rManager) return;
      
      this.recording = true;
      this._videoPath = '';
      this._callback = null;
      this._rManager.start({
        duration: 300,
        isMarkOpen: false,
      });
    }
    pause() {
      if (!this._rManager || !this.recording) return;
  
      this.paused = true;
      this._rManager.pause();
    }
    resume() {
      if (!this._rManager || !this.recording) return;
      this.paused = false;
      this._rManager.resume();
    }
    stop(cb) {
      if (!this._rManager || !this.recording) {
        let msg = 'no context or no recording';
        cb && cb({msg});
        return 
      }
      if(cb){
        this._callback = cb;
      }
      this.recording = false;
      this._rManager.stop({
        duration: 300,
        isMarkOpen: false,
      });
    }
  }
  
  const rManager = new RecordManager();
  
  module.exports = rManager;
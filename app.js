//app.js
App({
  myaudio: wx.createInnerAudioContext(),
  onLaunch: function () {
      //获取缓存

    var localUserInfo = wx.getStorageSync("userInfo")
    if (localUserInfo != null && localUserInfo!=''){
      this.globalData.userInfo = localUserInfo
      console.log(this.globalData.userInfo)
    }
    var header = wx.getStorageSync("header")
    if (header != null && header != '') {
      this.globalData.header.Cookie = header
      console.log(this.globalData.header.Cookie)
    }

    var latelySongList = wx.getStorageSync("latelySongList")
    if (latelySongList != null && latelySongList!=''){
      console.log("最近播放:")
      this.globalData.latelySongList = latelySongList 
      console.log(this.globalData.latelySongList)
      
    }
    this.myaudio.onPlay(() => {
      console.log('开始播放')
    })
    this.myaudio.onTimeUpdate((res) => {
      console.log("播放变化")
    })
    this.myaudio.onPause(() => {
      console.log('播放暂停')
    })
    this.myaudio.onWaiting(() => {
      console.log('缓存中')
    })
    this.myaudio.onEnded(() => {
      console.log('播放结束')
    })
    this.myaudio.onStop(() => {
      console.log('播放停止')
    })
    this.myaudio.onStop((res) => {
      console.log('网络出错，' + res.errCode)
    })
    this.myaudio.play()
    
  },
  
  
  globalData: {
    userInfo: {
      nickName: null,
      avatarUrl:null,
      phone:null
    },
    header: { 'Cookie': null },
    //下面是仅存在全局变量，不存在缓存
    latelySongList:[],
    loveSongIdList:[],
    loveSongList:[],
    song_id:'',
    isPlat:false,
    song_total:'',
    duration_str:'',
    playlistTab:'',

  }
})
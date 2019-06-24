var testsrc ="http://zhangmenshiting.qianqian.com/data2/music/52066011d53acbb955e05569186506c9/607756185/607756185.m4a?xcode=f8a7e6074104e6472a1779a2a81a9c08"
// const myaudio= wx.createInnerAudioContext()
const url ='http://tingapi.ting.baidu.com/v1/restserver/ting'
var app=getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList


Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    advertisingImg:[],
    currentTab:0,
    songList:[],
    offset: '0',         //偏移量
    size: '10',
    hotSongList:[],
    hotoffset: '0',         //偏移量
    //hotsize: '10',
    isPlat: '',    //用来标识现在播放歌曲
    songId: '',       //用来标识现在播放歌曲
    searchText:''
  },
  audioPlay(e){   //播放，通过song_id获取音乐src
    var page=this
    var song_id = e.currentTarget.dataset.song_id
    console.log(song_id)
    if (song_id == page.data.songId){
      myaudio.play()
    }else{
      wx.request({
        url: url,
        data: {
          'method': 'baidu.ting.song.play',
          'songid': song_id
        },
        success: function (res) {
          app.globalData.song_id = song_id
          app.globalData.isPlat = true
          console.log(res.data)
          var songinfo = res.data.songinfo
          var song_src = res.data.bitrate.show_link
          songinfo.song_src = song_src       //存入最近播放目录
          var temp_x=0
            latelySongList.forEach(data=>{
              if (data.song_id === songinfo.song_id){
                console.log("已在缓存中")
                temp_x=1
              }
            })
          if (latelySongList == null || latelySongList == '' || temp_x==0) {
            console.log("没在缓存中")
            latelySongList.push(songinfo)
            app.globalData.latelySongList = latelySongList
            
            wx.setStorageSync("latelySongList", latelySongList)     //用户最近播放同步加入本地缓存
          }
          
          if (myaudio.src == song_src) {   //同一首歌
            console.log("同一首歌")
          } else {
            console.log("新歌")
            myaudio.src = song_src
          }
          page.setData({ songId: song_id })
        },
        complete: function (res) {
          myaudio.play()
        }
      })
    }
    this.setData({ isPlat: true })
    app.globalData.isPlat = true
  },
  stopPlay(e){
    myaudio.pause()
    this.setData({ isPlat: false })
    app.globalData.isPlat = false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page=this
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    wx.getSystemInfo({  //获取系统屏幕大小
      success: function (res) {
        page.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth
        })
      },
    });
    this.getNewSong()
    this.getHotSong()
    this.initAdvertisingImg()
    //this.initAudio()
  },
  switchNav(e) {
    var id = e.currentTarget.id;
    this.setData({ currentTab: id })
  },
  swiperChange(e) {
    this.setData({ currentTab: e.detail.current })
  },
  getNewSong(e){
    var page=this
    var size = page.data.size
    var offset = page.data.offset
    wx.request({
      url: 'http://tingapi.ting.baidu.com/v1/restserver/ting',
      method:'GET',
      data:{
        'method':'baidu.ting.billboard.billList',
        'type':'1' ,
        'size': size,
        'offset': offset
      },
      success:function(res){
        //console.log(res.data.song_list)
        offset = parseInt(size)+parseInt(offset)
        //console.log(offset)
        var songList = page.data.songList
        for (var index in res.data.song_list){
          songList.push(res.data.song_list[index])
        }
        page.setData({ songList: songList, offset: offset })
      },
      complete:function(res){
        wx.hideToast()
      }
    })
  },
  getHotSong(e) {
    var page = this
    var size = page.data.size
    var hotoffset = page.data.hotoffset
    wx.request({
      url: 'http://tingapi.ting.baidu.com/v1/restserver/ting',
      method: 'GET',
      data: {
        'method': 'baidu.ting.billboard.billList',
        'type': '2',
        'size': size,
        'offset': hotoffset
      },
      success: function (res) {
        console.log(res.data.song_list)
        hotoffset = parseInt(size) + parseInt(hotoffset)
        console.log(hotoffset)
        var hotSongList = page.data.hotSongList
        for (var index in res.data.song_list) {
          hotSongList.push(res.data.song_list[index])
        }
        page.setData({ hotSongList: hotSongList, hotoffset: hotoffset })
      },
      complete: function (res) {
        wx.hideToast()
      }
    })
  },
  initAudio(){
    //定义播放回调
    myaudio.onPlay(() => {
      console.log('开始播放')
    })
    myaudio.onTimeUpdate((res) => {
      console.log("播放变化")
    })
    myaudio.onPause(() => {
      console.log('播放暂停')
    })
    myaudio.onWaiting(() => {
      console.log('缓存中')
    })
    myaudio.onEnded(() => {
      console.log('播放结束')
    })
    myaudio.onStop(() => {
      console.log('播放停止')
    })
    myaudio.onStop((res) => {
      console.log('网络出错，' + res.errCode)
    })
    
  },
  initAdvertisingImg(e){                       //获取新歌中的海报6张
  var page=this
    wx.request({
      url: url,
      method:'GET',
      data:{
        'method':'baidu.ting.billboard.billList',
         'type':'1',
         'size':'20',   //返回条目
         'offset':'0'     //获取偏移
      },
      success:function(res){
        var songList = res.data.song_list
        var advertisingImg=[]
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18,19];
        for (var index = 0; index < 5; index++){
          var ran = Math.floor(Math.random() * (arr.length - index));
          var src = songList[arr[ran]].pic_premium
          var temp = { "src": src }
          advertisingImg.push(temp)
          arr[ran] = arr[arr.length - index - 1]
        }
        page.setData({ advertisingImg: advertisingImg })
      }
    })
  },
  getNewMore(e){
    
  },
  getAuthorSong(e){
    var tinguid = e.currentTarget.dataset.author
    wx.navigateTo({
      url: '../songer/songer?tinguid='+tinguid
    })
  },

  //搜索功能
  getSearchText(e){
    this.setData({ searchText:e.detail.value})
  },
  doSearch(e){
    var searchText = this.data.searchText
    wx.navigateTo({
      url: '../search/search?searchText=' + searchText,
    })
    
  },
  gotoSong(e){
    var song_id = e.currentTarget.dataset.song_id
    //console.log(song_id)
   wx.navigateTo({
     url: '../song/song?song_id='+song_id,
   })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({ 
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
       })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //console.log('碰底啦')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  doGetMore(e){
    console.log('碰底啦')
    var that = this;
    loadMore(that);
  }
})
var loadMore = function (that){
  wx.showToast({
    title: '加载中',
    icon:'loading',
    duration:10000
  })
  if (that.data.currentTab==0){
    that.getNewSong()
  } else if (that.data.currentTab == 1){
    that.getHotSong()
  }else{
  } 
}
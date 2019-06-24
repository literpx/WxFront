
const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
var app = getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList
const myurl = 'http://localhost:8088/DD_Music/SaveLike'



var getLoveIDList=function(that){  //获取数据库歌曲id列表
  wx.showToast({
    title: '',
    icon: 'loading',
    duration: 10000
  })
  var page = that
  wx.request({
    url: myurl,
    data:{
      code:'1',
    },
    header: getApp().globalData.header, //请求头
    method:'GET',
    success:function(res){
      console.log(res.data)
      page.setData({ loveSongIdList: res.data})
      app.globalData.loveSongIdList = res.data
    },
    fail:function(res){
      console.log(res.errMsg)
    },
    complete:function(res){
      var loveSongIdList = page.data.loveSongIdList
      getLoveSongList(page, loveSongIdList)
    }
  })
}
var getLoveSongList = function (that, loveSongIdList){  //根据获取到的id列表请求rul获取歌曲全部数据
  var page = that 
  for (var i in loveSongIdList){
    var song_id = loveSongIdList[i]
    console.log(song_id)
    wx.request({
      url: url,
      method: 'GET',
      data: {
        'method': 'baidu.ting.song.play',
        'songid': song_id
      },
      success:function(res){
        console.log(res.data)
        var song = {
          "show_link": res.data.bitrate.show_link,
          "title": res.data.songinfo.title,
          "author": res.data.songinfo.author,
          "pic": res.data.songinfo.pic_premium,
          "si_proxycompany": res.data.songinfo.si_proxycompany, //传播公司（出品）
          "ting_uid": res.data.songinfo.ting_uid,
          "song_id": res.data.songinfo.song_id,
          "album_title": res.data.songinfo.album_title
        }
        var loveSongList = page.data.loveSongList
        loveSongList.push(song)
        page.setData({ loveSongList: loveSongList})
        app.globalData.loveSongList = loveSongList
        console.log(page.data.loveSongList)
      },
      complete:function(res){
        wx.hideToast()
        
      }
    })
  }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    loveSongIdList: [],
    loveSongList:[],
    latelySongList:[],
    songId: '',
    isPlat: '',
    isLogin:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page=this
    var currentTab=app.globalData.playlistTab
    if (currentTab != '' && currentTab!=null){
      this.setData({ currentTab: currentTab })
      app.globalData.playlistTab=''
    }
    wx.getSystemInfo({  //获取系统屏幕大小
      success: function (res) {
        page.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth
        })
      },
    });
    
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    wx.setNavigationBarTitle({
      title: "我的歌单"           //页面标题
    })
    if (latelySongList !== null && latelySongList != '') {
      this.setData({ latelySongList: latelySongList })
    }

    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName != null) {
      this.setData({ isLogin: true })
    }
    getLoveIDList(this)
  },
  switchNav(e) {
    var id = e.currentTarget.id;
    this.setData({
      currentTab: id
    })
  },
  swiperChange(e) {
    this.setData({
      currentTab: e.detail.current
    })
  },
  audioPlay(e) {   //播放，通过song_id获取音乐src
    var page = this
    var song_id = e.currentTarget.dataset.song_id
    console.log(song_id)
    if (song_id == page.data.songId) {
      myaudio.play()
    } else {
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
          var song_src = res.data.bitrate.show_link
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
  stopPlay(e) {
    myaudio.pause()
    this.setData({ isPlat: false })
    app.globalData.isPlat = false
  },
  cancleLike(e){
    var page=this
    var songId = e.currentTarget.dataset.song_id
    console.log(songId)
    wx.showModal({
      title: '',
      content: '是否取消收藏',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: myurl,
            data:{
              songId: songId,
              code:'2'
            },
            method:'GET',
            header: getApp().globalData.header, //请求头
            success:function(res){
              if (res.data.state==1){      //取消成功
                wx.showToast({
                  title: '已取消',
                  icon:'success',
                  duration:1000
                }) 
                //删除全局中信息
                var loveSongIdList = app.globalData.loveSongIdList
                loveSongIdList.splice(loveSongIdList.indexOf(songId), 1)
                
                app.globalData.loveSongIdList = loveSongIdList
                var loveSongList = app.globalData.loveSongList
                for (var i in loveSongList) {
                  if (loveSongList[i].song_id === songId) {
                    loveSongList.splice(i, 1)
                  }
                }
                app.globalData.loveSongList = loveSongList
                page.setData({ loveSongIdList: loveSongIdList, loveSongList: loveSongList })
              }
            },
            fail:function(res){
              console.log(res.errMsg)
            },
            complete:function(res){
              //page.onLoad()
            }
          })
        }
      }
    })
  },
  gotoLogin(e){
wx.switchTab({
  url: '../me/me',
})
  },
  getAuthorSong(e) {
    var tinguid = e.currentTarget.dataset.author
    wx.navigateTo({
      url: '../songer/songer?tinguid=' + tinguid
    })
  },
  gotoSong(e) {
    var song_id = e.currentTarget.dataset.song_id
    //console.log(song_id)
    wx.navigateTo({
      url: '../song/song?song_id=' + song_id,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
    app.globalData.loveSongList = this.data.loveSongList
    app.globalData.loveSongIdList = this.data.loveSongIdList
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    //getLoveIDList(this)
    var currentTab = app.globalData.playlistTab
    if (currentTab != '' && currentTab != null) {
      this.setData({ currentTab: currentTab })
      app.globalData.playlistTab = ''
    }
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    
    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName != null) {  //以登录
      this.setData({ isLogin: true })
    }else{
      this.setData({ isLogin: false })
    }

    var loveSongList = app.globalData.loveSongList   //获取收藏列表
    if (loveSongList.length != 0 ) {
      this.setData({ loveSongList: loveSongList })
      if (this.data.isLogin==='') {
        this.onLoad()
      }
    }

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
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
const myurl = 'http://localhost:8088/DD_Music/SaveLike'
// const myaudio = wx.createInnerAudioContext()
var app = getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList

var getLoveSongList = function(loveSongIdList) { //根据获取到的id列表请求rul获取歌曲全部数据
  for (var i in loveSongIdList)
    var song_id = loveSongIdList[i]
  wx.request({
    url: url,
    method: 'GET',
    data: {
      'method': 'baidu.ting.song.play',
      'songid': song_id
    },
    success: function(res) {
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
      var loveSongList = app.globalData.loveSongList
      loveSongList.push(song)
      app.globalData.loveSongList = loveSongList
    }
  })
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: 0,
    winWidth: 0,
    tinguid: '',
    songerInfo: {},
    songerSong: [],
    limits: '20',
    havemore: 1,
    songs_total: 0, //歌曲
    albums_total: 0, //专辑
    mv_total: 0, //mv  
    currentTab: 0,
    songId: '',
    isPlat: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var page = this
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    this.setData({
      tinguid: options.tinguid
    })
    this.getAuthorInfo()
    wx.getSystemInfo({ //获取系统屏幕大小
      success: function(res) {
        page.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth
        })
      },
    });
  },
  getAuthorInfo(e) {
    var page = this
    var tinguid = page.data.tinguid
    var limits = page.data.limits
    if (page.data.havemore == 1) {
      wx.request({
        url: url,
        method: 'GET',
        data: {
          'method': 'baidu.ting.artist.getSongList',
          //'tinguid': tinguid,
          'tinguid': tinguid,
          'limits': limits, //返回条目数量
          'use_cluster': '1',
          'order': '2'
        },
        success: function(res) {
          console.log("歌手的歌曲信息：")
          console.log(res.data)
          limits = parseInt(limits) + 10
          page.setData({
            songerSong: res.data.songlist,
            havemore: res.data.havemore,
            limits: limits
          })
        },
        complete: function(res) {
          wx.hideToast()
        }
      })
      wx.request({
        url: url,
        method: 'GET',
        data: {
          'method': 'baidu.ting.artist.getInfo',
          'tinguid': tinguid
        },
        success: function(res) {
          console.log("歌手信息")
          console.log(res.data)
          page.setData({
            songerInfo: res.data,
            songs_total: res.data.songs_total,
            albums_total: res.data.albums_total,
            mv_total: res.data.mv_total
          })
          wx.setNavigationBarTitle({
            title: res.data.name //页面标题
          })
        }
      })
    }
  },
  
  audioPlay(e) { //播放，通过song_id获取音乐src
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
        success: function(res) {
          app.globalData.song_id = song_id
          app.globalData.isPlat = true
          console.log(res.data)
          var songinfo = res.data.songinfo
          var song_src = res.data.bitrate.show_link
          if (myaudio.src == song_src) { //同一首歌
            console.log("同一首歌")
          } else {
            console.log("新歌")
            myaudio.src = song_src
            var temp_x = 0
            latelySongList.forEach(data => {
              if (data.song_id === songinfo.song_id) {
                console.log("已在缓存中")
                temp_x = 1
              }
            })
            if (latelySongList == null || latelySongList == '' || temp_x == 0) {
              console.log("没在缓存中")
              latelySongList.push(songinfo)
              app.globalData.latelySongList = latelySongList
              wx.setStorageSync("latelySongList", latelySongList) //用户最近播放同步加入本地缓存
            }

          }
          page.setData({
            songId: song_id
          })
        },
        complete: function(res) {
          myaudio.play()
        }
      })
    }
    this.setData({ isPlat: true })
    app.globalData.isPlat = true
  },
  stopPlay(e) {
    myaudio.pause()
    this.setData({
      isPlat: false
    })
    app.globalData.isPlat = false
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log(app.globalData.isPlat)
    this.setData({
      isPlat: app.globalData.isPlat
    })
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
  /**
   * 生命周期函数--监听页面显示
   */
  gotoSong(e) {
    var song_id = e.currentTarget.dataset.song_id
    //console.log(song_id)
    wx.navigateTo({
      url: '../song/song?song_id=' + song_id,
    })
  },

  onShow: function() {
    console.log("songer.js onshow")
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('碰底啦')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  doGetMore(e) {
    console.log('碰底啦')
    var that = this;
    loadMore(that);
  }
})
var loadMore = function(that) {
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 10000
  })
  that.getAuthorInfo()
}
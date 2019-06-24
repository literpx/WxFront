// pages/latelyPlay/latelyPlay.js
const myaudio = wx.createInnerAudioContext()
const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
var app = getApp()
var latelySongList = app.globalData.latelySongList


Page({

  /**
   * 页面的初始数据
   */
  data: {
    songList:[],
    songId:'',
    isPlat: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    wx.setNavigationBarTitle({
      title: "最近播放"           //页面标题
    })
    if (latelySongList !== null && latelySongList!=''){
      this.setData({ songList: latelySongList})
    }
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
    page.setData({ isPlat: true })
  },
  stopPlay(e) {
    myaudio.pause()
    this.setData({ isPlat: false })
    app.globalData.isPlat = false
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
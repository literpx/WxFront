const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
var app = getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList
const myurl = 'http://localhost:8088/DD_Music/SaveLike'

var getShareList = function(that) {
  wx.showToast({
    title: '',
    icon: 'loading',
    duration: 10000
  })
  wx.request({
    url: myurl,
    data: {
      code: '4',
    },
    header: getApp().globalData.header, //请求头
    method: 'GET',
    success: function(res) {
      var shareList = res.data
      for (let i in shareList) {
        (function() {
          wx.request({
            url: url,
            method: 'GET',
            data: {
              'method': 'baidu.ting.song.play',
              'songid': shareList[i].song_id
            },
            success: function(res) {
              shareList[i].show_link = res.data.bitrate.show_link //播放连接
              shareList[i].title = res.data.songinfo.title
              shareList[i].author = res.data.songinfo.author
              shareList[i].pic_radio = res.data.songinfo.pic_radio
              shareList[i].ting_uid = res.data.songinfo.ting_uid
              that.setData({
                shareList: shareList
              })
            }
          })
        })(i)
      }
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    songId: '',
    isPlat: '',
    shareList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    getShareList(this)
  },
  gotoSong(e) {
    var song_id = e.currentTarget.dataset.song_id
    //console.log(song_id)
    wx.navigateTo({
      url: '../song/song?song_id=' + song_id,
    })
  },
  getAuthorSong(e) {
    var tinguid = e.currentTarget.dataset.author
    wx.navigateTo({
      url: '../songer/songer?tinguid=' + tinguid
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
          var songinfo = res.data.songinfo
          var song_src = res.data.bitrate.show_link
          songinfo.song_src = song_src       //存入最近播放目录
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
  stopPlay(e) {
    console.log(myaudio.duration)
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
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    getShareList(this)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
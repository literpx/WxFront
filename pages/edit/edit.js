// pages/edit/edit.js
const myurl = 'http://localhost:8088/DD_Music/SaveLike'
var app = getApp()
var latelySongList = app.globalData.latelySongList

Page({

  /**
   * 页面的初始数据
   */
  data: {
    songInfo:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    var song_id = options.song_id
    console.log(song_id)
    var songInfo={}
    latelySongList.forEach(data => {
      if (data.song_id === song_id) {
        songInfo.song_id=song_id
        songInfo.pic = data.pic_radio
        songInfo.author = data.author
        songInfo.title = data.title
        that.setData({ songInfo: songInfo })
      }
    })
   
    wx.setNavigationBarTitle({
      title: "发表主题"           //页面标题
    })
  },
  sendShare(e){
    var content=e.detail.value.content
    //console.log(content)
    var song_id = this.data.songInfo.song_id
    wx.request({
      url: myurl,
      data: {
        songId: song_id,
        code: '3',
        content: content
      },
      method: 'GET',
      header: getApp().globalData.header, //请求头
      success: function (res) {
        if (res.data.state == 1) {
          // var arry = app.globalData.loveSongIdList
          // arry.push(song_id)
          // app.globalData.loveSongIdList = arry

          // var songList = []
          // songList.push(song_id)
          // getLoveSongList(songList)
          // that.setData({ isLove: true })
          wx.showToast({
            title: '发表成功',
            icon:'success',
            duration: 1500,
            success:function(res){
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500)
            } 
          })
          
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
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
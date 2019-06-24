// pages/me/me.js
const app = getApp()
Page({
  test(e){
    wx.navigateTo({
      url: '../edit/edit',
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    isLogin:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName!=null) {
      this.setData({ isLogin: true, userInfo: app.globalData.userInfo })
    }else{
      this.setData({ isLogin: false, userInfo: null })
    }
  },
  changePhone(e) {
    if (this.data.isLogin){
      wx.showModal({
        title: '手机绑定',
        content: '是否要绑定或更换手机绑定？',
        success:function(res){
          if(res.confirm)
          wx.navigateTo({
            url: '../login/login',
          })
        }
      })
    }else{
      wx.showModal({
        title: '请先登录',
        content: '',
        showCancel:false,
      })
    }
    
  },
  onGotUserInfo: function (e) { //一键登录
    var page=this
    var userInfo = e.detail.userInfo
    console.log(userInfo)
    console.log("userInfo.nickName:"+userInfo.nickName)
    if (userInfo.nickName!=null){
      var name = userInfo.nickName
      var avatarUrl= userInfo.avatarUrl
      app.globalData.userInfo.nickName = userInfo.nickName
      app.globalData.userInfo.avatarUrl = userInfo.avatarUrl
    }
    
    wx.login({
      success: function (res) {
        var code = res.code;
        if (code) {
          //console.log('获取用户登录凭证：' + code);
          wx.showToast({
            title: '登录中',
            icon: 'loading',
            duration: 99999
          })

          wx.request({
            url: 'http://localhost:8088/DD_Music/DdLogin',
            data: {
              code: code,
              name: name,
              avatarUrl: avatarUrl
            },
            header: getApp().globalData.header, //请求时带上这个请求头
            success: function (res) {
              wx.hideToast();
              var data=res.data
              console.log(res.data)  
              if(res.statusCode==200){
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1000,
                  success: function (res) {
                    app.globalData.userInfo.phone =data.phone
                    app.globalData.header.Cookie =  data.unionId;
                    wx.setStorageSync("userInfo", app.globalData.userInfo) //用户信息同步加入本地缓存
                    wx.setStorageSync("header",data.unionId) //用户信息同步加入本地缓存
                    page.onLoad();
                  }
                })
              }else{
                wx.showToast({
                  title: '登录失败',
                  duration: 1000,
                  success: function (res) {
                    app.globalData.userInfo.nickName = null
                    app.globalData.userInfo.avatarUrl = null
                    page.onLoad();
                  }
                })
              }
            },
            fail: function (err) {
              console.log("登录失败，错误信息：" + err.errMsg)
            }
          })
        } else {
          console.log('获取用户登录态失败：' + res.errMsg);
        }
      }
    })
  },
  exitLogin(e) {  //退出登录
    var page=this
    wx.showModal({
      title: '确定要退出吗',
      content: '',
      success:function(res){
        var userInfo={
          nickName: null,
          avatarUrl: null,
          phone: null
        }
        app.globalData.userInfo = userInfo;
        wx.removeStorageSync("userInfo")
        wx.removeStorageSync("header")
        wx.showToast({
          title: '已退出',
          icon: 'success',
          duration: 1000,
          success: function (res) {
            page.onLoad();
          }
        })
      },   
    })  
  },
  goToLately(e){
    app.globalData.playlistTab='1'
      wx.switchTab({
        url: '../playlist/playlist',
      })
  },
  goLove(e){
    app.globalData.playlistTab = '0'
    wx.switchTab({
      url: '../playlist/playlist',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName != null) {
      this.setData({ isLogin: true, userInfo: app.globalData.userInfo })
    } else {
      this.setData({ isLogin: false, userInfo: null })
    }
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
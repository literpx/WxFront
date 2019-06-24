// pages/login/login.js
const app = getApp()
Page({
  data: {
    disabled:false,
    disabled: true,
    tip: '发送验证码',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  sendCode(e) {
    var that = this;
    if (!that.data.disabled1) {
      that.setData({
        disabled1: true
      })
      var second = 60
      var timer = setInterval(function() {
        second--;
        that.setData({
          tip: '重新获取' + second + 's'
        })

        if (second == 0) {
          clearInterval(timer);
          that.setData({
            tip: '发送验证码',
            disabled1: false
          })
        }
      }, 1000)
    }
  },
  checkPhone(e) {
    var page = this
    var phone = e.detail.value
    if (phone != null && phone != '') {
      page.setData({
        disabled: false
      })
    } else {
      page.setData({
        disabled: true
      })
    }
  },
  login(e) { //手机号码绑定
    var phone = e.detail.value.phone
    if (phone != null && phone != '') {
      wx.request({
        url: 'http://localhost:8088/DD_Music/DdLogin',
        data: {
          phone: phone,
          uuid: app.globalData.uuid
        },
        header: getApp().globalData.header, //请求时带上这个请求头
        success: function (res) {
          var phone = res.data
          if (res.data != null && res.data!=''){
            wx.showToast({
              title: '绑定成功',
              icon: 'success',
              duration: 2000,
              success: function (res) {
                app.globalData.userInfo.phone = phone
                wx.setStorageSync("userInfo", app.globalData.userInfo) //用户信息同步加入本地缓存
              },complete:function(res){
                setTimeout(function () {
                  wx.switchTab({
                    url: '../me/me',
                  })
                }, 2000) 
              }
            })
          }
          
        },
        fail:function(err){
          console.log("登录失败，错误信息："+err.errMsg) 
        }
      })
    }

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
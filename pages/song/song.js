// pages/song/songe.js
const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
const myurl = 'http://localhost:8088/DD_Music/SaveLike'
var app = getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList

// Array.prototype.remove = function (val) {
//   var index = this.indexOf(val);
//   if (index > -1) {
//     this.splice(index, 1);
//   }
// };

var checkIsLove=function(that,songId){
  console.log("checkIsLove----"+songId)
  
  var loveSongIdList = app.globalData.loveSongIdList
  console.log("checkIsLove----" + loveSongIdList)
  if (loveSongIdList.lenght == 0 || loveSongIdList==null){
    wx.request({
      url: myurl,
      data: {
        code: '1',
      },
      header: getApp().globalData.header, //请求头
      method: 'GET',
      success: function (res) {
        //console.log(res.data)
        that.setData({ loveSongIdList: res.data })
        app.globalData.loveSongIdList = res.data
        loveSongIdList = res.data
      },
      fail: function (res) {
        console.log(res.errMsg)
      },
      complete: function (res) {

        // //console.log("12346789")
        // var loveSongIdList = that.data.loveSongIdList
        // getLoveSongList(page, loveSongIdList)
      }
    })
  }
  if (loveSongIdList.indexOf(songId)!=-1){
    that.setData({ isLove:true})
  }
}

var getLoveSongList = function (loveSongIdList) { //根据获取到的id列表请求rul获取歌曲全部数据
  for (var i in loveSongIdList)
    var song_id = loveSongIdList[i]
  wx.request({
    url: url,
    method: 'GET',
    data: {
      'method': 'baidu.ting.song.play',
      'songid': song_id
    },
    success: function (res) {
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
var initMyaudio=function(that){
  myaudio.onCanplay(() => {
    myaudio.duration;
    // 必须。不然也获取不到时长
    setTimeout(() => {
      var duration = parseInt(myaudio.duration)
      app.globalData.song_total = duration
      that.setData({ total: duration })
      duration = parseInt(duration / 60) + ':' + duration % 60
      var sp_duration = duration.split(':')
      var duration_str = ''
      if (parseInt(sp_duration[0]) <= 9) {
        duration_str = '0' + sp_duration[0] + ':'
      } else {
        duration_str = sp_duration[0] + ':'
      }
      if (parseInt(sp_duration[1]) <= 9) {
        duration_str += '0' + sp_duration[1]
      } else {
        duration_str += sp_duration[1]
      }
      that.setData({ duration: duration_str })
      app.globalData.duration_str = duration_str
    }, 1000)
  })

  myaudio.onTimeUpdate(() => {
    var currentTime = parseInt(myaudio.currentTime)
    var slider_value = parseInt(currentTime / parseInt(that.data.total) * 100)
    that.setData({ slider_value: slider_value })
    currentTime = parseInt(currentTime / 60) + ':' + currentTime % 60
    var sp_currentTime = currentTime.split(':')
    var currentTime_str = ''
    if (parseInt(sp_currentTime[0]) <= 9) {
      currentTime_str = '0' + sp_currentTime[0] + ':'
    } else {
      currentTime_str = sp_currentTime[0] + ':'
    }
    if (parseInt(sp_currentTime[1]) <= 9) {
      currentTime_str += '0' + sp_currentTime[1]
    } else {
      currentTime_str += sp_currentTime[1]
    }
    that.setData({ currentTime: currentTime_str })
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    song_id:'',
    songinfo:null,
    isPlat:false,
    duration:'',
    currentTime:'',
    slider_value:'',
    total:'',
    isLove:false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var song_id = options.song_id
    if (song_id === app.globalData.song_id){
      this.setData({
        song_id: song_id,
        total: app.globalData.song_total,
        duration: app.globalData.duration_str
      })
    }else{
      this.setData({
        song_id: song_id
      })
    }
    
    checkIsLove(this, song_id)
    //console.log(myaudio.src)
      this.audioPlay()
      initMyaudio(this)  
      
    
  },
  progressChange(e){
    var progress = e.detail.value
    progress = parseInt(parseInt(progress) / 100 * parseInt(this.data.total))
    myaudio.seek(progress)
  },
  audioPlay(e) {   //播放，通过song_id获取音乐src
    var page = this
    var song_id = this.data.song_id
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
          page.setData({ songinfo: songinfo})
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

          //检测
          var old_src = myaudio.src.split('?')[0]
          var new_src = song_src.split('?')[0]
          if (old_src === new_src) {   //同一首歌
            console.log("同一首歌")
          } else {
            console.log("旧歌" + myaudio.src)
            console.log("新歌" + song_src)
            myaudio.src = song_src
            myaudio.play()
          }
          page.setData({ songId: song_id })
          
        },
        complete: function (res) {
    
        }
      })
    }
    this.setData({ isPlat: true })
    app.globalData.isPlat = true
  },
  stopPlay(e) {
    console.log(myaudio.duration)
    myaudio.pause()
    this.setData({ isPlat: false })
    app.globalData.isPlat = false
  },
  saveLike(e) {
    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName != null) {
      var that = this
      var song_id = e.currentTarget.dataset.song_id
      console.log(song_id)
      wx.showModal({
        title: '',
        content: '是否加入收藏歌单？',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: myurl,
              data: {
                songId: song_id,
                code: '0'
              },
              method: 'GET',
              header: getApp().globalData.header, //请求头
              success: function (res) {
                if (res.data.state == 1) {
                  var arry = app.globalData.loveSongIdList
                  arry.push(song_id)
                  app.globalData.loveSongIdList = arry

                  var songList = []
                  songList.push(song_id)
                  getLoveSongList(songList)
                  that.setData({ isLove: true })
                }
              },
              fail: function (res) {
                console.log(res.errMsg)
              }
            })
          }
        }
      })
    }else{
      wx.showModal({
        title: '',
        content: '请先登录',
        success:function(res){
          if(res.confirm){
            wx.switchTab({
              url: '../me/me',
            })
          }
        }
      })
    }
    
  },
  cancleLike(e) {
    var page = this
    var songId = e.currentTarget.dataset.song_id
    console.log(songId)
    wx.showModal({
      title: '',
      content: '是否取消收藏',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: myurl,
            data: {
              songId: songId,
              code: '2'
            },
            method: 'GET',
            header: getApp().globalData.header, //请求头
            success: function (res) {
              if (res.data.state == 1) {      //取消成功
                wx.showToast({
                  title: '已取消',
                  icon: 'success',
                  duration: 1000
                })
                var loveSongIdList = app.globalData.loveSongIdList
                loveSongIdList.splice(loveSongIdList.indexOf(songId),1)
                app.globalData.loveSongIdList = loveSongIdList
                var loveSongList = app.globalData.loveSongList
                for (var i in loveSongList){
                  if (loveSongList[i].song_id === songId){
                    loveSongList.splice(i,1)
                  }
                }
                app.globalData.loveSongList = loveSongList
                page.setData({ isLove: false })
              }
            },
            fail: function (res) {
              console.log(res.errMsg)
            },
            complete: function (res) {
              //page.onLoad()
            }
          })
        }
      }
    })
  },
  share(e){
    if (app.globalData.userInfo != null && app.globalData.userInfo.nickName != null) {
      var song_id = this.data.song_id
      wx.navigateTo({
        url: '../edit/edit?song_id=' + song_id,
      })
    } else {
      wx.showModal({
        title: '',
        content: '请先登录',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../me/me',
            })
          }
        }
      })
    }
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
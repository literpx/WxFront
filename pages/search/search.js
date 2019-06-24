// pages/search/search.js
// const myaudio = wx.createInnerAudioContext()
const url = 'http://tingapi.ting.baidu.com/v1/restserver/ting'
const myurl = 'http://localhost:8088/DD_Music/SaveLike'
var app = getApp()
const myaudio = app.myaudio
var latelySongList = app.globalData.latelySongList

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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '周杰伦',
    currentTab: '0',
    winHeight: 0,
    winWidth: 0,
    error_code: '',
    album: '', //专辑
    artist: '', //歌手
    song: '', //歌曲
    songId: '',
    songerInfoList: '',
    isPlat: ''
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this
    var searchText = options.searchText
    this.setData({
      isPlat: app.globalData.isPlat,
      songId: app.globalData.song_id ? app.globalData.song_id : '',
    })
    page.setData({ searchText: searchText })
    //console.log(searchText)
    wx.getSystemInfo({ //获取系统屏幕大小
      success: function (res) {
        page.setData({
          winHeight: res.windowHeight,
          winWidth: res.windowWidth
        })
      },
    });
    wx.request({
      url: url,
      method: 'GET',
      data: {
        'method': 'baidu.ting.search.catalogSug',
        'query': page.data.searchText
      },
      success: function (res) {
        var error_code = res.data.error_code
        if (error_code == 22001) {
          page.setData({
            error_code: error_code
          })
        } else if (error_code == 22000) {
          var album = res.data.album //专辑
          var artist = res.data.artist //歌手
          var song = res.data.song //歌曲
          console.log(res.data)
          page.setData({
            album: album,
            artist: artist,
            song: song,
            error_code: error_code
          })
        }
        page.getAuthorInfo()
      }
    })

  },
  getAuthorInfo(e) {
    var page = this
    var artist = page.data.artist
    var tinguid = ''
    var artistpic = ''
    var songerInfo = {}
    var songerInfoList = []
    for (var index in artist) {
      tinguid = artist[index].artistid
      artistpic = artist[index].artistpic
      wx.request({
        url: url,
        method: 'GET',
        data: {
          'method': 'baidu.ting.artist.getInfo',
          'tinguid': tinguid
        },
        success: function (res) {
          songerInfo = {
            "artistid": res.data.ting_uid,
            "artistname": res.data.name,
            "artistpic": res.data.avatar_middle,
            "songs_total": res.data.songs_total ? res.data.songs_total : '0',               //单曲量
            "albums_total": res.data.albums_total ? res.data.albums_total : '0',          //专辑量
            "mv_total": res.data.mv_total ? res.data.mv_total : '0'       //MV量
          }
          songerInfoList.push(songerInfo)
          if (index < artist.length - 1) {
            console.log("66666666666666")
          }
          else if (songerInfoList != null) {
            page.setData({
              songerInfoList: songerInfoList
            })
          }
        }
      })
    }
  },
  goToSonger(e) {
    var tinguid = e.currentTarget.dataset.tinguid
    console.log(tinguid)
    wx.navigateTo({
      url: '../songer/songer?tinguid=' + tinguid,
    })
  },
  //搜索功能
  getSearchText(e) {
    this.setData({
      searchText: e.detail.value
    })
  },
  doSearch(e) {
    var page = this
    var searchText = this.data.searchText
    wx.request({
      url: url,
      method: 'GET',
      data: {
        'method': 'baidu.ting.search.catalogSug',
        'query': page.data.searchText
      },
      success: function (res) {
        var error_code = res.data.error_code
        if (error_code == 22001) {
          page.setData({
            error_code: error_code
          })
        } else if (error_code == 22000) {
          var album = res.data.album //专辑
          var artist = res.data.artist //歌手
          var song = res.data.song //歌曲
          console.log(res.data)
          page.setData({
            album: album,
            artist: artist,
            song: song,
            error_code: error_code
          })
        }
        page.getAuthorInfo()
      }
    })
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
        success: function (res) {
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
              wx.setStorageSync("latelySongList", latelySongList)     //用户最近播放同步加入本地缓存
            }

          }
          page.setData({
            songId: song_id
          })
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
    this.setData({
      isPlat: false
    })
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
  saveLike(e) {
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
                var songList = []
                songList.push(song_id)
                getLoveSongList(songList)
              }
            },
            fail: function (res) {
              console.log(res.errMsg)
            }
          })
        }
      }
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
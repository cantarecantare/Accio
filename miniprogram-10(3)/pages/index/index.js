//index.js
//获取应用实例
const app = getApp()

Page({
  box1:function(){
    wx.navigateTo({
    url: '/pages/box1/box1'
  })
  },
  box2:function(){
    wx.navigateTo({
    url: '/pages/box2/box2'
  })
  },
  nav:function(){
    wx.navigateTo({
    url: '/pages/search/search'
  })
}
   })
  


// pages/box1net/box1net.js

//var myCharts = require("../../../utils/wxcharts.js")//引入一个绘图的插件

//与OneNET建立连接
const devicesId = "643857634"
const api_key = "d0APLNB1NiukLutCOxDPhq=kBGc="
 
Page({


  send:function(){
    var that=this
  },
  getDataFromOneNET:function(){
    const requestTask=wx.request({
      url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=Lasor,Press&limit=20`,
      header: {
        'content-type': 'application/json',
        'api-key': api_key
      },
      success:function(res){
        console.log(res.data)
        const status = res.statusCode
        const response = res.data
        if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
          reject(res.data)
          return ;
        }
        if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
          reject(response.error)
          return ;
        }

        if (response.data.datastreams.length === 0) {
          reject("当前设备无数据, 请先运行硬件实验")
        }

        //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
        resolve({
          Lasor: response.data.datastreams[0].datapoints.reverse(),
          Press: response.data.datastreams[1].datapoints.reverse()
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  },
  data: {
    showform:''
  },
  formSubmit: function (e) {
    　　console.log('form发生了submit事件，携带数据为：', e.detail.value)
    　　this.setData({
    　　　showform: 
    　　　`form发生了submit事件，携带数据为：
    　　　Press:${Press}
    　　　Lasor: ${ Lasor }`
    　　})
    　},
    　formReset: function () {
    　　console.log('form发生了reset事件')
    　　this.setData({
    　　　showform: "form发生了reset事件"
    　　})
    　},
  //下拉页面刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: "正在获取"
    })
    this.getDatapoints().then(datapoints => {
      this.update(datapoints)
      wx.hideLoading()
    }).catch((error) => {
      wx.hideLoading()
      console.error(error)
    })
  },

  //页面加载生命周期
  onLoad: function () {
    console.log(`your deviceId: ${devicesId}, apiKey: ${api_key}`)

    //每0.5s自动获取一次数据进行更新
    const timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
        this.update(datapoints)
      })
    }, 5000)

    wx.showLoading({
      title: '加载中'
    })

    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()
      //this.firstDraw(datapoints)
    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer) //首次渲染发生错误时禁止自动刷新
    })
  },

  /**
   * 向OneNet请求当前设备的数据点
   * @returns Promise
   */
  getDatapoints: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=Lasor,Press&limit=20`,
        /**
         * 添加HTTP报文的请求头, 
         * 其中api-key为OneNet的api文档要求我们添加的鉴权秘钥
         * Content-Type的作用是标识请求体的格式, 从api文档中我们读到请求体是json格式的
         * 故content-type属性应设置为application/json
         */
        header: {
          'content-type': 'application/json',
          'api-key': api_key
        },
        data:{
          token:this.data.token,
        },
        success:function(res){
          console.log(res.data)
          const status = res.statusCode
          const response = res.data
          if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
            reject(res.data)
            return ;
          }
          if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
            reject(response.error)
            return ;
          }

          if (response.data.datastreams.length === 0) {
            reject("当前设备无数据, 请先运行硬件实验")
          }

          //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
          resolve({
            Lasor: response.data.datastreams[0].datapoints.reverse(),
            Press: response.data.datastreams[1].datapoints.reverse()
          })
          /*this.Light({
            Lasor:res.data.data
          }),
          this.Press({
            Press:res.data.data
          })*/
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入获取到的数据点, 函数自动更新图标
   */
  update: function (datapoints) {
    const array = this.convert(datapoints);
    var press=array.Press;
    var light=array.Lasor;

    /*if (press==0 && light==1) {
      this.setData({
        n:1
      })
    }

    this.lineChart_hum.updateData({
      categories: wheatherData.categories,
      series: [{
        name: 'Press',
        data: wheatherData.Press,
        format: (val, name) => val.toFixed(2)
      }],
    })

    this.lineChart_tempe.updateData({
      categories: wheatherData.categories,
      series: [{
        name: 'tempe',
        data: wheatherData.tempe,
        format: (val, name) => val.toFixed(2)
      }],
    })*/

  },

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 返回使用于图表的数据格式
   */
   convert: function (datapoints) {
    var categories = [];
    var Press = [];
    var Lasor = [];

    var length = datapoints.Press.length
    for (var i = 0; i < length; i++) {
      categories.push(datapoints.Press[i].at.slice(5, 19));
      Press.push(datapoints.Press[i].value);
      Lasor.push(datapoints.Lasor[i].value);
    }
    return {
      categories: categories,
      Press: Press,
      Lasor:Lasor
    }
  },

  //增加新物品框函数
  addNewPrice: function() {
    let newArray = {
      Price_Name: "",
      NumLimit: "",
      Price: ""
    }
    this.setData({
      addPrice: this.data.addPrice.concat(newArray)
    })
},
/****删除*/
deletePrice: function(e) {
  let that = this
  let index = e.target.dataset.index //数组下标
  let arrayLength = that.data.addPrice.length //数组长度
  let newArray = []
  if (arrayLength > 1) {
    //数组长度>1 才能删除
    for (let i = 0; i < arrayLength; i++) {
      if (i !== index) {
        newArray.push(that.data.addPrice[i])
      }
    }
    that.setData({
      addPrice: newArray
    })
  } else {
    wx.showToast({
      icon: 'none',
      title: '必须设置一个收费项目',
    })
  }
},


/**获取输入框信息**/
setInputValue: function(e) {
  let index = e.target.dataset.index //数组下标
  let tag = e.target.dataset.tag  //字段名称
  let array = this.data.addPrice;
  array[index][tag] = e.detail.value  //赋值
  this.setData({
    addPrice: array
  })
},

net:function(){
  wx.navigateTo({
  url: '/pages/box1net/box1net'
})
},

  /**
   * 
   * @param {Object[]} datapoints 从OneNet云平台上获取到的数据点
   * 传入数据点, 函数将进行图表的初始化渲染
   */
  /*firstDraw: function (datapoints) {

    //得到屏幕宽度
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var wheatherData = this.convert(datapoints);

    //新建湿度图表
    this.lineChart_hum = new myCharts({
      canvasId: 'Press',
      type: 'line',
      categories: wheatherData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'Press',
        data: wheatherData.Press,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'Press (%)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

    //新建温度图表
    this.lineChart_tempe = new myCharts({
      canvasId: 'tempe',
      type: 'line',
      categories: wheatherData.categories,
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: 'Lasor',
        data: wheatherData.tempe,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: 'Lasor (摄氏度)',
        format: function (val) {
          return val.toFixed(2);
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },*/
})
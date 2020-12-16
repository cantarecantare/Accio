// pages/box1/box1.js

Page({
  data:{
    //初始化数组
     addPrice: [{
          Price_Name: "",
        }],
    },
     
    /**新增** */
      addNewPrice: function() {
        let newArray = {
          Price_Name: "",
          //NumLimit: "",
          //Price: ""
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
          //弹出确认消息
          wx.showModal({
            title: '提示',
            content: '确认删除？',
            success: function(res) {
                if (res.confirm) {
                console.log('用户点击确定')
          for (let i = 0; i < arrayLength; i++) {
            if (i !== index) {
              newArray.push(that.data.addPrice[i])
            }
          }
          that.setData({
            addPrice: newArray
          })
        }
                 else if (res.cancel) {
                console.log('用户点击取消')
                }
            }
        })
        } else {
          wx.showToast({
            icon: 'none',
            title: '数据清空',
          })
        }
      },

      showok:function() {
        
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

})
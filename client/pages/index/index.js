import util from '/util/huawei';
const app= getApp();
Page({
  data: {
    systemInfo: {} ,// 手机基础信息
    userInfo:{},
    userLogin:false,
    ueerNotLogin:true,
    cardInfo:{},
    SERVER_URL : "https://online.sptcc.com:8445/",
    color1:"#ffffff",
    color2:"#ffffff",
    color3:"#ffffff",
    color4:"#ffffff",
    color5:"#ffffff",
    color6:"#ffffff",
    text_color1:"#18BB99",
    text_color2:"#18BB99",
    text_color3:"#18BB99",
    text_color4:"#18BB99",
    text_color5:"#18BB99",
    text_color6:"#18BB99",
    amount:"0.00"
  },
  onLoad(options) {
    try {
      // 获取手机基础信息(头状态栏和标题栏高度)
      //let systemInfo = my.getSystemInfoSync();
      let systemInfo=app.systemInfo;
      this.setData({ systemInfo });
      app.model=systemInfo.model;
      console.log(systemInfo.model);
    } catch (e) {
      console.log(e);
      my.alert({
        title: '温馨提示',
        content: 'onLoad 执行异常'
      });
    }

    var token=app.userInfo.token;
    if(token!=""){
        console.log("已获取用户信息")
      
    }else{
      this.getUserInfo();
    

    }


  },
  getUserInfo(){
    var that = this;
    app.log('getAuth--start');
      my.showLoading({
        content: '查询中',
      });
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        if(res.authCode){
          app.log(res.authCode);
          var code=res.authCode;         
          this.getHttpUserInfo(code);
          

        }

      },
      fail: (res) => {
          app.log('getAuth--failed:' +  JSON.stringify(res));
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
          my.confirm({
            title: '提示',
            content: '网络不流畅，请稍后重试！',
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            complete: (e) => {
              if(e.confirm){
                that.getUserInfo();    
                return;
              }else{
                //my.navigateBack({ delta: 1});
                return;
              }
            },
          });
      },
    });
  },
  /**
   * 点击手机标题栏触发的事件,需要在index.json配置titlePenetrate:"YES"
   * @method onTitleBar
   */
  onTitleBar(e) {
    /*my.alert({
      title: '温馨提示',
      content: '您点击了"我是手机标题栏"'
    });*/
  },
  onsetmoney(e){
      console.log(e.target.dataset.money);
      var money=e.target.dataset.money;            
      app.orderReq.total_fee=money*100+2000;
      app.orderReq.TOTAMT=money*100+2000;
      var amount=parseFloat(money).toFixed(2);
      this.setData({
        amount:amount
      })

      this.setData({
          color1:"#ffffff",
          color2:"#ffffff",
          color3:"#ffffff",
          color4:"#ffffff",
          color5:"#ffffff",
          color6:"#ffffff",
          text_color1:"#18BB99",
          text_color2:"#18BB99",
          text_color3:"#18BB99",
          text_color4:"#18BB99",
          text_color5:"#18BB99",
          text_color6:"#18BB99",
      });

 
      if(money=="10"){
        this.setData({
          color1:"#06B794",
          text_color1:"#ffffff"
        });
      }else if(money=="20"){
        this.setData({
          color2:"#06B794",
          text_color2:"#ffffff"
        });

      }else if(money=="30"){
        this.setData({
          color3:"#06B794",
          text_color3:"#ffffff"
        });

      }else if(money=="100"){
        this.setData({
          color4:"#06B794",
          text_color4:"#ffffff"
        });

      }else if(money=="200"){
        this.setData({
          color5:"#06B794",
          text_color5:"#ffffff"
        });

      }else if(money=="500"){
        this.setData({
          color6:"#06B794",
          text_color6:"#ffffff"
        });

      }

      
      
  },





  getHttpUserInfo(code){
    var that = this;


    var url = app.SERVER_URL
					+ "handapp_app/AlipayCommRegisterServlet?";
    url=url+"code="+code;
    app.log(url);
    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {
        my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
        if(resp.data.result_code=="success"){
          app.userInfo.phone=resp.data.phone;
          app.userInfo.token=resp.data.note;
          app.userInfo.buyId=resp.data.buyId;

        }
        
        app.log('resp data'+resp.data); 


        
      },
      fail: (res) => {
          app.log('HttpUserInfo--failed:' +  JSON.stringify(res));
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
          my.confirm({
            title: '提示',
            content: '网络不流畅，请稍后重试！',
            confirmButtonText: '重试',
            cancelButtonText: '取消',
            complete: (e) => {
              if(e.confirm){
                that.getUserInfo();    
                return;
              }else{
                //my.navigateBack({ delta: 1});
                return;
              }
            },
          });
      },

    });



  },
  getOrderData(url){

    my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        app.log('resp data:'+resp.data);

        if(resp.data.return_code=="success"){
          app.orderResq.orderId=resp.data.return_msg.orderId;
          app.orderResq.qorderId=resp.data.return_msg.QorderId;
          app.orderResq.partnerid=resp.data.return_msg.partnerid;
          app.orderResq.content=resp.data.return_msg.content;
          app.cplc=app.getCplc();
          app.seid=app.getHuaWeiSeid();
          
          this.goPay();

        } 
        
      },
      fail: (err) => {
          my.hideLoading({
            page: that,  // 防止执行时已经切换到其它页面，page 指向不准确
          });
          my.alert({
            title: '提示',
            content:'订单申请失败' 
          });
        app.log(err);

      },

    });

  },
  goPay(){
    my.tradePay({
  
      tradeNO: app.orderResq.content,
      success: (res) => {
        app.log("付款返回"+res.resultCode);
        if(res.resultCode=="9000"){
          var url=app.getCreatCardRequest();
          //var url=app.getRechargeCardOrder();
          app.log(url);
          app.setCreatKeyi(1);
          this.goCreatCard(url);

        }


      },
      fail: (res) => {
        app.log("付款失败"+res.resultCode);



      }
    });
  },
  goCreatCard(url){
      my.request({
      url: url,
      method: 'GET',
      dataType: 'json',
      success: (resp) => {        
        console.log('resp data', resp.data);
        
        /*my.alert({
          title: resp.data.resCode,
          content: resp.data.resDesc, 
        });*/
        if(resp.data.resCode=="9000"){
          console.log("开卡接口成功");
          app.setCreatKeyi(3);
          my.navigateTo({ url: '../creat_card/bind_card/bind_card' })
        }else{
          console.log("充值失败");
          my.alert({
            title: '提示',
            content:'开卡失败' 
          });
          app.setCreatKeyi(2);
        }


        
      },
      fail: (err) => {
        console.log('error', err);
        my.alert({
            title: '提示',
            content:'开卡失败',

          });


      },

    });


  },
  go_bind(){
      //var order_url=app.getOrder("88724922506","0009");
      var order_url=app.getOrder("","0008");
      console.log(order_url);
      this.getOrderData(order_url);
     
  }

});

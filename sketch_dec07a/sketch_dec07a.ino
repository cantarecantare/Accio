//HX711部分
extern unsigned long HX711_Read(void);
extern long Get_Weight();
///变量定义
float Weight = 0;
int HX711_SCK =9;   ///     作为输出口
int HX711_DT= 10;    ///     作为输入口
long HX711_Buffer = 0;
long Weight_Maopi = 0, Weight_Shiwu = 0;
 #define GapValue 405       ///该值需校准 每个传感器都有所不同


//光敏电阻部分
int a =230;


//wifi部分
#include "ESP8266.h"
#include "SoftwareSerial.h"

#define SSID "25"    //填写2.4GHz的WIFI名称，不要使用校园网
#define PASSWORD "ct123456"//填写自己的WIFI密码
#define HOST_NAME "api.heclouds.com"  //API主机名称，连接到OneNET平台，无需修改
#define DEVICE_ID "643857634"       //填写自己的OneNet设备ID
#define HOST_PORT (80)                //API端口，连接到OneNET平台，无需修改
String APIKey = "d0APLNB1NiukLutCOxDPhq=kBGc="; //与设备绑定的APIKey

#define INTERVAL_SENSOR 5000 //定义传感器采样及发送时间间隔


SoftwareSerial mySerial(3, 2);
ESP8266 wifi(mySerial);



void setup()
{  
 //初始化HX711的两个io口       
pinMode(HX711_SCK, OUTPUT);  ///SCK 为输出口 ---输出脉冲
pinMode(HX711_DT, INPUT); ///  DT为输入口  ---读取数据

 Serial.begin(9600);
 Serial.print("Welcome to use!\n");
 delay(1000);    ///延时3秒  
 //获取毛皮重量
 Weight_Maopi = HX711_Read(); 

//wifi初始化
 mySerial.begin(115200); //初始化软串口
  Serial.begin(9600);     //初始化串口
  Serial.print("setup begin\r\n");

  //以下为ESP8266初始化的代码
  Serial.print("FW Version: ");
  Serial.println(wifi.getVersion().c_str());

  if (wifi.setOprToStation()) {
    Serial.print("to station ok\r\n");
  } else {
    Serial.print("to station err\r\n");
  }

  //ESP8266接入WIFI
  if (wifi.joinAP(SSID, PASSWORD)) {
    Serial.print("Join AP success\r\n");
    Serial.print("IP: ");
    Serial.println(wifi.getLocalIP().c_str());
  } else {
    Serial.print("Join AP failure\r\n");
  }

  mySerial.println("AT+UART_CUR=9600,8,1,0,0");
  mySerial.begin(9600);
  Serial.println("setup end\r\n");

}

//wifi模块
unsigned long net_time1 = millis(); //数据上传服务器时间

 float variation=0.000;
 int block;
 
 void loop()    ///  一直循环{}内容  ----- 同while（1）{xxx}
{
  //HX711部分
 Weight = Get_Weight();  //计算放在传感器上的重物重量
 float w=Weight/1000;
 Serial.print(w,3);  //串口显示重量，3意为保留三位小数
 Serial.print(" kg\n"); //显示单位
 Serial.print("\n");  //显示单位
 
 float n1=w-variation;
 variation=w;

 //Serial.print("variation is:");
 //Serial.println(n1,3);
 if(n1>0)
    block=1;
   else
   block=0;
 
 delay(200);  //延时2s 两秒读取一次传感器所受压力

//光敏电阻部分
 int n2 = analogRead(A3);   //读取模拟口A3，获取光强
  //Serial.println(n2);               // 用于IDE串口观察窗
  int light;
    if (n2<= a ) 
  {
    //Serial.println("light");       
    light=0;               
  }
  else
  {
    //Serial.println("no light");
    light=1;                      
  }
  delay(200);


  //wifi上传
  if (wifi.createTCP(HOST_NAME, HOST_PORT)) { //建立TCP连接，如果失败，不能发送该数据
      Serial.print("create tcp ok\r\n");
      char buf[10];
      //拼接发送data字段字符串
      String jsonToSend = "{\"Lasor\":";
      dtostrf(light, 1, 2, buf);
      jsonToSend += "\"" + String(buf) + "\"";
      jsonToSend += ",\"Press\":";
      dtostrf(block, 1, 2, buf);
      jsonToSend += "\"" + String(buf) + "\"";
      jsonToSend += "}";


     //拼接POST请求字符串
      String postString = "POST /devices/";
      postString += DEVICE_ID;
      postString += "/datapoints?type=3 HTTP/1.1";
      postString += "\r\n";
      postString += "api-key:";
      postString += APIKey;
      postString += "\r\n";
      postString += "Host:api.heclouds.com\r\n";
      postString += "Connection:close\r\n";
      postString += "Content-Length:";
      postString += jsonToSend.length();
      postString += "\r\n";
      postString += "\r\n";
      postString += jsonToSend;
      postString += "\r\n";
      postString += "\r\n";
      postString += "\r\n";

      const char *postArray = postString.c_str(); //将str转化为char数组

      //Serial.println(postArray);
      wifi.send((const uint8_t *)postArray, strlen(postArray)); //send发送命令，参数必须是这两种格式，尤其是(const uint8_t*)
      Serial.println("send success");
      if (wifi.releaseTCP()) { //释放TCP连接
        Serial.print("release tcp ok\r\n");
      } else {
        Serial.print("release tcp err\r\n");
      }
      postArray = NULL; //清空数组，等待下次传输数据
    } else {
      Serial.print("create tcp err\r\n");
    }

    Serial.println("");

    net_time1 = millis();


}





 //称重函数
long Get_Weight()
{
 HX711_Buffer = HX711_Read();    ///读取此时的传感器输出值
 Weight_Shiwu = HX711_Buffer;     ///将传感器的输出值储存
 Weight_Shiwu = Weight_Shiwu - Weight_Maopi; //获取实物的AD采样数值。
 Weight_Shiwu = (long)((float)Weight_Shiwu/GapValue);    //AD值转换为重量（g）
 return Weight_Shiwu; 
}
unsigned long HX711_Read(void) //选择芯片工作方式并进行数据读取
{
 unsigned long count;   ///储存输出值  
 unsigned char i;     
   ////high--高电平 1  low--低电平 0  
 digitalWrite(HX711_DT, HIGH);   ////  digitalWrite作用： DT=1；
 delayMicroseconds(1); ////延时 1微秒  
 digitalWrite(HX711_SCK, LOW);  ////  digitalWrite作用： SCK=0；
 delayMicroseconds(1);   ////延时 1微秒  
 count=0; 
  while(digitalRead(HX711_DT));    //当DT的值为1时，开始ad转换
  for(i=0;i<24;i++)   ///24个脉冲，对应读取24位数值
 { 
   digitalWrite(HX711_SCK, HIGH);  ////  digitalWrite作用： SCK=0；
                                /// 利用 SCK从0--1 ，发送一次脉冲，读取数值
  delayMicroseconds(1);  ////延时 1微秒  
  count=count<<1;    ///用于移位存储24位二进制数值
  digitalWrite(HX711_SCK, LOW);   //// digitalWrite作用： SCK=0；为下次脉冲做准备
 delayMicroseconds(1);
   if(digitalRead(HX711_DT))    ///若DT值为1，对应count输出值也为1
   count++; 
 } 
  digitalWrite(HX711_SCK, HIGH);    ///再来一次上升沿 选择工作方式  128增益
 count ^= 0x800000;   //按位异或  不同则为1   0^0=0; 1^0=1;
///对应二进制  1000 0000 0000 0000 0000 0000  作用为将最高位取反，其他位保留原值
 delayMicroseconds(1);
 digitalWrite(HX711_SCK, LOW);      /// SCK=0；     
 delayMicroseconds(1);  ////延时 1微秒  
 return(count);     ///返回传感器读取值
}

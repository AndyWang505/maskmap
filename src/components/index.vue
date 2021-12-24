<template>
  <div class="row no-gutters">
      <div class="col-sm-3">
        <div class="leftBox">
          <div class="formBlock">
            <div class="font">口罩地圖  Mask Map</div>
            <div class="font">-找口罩/口罩預約-</div>
            <form>
              <div>
                <label for="cityControlSelect">請選擇縣市</label>
                <select class="form-select" id="cityControlSelect" v-model="selectCity.cityName">
                  <option selected disabled>--請選擇縣市--</option>
                  <option v-for="(item,index) in county" :key="index" :value="item.CityName">{{ item.CityName }}</option>
                </select>
              </div>
              <div v-if="selectCity.cityName">
                <label for="areaFormControlSelect">請選擇區域</label>
                <select class="form-select" id="areaFormControlSelect" v-model="selectCity.areaName" @change="updateSelect">
                  <option selected disabled>--請選擇區域--</option>
                  <option v-for="(item,index) in county.find((item) => item.CityName === selectCity.cityName).AreaList" :key="index" >{{ item.AreaName }}</option>
                </select>
              </div>
            </form>
            <div class="search" v-if="this.selectCity.pharmacies.length">
              共查詢到 {{ this.selectCity.pharmacies.length }} 間
            </div>
          </div>
          <div class="list-group" style="background-color:#f5f8f9;padding:15px;"
            v-if="selectCity.pharmacies.length">
              <a href="#" class="itemStyle" v-for="(item,index) in selectCity.pharmacies" @click="foucsData(item)" :key="index">
                <div class="itemHeader"><i class="bi bi-caret-right-fill"></i>{{ item.properties.name }}</div>
                <small>更新時間：{{ item.properties.updated }}</small>
                <div class="itemFlex">
                  <div class="itemWrap-aldult">
                    <div class="itemFont"><i class="fas fa-male"></i>成人口罩</div>
                    <div class="itemFont">目前剩餘<span>{{ item.properties.mask_adult }}</span>個</div>
                  </div>
                  <div class="itemWrap-child">
                    <div class="itemFont">兒童口罩</div>
                    <div class="itemFont">目前剩餘<span>{{ item.properties.mask_child }}</span>個</div>
                  </div>
                </div>
                <div class="itemAddress">地址：{{ item.properties.address }}</div>
                <div class="itemPhone">電話：{{ item.properties.phone }}</div>
                <div>
                  <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#modalContent" aria-expanded="false" aria-controls="modalContent">預約</button>
                  <a :href="`https://www.google.com.tw/maps/search/${item.properties.address}`" target="_blank"><button type="button" class="btn btn-info">查看位置</button></a>
                </div>
              </a>
          </div>
        </div>

      </div>
      <div class="col-sm-9 d-none d-sm-block">
        <div id="myMap"></div>
      </div>
  </div>

  <!-- 預約表單 -->
  <div class="modal fade" id="modalContent">
    <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <div><h2 style="font-weight: bold;">預約購買</h2></div>
          </div>
          <div class="model-body">
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">日期：</span>
              <input type="date" class="form-control" aria-describedby="basic-addon1" v-model="date">
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">時段：</span>
              <input type="time" class="form-control" aria-describedby="basic-addon1" v-model="time">
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">姓名：</span>
              <input type="text" class="form-control" placeholder="UserName" aria-label="UserName" aria-describedby="basic-addon1" v-model="name">
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">手機：</span>
              <input type="tel" class="form-control" placeholder="09xxxxxxxx" aria-label="09xxxxxxxx" aria-describedby="basic-addon1" v-model="phone">
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">身分證字號：</span>
              <input type="text" class="form-control" placeholder="A012345678" aria-label="A012345678" aria-describedby="basic-addon1" v-model="number">
            </div>
            <button type="submit" class="btn btn-warning" @click="reserve">送出</button>
          </div>
          <div class="modal-footer">
            <span>貼心提醒：請攜帶健保卡及身分證</span>
          </div>
            
        </div>
    </div>
  </div>
  
</template>




<script>
const db = firebase.database();
const rstRef = db.ref('results');
let theMap = {};
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png',
  iconSize: [32, 43],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

  export default {
    data() {
      return {
        county:[],
        pharmacies:[],
        selectCity:{
          cityName:'',
          areaName:'',
          pharmacies: [],
        },
        AppointmentList:[],
        date:'',
        time:'',
        name:'',
        phone:'',
        number:'',
      };
    },
    methods: {
      updateSelect() { //篩選
        this.selectCity.pharmacies = [];
        this.pharmacies.forEach(item => {
          if(item.properties.county === this.selectCity.cityName && item.properties.town === this.selectCity.areaName){
            this.selectCity.pharmacies.push(item);
          }
        });
      },
      foucsData(data){ //尚未修好
        L.marker([this.selectCity.pharmacies[0].geometry.coordinates[1], this.selectCity.pharmacies[0].geometry.coordinates[0]], {icon: markerIcon}).addTo(theMap);
        const lat = this.selectCity.pharmacies[0].geometry.coordinates[1];
        const lng = this.selectCity.pharmacies[0].geometry.coordinates[0];
        L.marker([lat, lng],{icon: markerIcon}).addTo(theMap);
        theMap.panTo([lat,lng]);
      },
      reserve(){
        if(!this.name.trim()){
          return;
        }
        const key = rstRef.push().key;
        rstRef.child(key).set({  //db set
          date: this.date,
          time: this.time,
          name: this.name,
          phone: this.phone,
          number: this.number,
        })
        console.log("預約成功")
        alert("已預約成功，可關閉視窗。") //hidden
        this.date = '';
        this.time = '';
        this.name = '';
        this.phone = '';
        this.number = '';
      }
    },
    mounted() {
      axios.get('https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json').then((response) => {   //縣市、區域
        this.county = response.data;
        // console.log(this.county);
      })
      axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json').then((response) => {   //藥局
        this.pharmacies = response.data.features;
        // console.log(this.pharmacies);
      })
      // 創建地圖
      const theMap = L.map("myMap", {
        center: [24.8036, 120.9687],
        zoom: 15
      });
      // 載入圖資
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        foo: 'bar',
        attribution: 'map <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        }).addTo(theMap);
      //db
      rstRef.on('value',(snapshot) => {
        const data = snapshot.val();
        this.AppointmentList = data;
      });
    },
  };
</script>



<style>
/* map */
html,body {
  padding: 0;
  margin: 0;
}
#myMap {
  height: 100vh;
}
/* 左欄位 */
.leftBox{
  height: 100vh;
  overflow-y: auto;
  background-color: #f6f6f6;
}
.formBlock{
  background-color:cyan;
  border: 1px solid rgba(0,0,0,.125);
  box-shadow: 0px 0px 9px rgb(100, 80, 80);
  padding: 15px;
  position: sticky;
  top: 0;
}
.font{
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: rgb(86, 32, 95);
}
.itemHeader{
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.itemStyle{
  background-color: #fff;
  border: 1px solid rgba(0,0,0,.125);
  padding: 10px;
  margin-bottom: 15px;
  text-decoration: none;
  color: black;
}
.itemStyle:hover{
  color: rgb(107, 105, 98);
}
.itemFlex{
  display: flex;
}
.itemWrap-aldult{
  border-radius:5px;
  width: 50%;
  background-color: rgb(190, 106, 183);
  color: #fff;
  padding: 10px;
}
.itemWrap-child{
  border-radius:5px;
  width: 50%;
  background-color: rgb(139, 165, 90);
  color: #fff;
  padding: 10px;
}
.itemFont{
  font-size: 18px;
}
.itemAddress{
  margin-top: 10px;
}
.itemPhone{
  margin-bottom: 10px;
}
.btn{
  width: 50%;
}
.search{
  margin-top: 10px;
}
.ml{
  margin-left: 15px;
}
.modal-content{
  padding: 20px;
  background-color: rgb(195, 225, 250);
}
.col-sm-9{
  padding-left: 0;
  padding-right: 0;
}
.col-sm-3{
  padding-left: 0;
  padding-right: 0;
}
.row{
  --bs-gutter-x:0;
}

</style>

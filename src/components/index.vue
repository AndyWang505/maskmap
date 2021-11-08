<template>
  <div class="wrap" style="width:500px;margin:auto;background-color:cyan;padding:15px;box-shadow:0px 0px 6px 0px rgb(95, 100, 100)">
    <div class="font">找口罩？MaskMap</div>
    <div class="font">~歡迎預約~</div>
    <form>
      <div>
        <label for="cityControlSelect">請選擇縣市</label>
        <select class="form-select" id="cityControlSelect" v-model="selectCity.cityName">
          <option selected>--請選擇縣市--</option>
          <option v-for="(item,index) in county" :key="index" :value="item.CityName">{{ item.CityName }}</option>
        </select>
      </div>
      <div v-if="selectCity.cityName">
        <label for="areaFormControlSelect">請選擇區域</label>
        <select class="form-select" id="areaFormControlSelect" v-model="selectCity.areaName" @change="updateSelect">
          <option selected>--請選擇區域--</option>
          <option v-for="(item,index) in county.find((item) => item.CityName === selectCity.cityName).AreaList" :key="index" >{{ item.AreaName }}</option>
        </select>
      </div>
    </form>
    <div class="search" v-if="this.selectCity.pharmacies.length">
      共查詢到 {{ this.selectCity.pharmacies.length }} 間
    </div>
  </div>
  <div class="list-group" style="width:500px;margin:20px auto auto auto;background-color:#f5f8f9;padding:15px;box-shadow:0px 0px 6px 0px rgb(160, 170, 170)"
    v-if="selectCity.pharmacies.length">

    <div class="itemStyle" v-for="(item,index) in selectCity.pharmacies" :key="index">
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
      reserve(){
        if(!this.name.trim()){
          return;
        }
        if(this.name==""){ console.log("123") }

        const key = rstRef.push().key;
        rstRef.child(key).set({  //db set
          date: this.date,
          time: this.time,
          name: this.name,
          phone: this.phone,
          number: this.number,
        })
        console.log("預約成功")
        alert("已預約成功，可關閉視窗。")　//沒寫好ariaHidden，先暫時這樣
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
      rstRef.on('value',(snapshot) => {
        const data = snapshot.val();
        this.AppointmentList = data;
      });
    },
  };
</script>



<style>
.font{
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: rgb(130, 50, 145);
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
</style>

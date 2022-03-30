<template>
  <div class="app row no-gutters">
    <div class="col-sm-3">
      <div v-if="cityName.length" class="toolbox">
        <div class="sticky-top p-4">
          <div class="form-group d-flex">
            <label for="cityName" class="mr-2 col-form-label text-right">縣市：</label>
            <div class="flex-fill">
              <select id="cityName" class="form-control"
              v-model="select.city" @change="select.area = ''">
                <option value="" selected disabled>--請選擇縣市--</option>
                <option :value="c.CityName" v-for="c in cityName" :key="c.CityName">
                  {{ c.CityName }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group d-flex">
            <label for="area" class="mr-2 col-form-label text-right">地區：</label>
            <div class="flex-fill">
              <select id="area" class="form-control" v-if="select.city.length"
                v-model="select.area" @change="updateSelect">
                <option value="">--請選擇區域--</option>
                <option :value="a.AreaName"
                  v-for="a in cityName.find((city) => city.CityName === select.city).AreaList"
                  :key="a.AreaName">
                  {{ a.AreaName }}
                </option>
              </select>
            </div>
          </div>
          <p class="text-left">請先選擇區域查看（灰色表示成人口罩缺貨）</p>
          <p class="text-right">共查詢到 <span class="text-num">{{ pharmacyNum }}</span> 間</p>
        </div>

        <ul class="list-group">
          <template v-for="(item, key) in data">
            <a class="list-group-item text-left" :key="key"
              v-if="item.properties.county === select.city
                && item.properties.town === select.area"
              :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child}"
              @click="penTo(item)">
              <h3 class="item-name">{{ item.properties.name }}</h3>
              <p class="item-content">地址：<a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                target="_blank" title="Google Map">
                {{ item.properties.address }}</a>
              </p>
              <p class="item-content">電話：{{ item.properties.phone }}
              </p>
              <div class="item-maskNum">
                <p class="item-mask-aldult">成人口罩<br>目前剩餘 {{ item.properties.mask_adult}}</p>
                <p class="item-mask-child">兒童口罩<br>目前剩餘 {{ item.properties.mask_child}}</p>
              </div>
            </a>
          </template>
        </ul>
      </div>
    </div>
    <div class="col-sm-9 d-none d-sm-block">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import L from 'leaflet';
import cityName from './assets/cityName.json';

let osmMap = {};

const iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};
const icons = {
  blue: new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    ...iconsConfig,
  }),
  grey: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    ...iconsConfig,
  }),
};

//OSM Obj function
const osm = {
  addMapMarker(x, y, item) {
    const icon = (item.mask_adult === 0) ? icons.grey : icons.blue;
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`);
  },
  removeMapMarker() {
    //所有圖層
    osmMap.eachLayer((layer) => {
      //如果使用marker圖層
      if (layer instanceof L.Marker) {
        osmMap.removeLayer(layer);
      }
    });
  },
  penTo(x, y, item) {
    const icon = (item.mask_adult === 0) ? icons.grey : icons.blue;
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${item.mask_adult ? `${item.mask_adult} 個` : '未取得資料'}/ 兒童 - ${item.mask_child ? `${item.mask_child} 個` : '未取得資料'}</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`).openPopup();
    
    osmMap.panTo(new L.LatLng(y, x));
  },
};

export default {
  name: 'app',
  data: () => ({
    cityName,
    data: {},
    osmMap: {},
    select: {
      city: '新竹縣',
      area: '竹北市',
    },
    pharmacyNum: 0,
  }),
  methods: {
    updateMarker() {
      const pharmacies = this.data.filter((pharmacy) => {
        if (!this.select.area) {
          return pharmacy.properties.county === this.select.city;
        }
        return pharmacy.properties.town === this.select.area;
      });
      this.pharmacyNum = pharmacies.length;
      pharmacies.forEach((pharmacy) => {
        const { properties, geometry } = pharmacy;
        //call OSM Obj function
        osm.addMapMarker(geometry.coordinates[0], geometry.coordinates[1], properties);
      });
      this.penTo(pharmacies[0]);
    },
    removeMarker() {
      osm.removeMapMarker();
    },
    penTo(pharmacy) {
      const { properties, geometry } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    updateSelect() {
      this.removeMarker();
      this.updateMarker();
      const pharmacy = this.data.find(item => item.properties.town === this.select.area);
      const { geometry, properties } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
  },
  mounted() {
    osmMap = L.map('map', {
      center: [25.03, 121.55],
      zoom: 15,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      foo: 'bar',
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'  ,
    }).addTo(osmMap);

    axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
      .then((res) => {
        this.data = res.data.features;
        this.updateMarker();
      });
  },
};
</script>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';

#map {
  height: 100vh;
}

.row > *{
  padding-right: 0;
  padding-left: 0;
}

.row {
  margin: 0;
}

select{
  margin-bottom: 10px;
}

.app {
  position: relative;
}

.highlight {
  background: #f6f6f6;
}

.toolbox {
  height: 100vh;
  overflow-y: auto;
  background: #a8a3a3;
  a {
    cursor: pointer;
  }
}

.list-group{
  padding: 15px;
}

.list-group-item{
  border-radius: 5px;
  margin-bottom: 15px;
  border: none;
  color: #000;
}

.toolbox .sticky-top{
  font-weight: bold;
  background-color: rgb(58, 58, 56);
  color: #ffff;
  box-shadow: 0 0 9px #000;
}

.text-left{
  margin: 0 0 15px 0;
  font-size: 14px;
}

.text-right{
  margin-bottom: 0;
  font-size: 18px;
  text-align: right;
}

.text-num{
  font-size: 24px;
  color: #00ff4c;
}

.item-name{
  font-weight:bold;
  font-size: 24px;
}

.list-group .list-group-item:hover{
  color: black;
  background-color: #ffff;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.item-maskNum{
  display: flex;
  font-size: 18px;
  font-weight:bold;
  margin: 10px 0 5px 0;
}

.item-mask-aldult{
  border-radius: 5px;
  width: 50%;
  background-color: #be6ab7;
  color: #fff;
  padding: 10px;
  margin: 0;
}

.item-mask-child{
  border-radius: 5px;
  width: 50%;
  background-color: #8ba55a;
  color: #fff;
  padding: 10px;
  margin: 0;
}

.item-content{
  font-size: 14px;
  margin-bottom: 5px;
}

.item-content a{
  text-decoration: none;
  color: #000;
}

.item-content a:hover{
  text-decoration: underline;
}

</style>
<template>
  <div class="secition-content">
    <div class="secition-content-title-area">
      <h2 class="section-content-title">
        연령별 유동인구
        <span class="icon-question" @click="popup"><v-icon size=15>mdi-help-circle-outline</v-icon>
        <span v-show="popflag" class="icon-popup-tri"/></span>
        <span v-show="popflag" class="icon-popup">공공데이터 상권 관련 데이터를 분석해서 생성한 정보입니다.</span>
      </h2>
      <div class="section-content-update">2020-02-05 업데이트</div>
    </div>
    <p class="point-content-area Content" style="font-size: 1.2em;
    font-weight: bold;">
      <span class="point-title" v-if="isOk">{{maxAgeMaker}}</span>
      <span class="point-percent" v-if="isOk" >{{percentMaker}}</span>
      <span class="point-normal" v-if="isOk" >유동인구가 가장 많아요.</span>
      <span class="point-normal" v-if="!isOk">데이터 업데이트 예정입니다</span>
    </p>
    <div id="chart">
      <loading :loading="loadingStatus" :transparent='true'></loading>
      <div>
        <bar-chart
          :chart-data="chartdata"
          :options="chartoptions"
          width="480px"
          height="300px"
        ></bar-chart>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '@/lib/BarChart'
import axios from '@/js/http-commons'
import Loading from '@/components/common/loading/Loading'
import './Graphs.css'
import { eventBus } from '@/js/bus'
export default {
  components: {
    BarChart,
    Loading
  },
  data () {
    return {
      isOk:true,
      popflag: false,
      chartdata: null,
      chartoptions: null,
      result: null,
      road: '',
      key: this.$store.state.place,
      searchOption: 1,
      title: '연령별 유동인구',
      point: 0,
      btnStyle1: {
        backgroundColor: '#d9d9d9',
        cursor: 'pointer'
      },
      btnStyle2: {
        backgroundColor: 'white',
        cursor: 'pointer'
      },
      btnStyle3: {
        backgroundColor: 'white',
        cursor: 'pointer'
      },
      btnStyle4: {
        backgroundColor: 'white',
        cursor: 'pointer'
      },
      chartStyle: {
        display: 'contents'
      },
      loadingStatus: false,
      allowDiv: {
        display: 'none'
      }
    }
  },
  computed: {
    percentMaker: function () {
      if (this.result == null) return
      let total = [this.result.j, this.result.k, this.result.l, this.result.m, this.result.n, this.result.o]
      let totalNum = Math.max.apply(null, total)
      return '(' + totalNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '명' + ')'
    },
    maxAgeMaker: function () {
      if (this.result == null) return
      let total = [Number(this.result.j), Number(this.result.k), Number(this.result.l), Number(this.result.m), Number(this.result.n), Number(this.result.o)]
      let maxAge = -1
      let idx = 0
      for (let index = 0; index < total.length; index++) {
        if (maxAge < total[index]) {
          maxAge = total[index]
          idx = index
        }
      }
      if (idx === 5) return (idx + 1) * 10 + '대 이상'
      return (idx + 1) * 10 + '대'
    }
  },
  mounted () {
    this.draw()
    eventBus.$on('clickmap', name => {
      this.key = this.$store.state.place
       this.isOk=true
      this.draw()
    })
  },
  methods: {
    popup () {
      this.popflag = !this.popflag
    },
    draw () {
      this.chartdata = null
      this.chartoptions = null

      this.searchOption = 1
      this.title = '연령별 유동인구'
      this.btnStyle1.backgroundColor = '#d9d9d9'
      this.btnStyle2.backgroundColor = 'white'
      this.btnStyle3.backgroundColor = 'white'
      this.btnStyle4.backgroundColor = 'white'

      if (this.key !== '') {
        this.getData()
      }
    },
    getData () {
      this.loadingStatus = true
      this.allowDiv.display = 'block'
      this.btnStyle1.cursor = 'not-allowed'
      this.btnStyle2.cursor = 'not-allowed'
      this.btnStyle3.cursor = 'not-allowed'
      this.btnStyle4.cursor = 'not-allowed'
      axios
        .get('/population/getPopulationByLocation2/' + this.key)
        .then(res => {
          this.result = res.data.pbl
          if( this.result === null){
            this.result= {
              j:0,
              k:0,
              l:0,
              m:0,
              n:0,
              o:0
            }
            this.road = 'Nodata'
            this.isOk = false
          }
          else{
          this.road = this.result.f
          this.point = res.data.point
          this.isOk = true
          }
          
        })
        .finally(() => {
          this.chartdata = {
            labels: ['10대', '20대', '30대', '40대', '50대', '60대 이상'],
            datasets: [
              {
                label: '전체',
                backgroundColor: '#365673',
                data: [
                  this.result.j,
                  this.result.k,
                  this.result.l,
                  this.result.m,
                  this.result.n,
                  this.result.o
                ]
              }
            ]
          }

          this.chartoptions = {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  },
                  gridLines: {
                    display: true
                  }
                }
              ],
              xAxes: [
                {
                  gridLines: {
                    display: true
                  }
                }
              ]
            }
          }

          this.loadingStatus = false
          this.allowDiv.display = 'none'
          this.btnStyle1.cursor = 'pointer'
          this.btnStyle2.cursor = 'pointer'
          this.btnStyle3.cursor = 'pointer'
          this.btnStyle4.cursor = 'pointer'
        })
    }
  }
}
</script>

<style scoped lang="scss">
#chart {
  position: relative;
  width: 500px;
  height: 300px;
  overflow: hidden;
}

#back {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  background-color: rgb(255, 255, 255);
}

#point {
  border: 1px solid black;
  border-radius: 5px;
  width: 500px;
  height: 40px;
  line-height: 40px;
  top: 5px;
  font-size: 24px;
  margin-top: 10px;
  background-color: white;
}

#searchOptions {
  margin: auto;

  button {
    font-size: 16px;
    display: inline-block;
    border: 1px solid black;
    border-radius: 5px;
    width: 200px;
    height: 30px;
    margin-right: 10px;
    background-color: white;
    transition: 0.1s all ease;

    &:hover {
      font-weight: bold;
    }
  }
}

#searchOptions button:hover {
  background-color: #e38fe3;
}

#search input {
  border: 1px solid black;
  border-radius: 5px 0 0 5px;
  width: 200px;
  height: 30px;
  margin-top: 10px;
  padding: 5px;
  background-color: white;
}

#search-btn {
  border-radius: 0 5px 5px 0;
  width: 50px;
  height: 30px;
  background-color: rgb(172, 172, 172);
}

#search-result {
  margin-top: 5px;
}

$color1: rgb(232, 113, 91);
$color2: rgb(15, 66, 95);

.Content {
  width: 100%;
  padding: 10px 20px;
  margin: 20px 0;
  background-color: $color2;
  border-radius: 5px;
  color: $color1;
  box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.5);
  text-align: center;

  .strong {
    color: rgb(223, 223, 223);
  }

  h2 {
    font-size: 1.2em;
    font-weight: bold;
  }
}
</style>

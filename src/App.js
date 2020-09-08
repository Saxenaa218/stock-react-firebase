import React from 'react';
import Axios from 'axios';
import './App.scss';
import {Icon} from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment'

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      alldata: "",
      datasets: null,
      loading: false,
      selected: null,
      dsloading: false,
    }
    // Object.defineProperty(Array.prototype, 'chunk', {
    //     value: function(chunkSize){
    //         let temporal = [];
            
    //         for (let i = 0; i < this.length; i+= chunkSize){
    //             temporal.push(this.slice(i,i+chunkSize));
    //         }
                    
    //         return temporal;
    //     }
        
    // });
  }

  baseUrl = "https://flask-abhishek.herokuapp.com/";

  componentDidMount() {
    let url = `${this.baseUrl}/get-datasets`;
      this.setState({dsloading: true})
    Axios.get(url).then(json => {
      this.setState({ datasets: json.data.datasets, dsloading: false });
    }).catch(error => {
        console.log(error)
        this.setState({dsloading: false})
    })
  }

  getData = (keyword) => {
    this.setState({ loading: true, selected: keyword });
    let url = `${this.baseUrl}/get-data`;
    let data = {
      name: keyword
    }
    Axios.post(url, data)
      .then(json => this.setState({alldata: json.data.date, loading: false}))
      .catch(error => {console.log(error);this.setState({loading: false})});
  }

  chunkify = (chunkSize) => {
    let temporal = [];
    
    for (let i = 0; i < this.state.alldata.length; i+= chunkSize){
      temporal.push(this.state.alldata.slice(i,i+chunkSize));
    }
            
    return temporal;
  }

  getOptions = (mainData) => {
    console.log(mainData)
    return {
      chart: {
          zoomType: 'x'
      },
      title: {
          text: `Trend (${this.state.selected})`
      },
      subtitle: {
          text: `from <b>${moment(mainData[0][0]).format("DD-MM-YYYY")}</b> at <b>${mainData[0][1]}</b> to <b>${moment(mainData[mainData.length-1][0]).format("DD-MM-YYYY")}</b> at <b>${mainData[mainData.length-1][1]}</b>`
      },
      xAxis: {
        type: 'Date',
        // title: {
        //   text: 'Date'
        // },
        categories: mainData.map(e => e[0]),
        // labels: {
        //     rotation: 90
        // }
      },
      yAxis: {
        type: 'Number',
        title: {
          text: 'Closing Value(in Rs)'
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
          area: {
              fillColor: {
                  linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                  },
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
              },
              marker: {
                  radius: 2
              },
              lineWidth: 1,
              states: {
                  hover: {
                      lineWidth: 1
                  }
              },
              threshold: null
          }
      },

      series: [{
          type: 'area',
          data: mainData
      }],
      credits: {
        enabled: false
      },
      tooltip: {
        formatter: function () {
          let t = this.points[0]
          return "<div>Date: " +"<b>"+moment(t.key).format("DD-MM-YYYY")+"</div><br/>"+"<div>Closing price: <b>"+t.y+"</b> Rs</div>";
        },
        shared: true
    },
    };
  }

  

  render() {
    
    let { datasets, dsloading, selected, loading } = this.state;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        height: '90%'
      }}>
        <div className="left-subparent">
          <h2>Company List</h2>
          {dsloading ? <Icon type="loading" className="loader"/> : <div className="vertical-menu">
              {datasets && datasets.map(e => <div key={e} className={selected === e.split('.')[0] ? "list-elem-clicked" : "list-elem"} onClick={() => this.getData(e.split('.')[0])}>{e.split('.')[0]}</div>)}
          </div>}
        </div>
        <div className="right-subparent">
          <h2>Analysis Chart</h2>
          <div className="chart-section">
              {loading ? <Icon type="loading" className="data-loader"/> : <>{this.chunkify(999).map(e => <HighchartsReact highcharts={Highcharts} options={this.getOptions(e)} />)}</>}
          </div>
        </div>
      </div>      
    );
  }
}

export default App;

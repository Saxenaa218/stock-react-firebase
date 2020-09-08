import React from 'react';
import Axios from 'axios';
import './App.scss';
import {Icon} from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
      .then(json => this.setState({alldata: json.data.date}))
      .catch(error => console.log(error));
  }

  chunkify = (chunkSize) => {
    let temporal = [];
    
    for (let i = 0; i < this.state.alldata.length; i+= chunkSize){
      temporal.push(this.state.alldata.slice(i,i+chunkSize));
    }
            
    return temporal;
  }

  getOptions = (mainData) => {
    return {
      chart: {
          zoomType: 'x'
      },
      title: {
          text: `Trend (${this.state.selected})`
      },
      subtitle: {
          text: `from ${mainData[0][0]} at ${mainData[0][1]} to ${mainData[mainData.length-1][0]} at ${mainData[mainData.length-1][1]}`
      },
      xAxis: {
          type: 'string',
          title: {
            text: 'Date'
          }
      },
      yAxis: {
        type: 'Number',
        title: {
          text: 'Closa Value'
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
      }]
    };
  }

  

  render() {
    
    let { datasets, dsloading } = this.state;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row'
      }}>
        <div class="vertical-menu">
          {datasets && datasets.map(e => <div className="list-elem" onClick={() => this.getData(e.split('.')[0])}>{e.split('.')[0]}</div>)}
        </div>
        <div>
            {
                dsloading ? <Icon type="loading"/> : <>{this.chunkify(999).map(e => <HighchartsReact highcharts={Highcharts} options={this.getOptions(e)} />)}</>}
        </div>
      </div>      
    );
  }
}

export default App;

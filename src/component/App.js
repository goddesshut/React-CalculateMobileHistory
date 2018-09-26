import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      historys: null,
      callSummary: null
    }

    this.calculateCallSummary = this.calculateCallSummary.bind(this);
  }

  componentDidMount() {
    let historys = [];
    let xhr = new XMLHttpRequest();
    xhr.open("GET", './document/history.txt', false);
    xhr.onload  = function(e) 
    {
      if(xhr.status === 200 && xhr.readyState === 4) 
      {
        let textArray = xhr.responseText.split("\n");

        textArray.forEach((data, index) => {
            const model = data.split("|");

            if(model.length > 1) 
            {
              let item = {
                date: model[0],
                startTime: model[1],
                endTime: model[2],
                mobileNo: model[3],
                promotion: model[4]
              };

              historys.push(item);
            }
          });

          this.setState({ historys: historys })
      }
      else 
      {
        console.error(xhr.statusText)
      }
      
    }.bind(this);

    xhr.send();
  }

  calculateCallSummary() {
    let history = this.state.historys || [];
    let callSummary = [];
    let callSummaryPerNumber = [];
    
    history.forEach((data, index) => {

      const dateParts = data.date.split("/");
      const startTime = data.startTime.split(":");
      const endTime = data.endTime.split(":");
      const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], startTime[0], startTime[1], startTime[2]);
      const endDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], endTime[0], endTime[1], endTime[2]);

      let diff = endDate.getTime() - startDate.getTime();

      let msec = diff;
      let hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      let mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      let ss = Math.floor(msec / 1000);
      msec -= ss * 1000;

      let sumMinute = (hh * 60) + mm;
      if(ss > 0) {
        sumMinute = sumMinute + 1;
      }

      let price = 0;
      price = sumMinute + 2;

      callSummary.push({
        mobileNo: data.mobileNo,
        callDate: data.date,
        callTime: hh + ":" + mm + ":" + ss,
        price: price
      });

    });

    if(callSummary.length > 0) 
    {
      callSummaryPerNumber = [...callSummary.reduce((map, item) => {
          const { mobileNo: key, price } = item;
          const prev = map.get(key);

          if(prev) 
          {
            prev.price += price
          } 
          else 
          {
            map.set(key, Object.assign({ mobileNo: item.mobileNo, price: price }))
          }

          return map
        }, new Map()).values()
      ];
    }

    return (
      <React.Fragment>
      <div className="container">
        <table className="table-responsive">
          <thead>
            <tr>
              <th className="text-center">Mobile No</th>
              <th className="text-center">Price</th>
            </tr>
          </thead>
          <tbody>
            {
              callSummaryPerNumber.map((item) => {
                return (
                  <tr>
                    <td className="text-center">{item.mobileNo}</td>
                    <td className="text-center">{item.price} ฿</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
      </React.Fragment>
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Call Summary</h1>
        </header>
        {this.calculateCallSummary()}
      </div>
    );
  }
}

export default App;

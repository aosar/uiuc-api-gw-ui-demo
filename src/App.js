import './App.css';
import React from 'react';
import config from './config.json';

const azureApiUrl = config.azure_api_url;

const FormMetadata = [
  { name: 'buildingId', label: 'Building ID', type: 'text' },
  { name: 'buildingName', label: 'Building Name', type: 'text' },
  { name: 'floorId', label: 'Floor ID', type: 'text' },
  { name: 'floorName', label: 'Floor Name', type: 'text' },
  { name: 'fileType', label: 'File Type', type: 'dropdown', options: ['json', 'pdf', 'csv'] },
  { name: 'isFlatFile', label: 'Flat File?', type: 'dropdown', visibility: 'hidden', options: ['true', 'false'] },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      formData: {
        buildingId: '',
        buildingName: '',
        floorId: '',
        floorName: '',
        fileType: '',
        isFlatFile: '',
      },
     };
    this.handleFormChange = this.handleFormChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    
  }
  /**
   * Submit data to API
   * TODO if maintaining: dont use callbacks if possible
   */
  submitForm(e) {
    fetch(azureApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        building: {
          bl_id: this.state.buildingId,
          name: {
            contains: this.state.buildingName
          }
        },
        floor: {
          fl_id: this.state.floorId,
          name: this.state.floorName
        },
        flat_file: this.state.isFlatFile,
        file_type: this.state.fileType,
      })
    }).then(res => {
      console.log(res);
      console.log('test');
      if (res.status >= 300) {
        this.setState({ result: `${res.status >= 500 ? 'Server ': ''}Error ${res.status}: ${res.statusText}` });
      } else {
        res.text().then(text => {
          // if string is array, parse it
          if (text.startsWith('[')) {
            text = JSON.parse(text);
          }
          this.setState({ result: text });
        });
      }
    }).catch(e => {
      console.log(e);
      this.setState({ result: e });
    });
    e.preventDefault();
  };

  handleFormChange(e) {
    console.log(`changing state for ${e.target.name} to ${e.target.value} from ${this.state.formData[e.target.name]}`);
    // console.log(e);
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      formData: {[name]: value }
    });
  }

  jsonListToTable(jsonList) {
    if (!jsonList || !jsonList.length) return '';

    return (
      <table>
        <thead>
          <tr>
            {Object.keys(jsonList[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {jsonList.map((row) => <tr key={row.id}>
            {Object.keys(row).map((key) => <td key={key}>{row[key]}</td>)}
          </tr>)}
        </tbody>
      </table>
    );
  }

  render() {
    // Dynamically render form based on FormMetadata
    const form = FormMetadata.map((field) => {
      return (
        <div className="form-group" key={field.name}>
          <label>{field.label} &nbsp;</label>
          {field.type === 'text' ?
            <input name={field.name} type="text" className="form-control" value={this.state.formData[field.name]} onChange={this.handleFormChange} />
            : null
          }
          {field.type === 'dropdown' ? <select className="form-control">
            {field.options.map((option) => <option key={option}>{option}</option>)}
          </select> : null}
        </div>
      );
    });
    
    const result = typeof this.state.result === 'string' ?
      <h2>{this.state.result}</h2> :
      <h3>{this.jsonListToTable(this.state.result || [])}</h3>;

    return (
      <div className="App">
        <header className="App-header">
          <p>
            Archibus Connect
          </p>
        </header>
        <body className='App-body'>
          <div className="disclaimer-header">
            <h4>
              This web application is developed as a proof-of-concept for the campus Business Initiative.   It is used to
              demonstrate the ability to access campus resources via a cloud based API using Microsoft's Azure API Gateway
              product.  Use of this application for any production purpose is not approved.  No guarantees of continual
              availability or fitness for any purpose other than demonstrating a concept are made.
            </h4>
          </div>
          <div>
            {form}
            <button onClick={this.submitForm}>Submit</button>
          </div>
          <div>
            <h1>Results</h1>
            <h2>{result.length ? `${result.length} Records` : ''}</h2>
            {result}
          </div>
        </body>
      </div>
    );
}
}

export default App;

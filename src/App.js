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
   */
  submitForm(e) {
    try {
      fetch(azureApiUrl, {
        method: 'POST',
        headers: {},
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
        this.setState({ result: res });
      });
    } catch (e) {
      console.log(e);
    }
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

    return (
      <div className="App">
        <header className="App-header">
          <p>
            Archibus Connect
          </p>
        </header>
        <body className='App-body'>
          <div>
            <h1>Note: This is a demo site</h1>
          </div>
          <div>
            {form}
            <button onClick={this.submitForm}>Submit</button>
          </div>
          <div>
            <h1>Results</h1>
            {JSON.stringify(this.state.result)}
          </div>
        </body>
      </div>
    );
}
}

export default App;
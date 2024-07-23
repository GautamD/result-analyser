import React from 'react'
import * as XLSX from "xlsx"
import './App.css'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default class SheetJSApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [] /* Array of Arrays e.g. [["a","b"],[1,2]] */,
      cols: [] /* Array of column objects e.g. { name: "C", K: 2 } */,
      students: [],
      workbook: null
    };
    this.getWorkBookFrom = this.getWorkBookFrom.bind(this);
    this.getStudentsFrom = this.getStudentsFrom.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }
  process(data) {
    let students = []
    let row1 = data[2]
    let row2 = data[3]
    let noOfLangs = row2.filter(x => x == header[3]).length
    let startRowIdx = 4
    let endRowIdx = data.findIndex((element) => element.length == 0)
    for (let idx = startRowIdx; idx < endRowIdx; idx++) {
      let student = {}
      let rowStd = data[idx]
      rowStd.forEach((element, i) => {
        if (noOfLangs == 1) {
          if ([3, 4, 5, 6].includes(i)) {
            student[header[11] + row2[i]] = element
          } else {
            student[row1[i]] = element
          }
        } else {
          if ([3, 4, 5, 6].includes(i)) {
            student[header[11] + row2[i]] = element
          } else if ([7, 8, 9].includes(i)) {
            student[header[12] + row2[i]] = element
          } else {
            student[row1[i]] = element
          }
        }
      });
      students.push(student)
    }
    return students
  }
  // handleFile(file /*:File*/, worksheetNo) {
  //   /* Boilerplate to set up FileReader */
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   reader.onload = e => {
  //     /* Parse data */
  //     const bstr = e.target.result;
  //     const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
  //     /* Get first worksheet */
  //     const wsname = wb.SheetNames[worksheetNo];
  //     const ws = wb.Sheets[wsname];
  //     console.log(rABS, wb);
  //     /* Convert array of arrays */
  //     const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  //     const students = this.process(data)
  //     /* Update state */
  //     this.setState({ data: data, students: students, cols: make_cols(ws["!ref"]) });
  //   };
  //   if (rABS) reader.readAsBinaryString(file);
  //   else reader.readAsArrayBuffer(file);
  // }

  getWorkBookFrom(file) {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = e => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
      // console.log(rABS, wb);
      this.setState({ workbook: wb });
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  }

  getStudentsFrom(worksheetName) {
    const ws = this.state.workbook.Sheets[worksheetName];
    /* Convert array of arrays */
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const students = this.process(data)
    // console.log(students);
    /* Update state */
    this.setState({ data: data, students: students, cols: make_cols(ws["!ref"]) });
  }

  handleFile(file) {
    this.getWorkBookFrom(file)
  }

  handleSelect(worksheetName) {
    this.getStudentsFrom(worksheetName)
  }

  render() {
    return (
      <DragDropFile handleFile={this.handleFile} handleSelect={this.handleSelect} workbook={this.state.workbook}>
        <div className="row">
          <div className="col-xs-12">
            <DataInput handleFile={this.handleFile} handleSelect={this.handleSelect} workbook={this.state.workbook} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <ChartData students={this.state.students} />
          </div>
        </div>
      </DragDropFile>
    );
  }
}

class DragDropFile extends React.Component {
  constructor(props) {
    super(props);
    this.onDrop = this.onDrop.bind(this);
  }
  suppress(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }
  onDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const files = evt.dataTransfer.files;
    if (files && files[0]) this.props.handleFile(files[0]);
  }
  render() {
    return (
      <div
        onDrop={this.onDrop}
        onDragEnter={this.suppress}
        onDragOver={this.suppress}
      >
        {this.props.children}
      </div>
    );
  }
}

class DataInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.RenderSelect = this.RenderSelect.bind(this);
  }
  handleFileChange(e) {
    const files = e.target.files;
    if (files && files[0]) this.props.handleFile(files[0])
  }
  handleSelectChange(e) {
    this.props.handleSelect(e.target.value)
  }
  RenderSelect({ isSetWorkbook }) {
    if (isSetWorkbook) {
      return (
        <div>
          <label htmlFor="grade">Worksheet</label>
          <select className="form-select" name="grade" id="grade" onChange={this.handleSelectChange}>
            <option value="-1">--</option>
            {this.props.workbook.SheetNames.map(wsname => (
              <option key={wsname} value={wsname}>{wsname}</option>
            ))}
          </select>
        </div>
      );
    }
  }
  render() {
    return (
      <form className="form-inline">
        <div className="form-group d-inline-block">
          <label htmlFor="file">Spreadsheet</label>
          <input
            type="file"
            className="form-control"
            id="file"
            accept={SheetJSFT}
            onChange={this.handleFileChange}
          />
          <br />
          <this.RenderSelect isSetWorkbook={this.props.workbook != null} />
          <br />
        </div>
      </form>
    );
  }
}

class OutTable extends React.Component {
  render() {
    return (
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {this.props.cols.map(c => (
                <th key={c.key}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.props.data.map((r, i) => (
              <tr key={i}>
                {this.props.cols.map(c => (
                  <td key={c.key}>{r[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class ChartData extends React.Component {
  constructor(props) {
    super(props)
    // this.state = {
    //   perData: []
    // };
    // this.percentageData = this.percentageData.bind(this);
    this.RenderChart = this.RenderChart.bind(this);
    this.RenderLangChart = this.RenderLangChart.bind(this);
  }
  // percentageData() {
  //   let data = []
  //   this.props.students.forEach((student) => {
  //     let s = {}
  //     s["Name"] = student[header[1]].split(" ")[0]
  //     s["Percentage"] = student[header[14]]
  //     data.push(s)
  //   });
  // console.log(data);
  //   this.setState({ perData: data })
  // }

  RenderChart(subject) {
    return (
      <div>
        <ResponsiveContainer width={1000} height={700}>
          <BarChart
            data={this.props.students}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={header[1]} tickSize={60} tickLine={false} height={200} angle={90} tickFormatter={(value) => value.split(" ")[0]} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={subject} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          </BarChart>
        </ResponsiveContainer>
        <br />
        <br />
        <br />
      </div>
    );
  }

  RenderLangChart(subject1, subject2) {
    let noOfLangs = 1
    if (this.props.students.length != 0) {
      const studentKeys = Array.from(Object.keys(this.props.students[0]))
      const found1 = studentKeys.findIndex((key) => key.startsWith(header[11]))
      const found2 = studentKeys.findIndex((key) => key.startsWith(header[12]))
      if (found1 != -1 && found2 != -1) {
        noOfLangs = 2
      }
      // console.log(noOfLangs);
    }

    if (noOfLangs == 1) {
      return (
        <div>
          <h3>{subject1}</h3>
          <ResponsiveContainer width={1000} height={700}>
            <BarChart
              data={this.props.students.filter((s) => (subject1 in s))}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={header[1]} tickSize={60} tickLine={false} height={200} angle={90} tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={subject1} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
            </BarChart>
          </ResponsiveContainer>
          <br />
          <br />
          <br />
        </div>
      );
    } else {
      return (
        <div>
          <div className="row">
            <div className="w-50">
              <h3>{subject1}</h3>
              <ResponsiveContainer width={400} height={700}>
                <BarChart
                  data={this.props.students.filter((s) => (subject1 in s))}
                  margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={header[1]} tickSize={60} tickLine={false} height={200} angle={90} tickFormatter={(value) => value.split(" ")[0]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={subject1} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-50">
              <h3>{subject2}</h3>
              <ResponsiveContainer width={400} height={700}>
                <BarChart
                  data={this.props.students.filter((s) => (subject2 in s))}
                  margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={header[1]} tickSize={60} tickLine={false} height={200} angle={90} tickFormatter={(value) => value.split(" ")[0]} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={subject2} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <br />
          <br />
          <br />
        </div>
      );
    }
  }

  render() {
    return (
      <div width="100%" height="100%">
        {/*
        <button type="button" className="btn btn-primary" onClick={this.percentageData}>Update Chart</button>
        */}
        <br />
        <h3>Percentage</h3>
        {this.RenderChart(header[14])}
        <h3>English</h3>
        {this.RenderChart(header[2])}
        <h3>Maths</h3>
        {this.RenderChart(header[7])}
        <h3>Science</h3>
        {this.RenderChart(header[8])}
        <h3>Social</h3>
        {this.RenderChart(header[9])}
        {this.RenderLangChart(header[11] + header[3], header[12] + header[3])}
        {this.RenderLangChart(header[11] + header[4], header[12] + header[4])}
        {this.RenderLangChart(header[11] + header[5], header[12] + header[5])}
        {this.RenderLangChart(header[11] + header[6])}
        <h3>Computer</h3>
        {this.RenderChart(header[10])}
      </div>
    );
  }
}

const header = [
  'S.No',
  'Student Name: ',
  'Eng',
  'Kan',
  'San',
  'Hin',
  'Fren',
  'Maths',
  'Science',
  'Social Sc.',
  'Computer',
  '2nd lang ',
  '3rd lang ',
  'Total',
  '%'
]

const SheetJSFT = [
  "xlsx",
  "xlsb",
  "xlsm",
  "xls",
  "xml",
  "csv",
  "txt",
  "ods",
  "fods",
  "uos",
  "sylk",
  "dif",
  "dbf",
  "prn",
  "qpw",
  "123",
  "wb*",
  "wq*",
  "html",
  "htm"
]
  .map(function (x) {
    return "." + x;
  })
  .join(",");

const make_cols = refstr => {
  let o = [],
    C = XLSX.utils.decode_range(refstr).e.c + 1;
  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
  return o;
};



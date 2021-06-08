module.exports.htmlStyle = `  
.td {
  padding: 4px 2px;
}

.td > .tr:last-child {
  border-bottom: none;
}
.tr {
  display: flex; 
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center; 
  min-height: 23px;
  border-bottom: solid 1px #EEE;
}

.tr:nth-child(odd) {
  background-color:#f6f6f6;
}
.th {
  font-weight: bold;
  padding: 8px 4px;
}

.reportPage {
  padding: 10px 50px;
}
#reportHeader{
  padding-bottom: 20px;
}
td,th{
  padding: 7px 5px;
}

.dataField {
  background-color: #e6f4ff;
  padding: 10px;
  border-radius: 10px;
  border: solid 1px #BBB;
}
h2{
  margin:0rem 0 1.424rem 0 !important;
}
`
module.exports.htmlStyle = `  
.td {
  padding: 2px 6px;
}

.td.level{
  padding: 0 0;
}

.td > .tr:last-child {
  border-bottom: none;
}
.tr {
  display: flex; 
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch; 
  min-height: 23px;
  border-bottom: solid 1px #DDD;
}

.th {
  font-weight: bold;
  padding: 8px 4px;
}

.indentation {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.indentation > div.td {
  border-right: solid 1px #EEE;
}

.indentation > div.td:last-child {
  border-right: none;
}

.tr > div {
  border-right: solid 1px #EEE;
}
.tr > div.td:last-child {
  border-right: none;
}

.tdr > .tr:last-child {
  border-bottom:none;
}
.reportPage {
  padding: 10px 50px;
}
#reportHeader{
  padding-bottom: 20px;
}
td,th{
  padding: 5px 6px;
}

.dataField {
  background-color: #e6f4ff;
  padding: 10px;
  border-radius: 6px;
  border: solid 1px #BBB;
}
h2{
  margin:0rem 0 1.424rem 0 !important;
}
`
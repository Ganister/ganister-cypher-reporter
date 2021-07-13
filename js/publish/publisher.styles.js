module.exports.htmlStyle = `  
.td {
  padding: 2px 4px;
  border-left: 1px solid rgba(0,0,0,0.1) ;
  font-family: helvetica;
  font-size: 12px;
}

table {
  border-collapse: collapse;
}
.td.level{
  padding: 0 0;
  background-color: #eef;
}

.td > .tr:last-child {
  border-bottom: none;
}
.tr {
  min-height: 23px;
}

tr {
  border-bottom: 1px solid rgba(0,0,0,0.4);
}
.tr > .td,.tr > .th  {
  /*border-bottom: solid 1px #DDD;*/
}

td > table > tbody > tr:last-child {
  border: none;
}



.indentLine {
  border: none;
}
.indentLine > td:first-child {
  border: none;
}

.th {
  font-weight: bold;
  padding: 8px 4px;
  position: sticky;
  top: 0px;
  background: wheat;
}

.indentation {
  padding: 0;
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
.tdr {
  padding: 0;
}

.tdr > .tr:last-child {
  border-bottom:none;
}
.reportPage {
  padding: 5px 5px;
}
#reportHeader{
  padding-bottom: 20px;
}
td,th{
  padding: 5px 6px;
  border-radius: 0 !important;
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
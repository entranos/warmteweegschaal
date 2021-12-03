function numberWithCommas(x) {
  if (Number.isInteger(x)){return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");}
  else return Math.round(x*100)+'%';
}


// ------------------ UTILITY FUNCTIONS
function addProps(obj, arr, val) {
  if (typeof arr == 'string')
      arr = arr.split(".");
  obj[arr[0]] = obj[arr[0]] || {};
  var tmpObj = obj[arr[0]];
  if (arr.length > 1) {
      arr.shift();
      addProps(tmpObj, arr, val);
  }
  else
      obj[arr[0]] = val;
  return obj;
}

function PMT(ir, np, pv, fv, type) {
  /*
   * ir   - interest rate per month
   * np   - number of periods (months)
   * pv   - present value
   * fv   - future value
   * type - when the payments are due:
   *        0: end of the period, e.g. end of month (default)
   *        1: beginning of period
   */
  var pmt, pvif;

  fv || (fv = 0);
  type || (type = 0);

  if (ir === 0)
      return -(pv + fv)/np;

  pvif = Math.pow(1 + ir, np);
  pmt = - ir * pv * (pvif + fv) / (pvif - 1);

  if (type === 1)
      pmt /= (1 + ir);

  return pmt;
}

function createTable(tableData) {
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.body.appendChild(table);
}

//textwrapper
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this);
    var words = text.text()
      .split(/\s+/)
      .reverse();
    var word;
    var line = [];
    var lineHeight = 1.3;
    var y = 0 //text.attr("y");
    var x = 0;
    var dy = parseFloat(text.attr("dy"));
    var dx = parseFloat(text.attr("dx"));
    var tspan = text.text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node()
        .getComputedTextLength() > width - x) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
          .attr("id", "tempmessage")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .attr("dx",function(){if (dx > 0){return dx + "em";} else return 0+"em";}) 
          .text(word);
      }
    }
  });
}

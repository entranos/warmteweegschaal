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

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

//x: x-coordinate
//y: y-coordinate
//w: width
//h: height
//r: corner radius
//tl: top_left rounded?
//tr: top_right rounded?
//bl: bottom_left rounded?
//br: bottom_right rounded?

function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
    var retval;
    retval  = "M" + (x + r) + "," + y;
    retval += "h" + (w - 2*r);
    if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
    else { retval += "h" + r; retval += "v" + r; }
    retval += "v" + (h - 2*r);
    if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
    else { retval += "v" + r; retval += "h" + -r; }
    retval += "h" + (2*r - w);
    if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
    else { retval += "h" + -r; retval += "v" + -r; }
    retval += "v" + (2*r - h);
    if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
    else { retval += "v" + -r; retval += "h" + r; }
    retval += "z";
    return retval;
}

function getStyle(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
      return (function(value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}

function clearBox(elementID)
{
    document.getElementById(elementID).innerHTML = "";
}

function SmoothVerticalScrolling(e, time, where) {
            var eTop = e.getBoundingClientRect().top;
            var eAmt = eTop / 100;
            var curTime = 0;
            while (curTime <= time) {
                window.setTimeout(SVS_B, curTime, eAmt, where);
                curTime += time / 100;
            }
        }
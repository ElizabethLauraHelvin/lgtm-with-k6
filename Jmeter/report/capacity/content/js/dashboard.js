/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9875478927203065, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http://127.0.0.1:8080/favicon.ico"], "isController": false}, {"data": [0.9484126984126984, 500, 1500, "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap"], "isController": false}, {"data": [0.9959677419354839, 500, 1500, "http://127.0.0.1:8080/api/auth/login"], "isController": false}, {"data": [0.9918032786885246, 500, 1500, "http://127.0.0.1:8080/api/auth/me"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/app.js"], "isController": false}, {"data": [0.9841269841269841, 500, 1500, "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2"], "isController": false}, {"data": [0.998015873015873, 500, 1500, "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jD-iNM8.woff2"], "isController": false}, {"data": [0.9823008849557522, 500, 1500, "http://127.0.0.1:8080/api/orders"], "isController": false}, {"data": [0.992, 500, 1500, "http://127.0.0.1:8080/api/products"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/style.css"], "isController": false}, {"data": [0.9821428571428571, 500, 1500, "https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2"], "isController": false}, {"data": [0.9801587301587301, 500, 1500, "http://127.0.0.1:8080/"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2610, 0, 0.0, 62.2877394636016, 0, 5449, 10.5, 107.0, 192.0, 919.8999999999987, 25.651105651105652, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["http://127.0.0.1:8080/favicon.ico", 237, 0, 0.0, 13.261603375527429, 1, 211, 6.0, 30.200000000000017, 52.099999999999994, 125.24000000000001, 2.336057090475393, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap", 252, 0, 0.0, 212.45634920634916, 0, 5449, 22.0, 103.90000000000012, 1001.0999999999997, 5021.759999999999, 2.4854031876282154, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/auth/login", 124, 0, 0.0, 117.02419354838716, 76, 1274, 100.5, 136.0, 200.75, 1049.0, 1.237339719602854, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/auth/me", 122, 0, 0.0, 47.72131147540985, 5, 911, 14.0, 82.90000000000005, 234.09999999999997, 891.6799999999996, 1.217722858255063, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/app.js", 252, 0, 0.0, 17.02777777777778, 0, 259, 11.0, 47.70000000000002, 68.69999999999999, 120.88, 2.4851335759297064, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2", 252, 0, 0.0, 71.7579365079365, 0, 921, 15.5, 194.10000000000005, 395.4, 774.7799999999997, 2.4850845619052313, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jD-iNM8.woff2", 252, 0, 0.0, 41.46825396825398, 0, 575, 16.5, 119.90000000000012, 245.09999999999997, 404.5399999999999, 2.486457685818311, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/orders", 113, 0, 0.0, 59.02654867256635, 6, 1513, 14.0, 88.00000000000009, 131.19999999999993, 1485.28, 1.1612014838716307, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/products", 250, 0, 0.0, 52.012000000000015, 3, 1097, 14.0, 117.50000000000003, 220.1499999999997, 805.9100000000051, 2.4739003512938496, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/style.css", 252, 0, 0.0, 12.845238095238097, 0, 119, 8.0, 37.0, 51.349999999999994, 95.94, 2.4850845619052313, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2", 252, 0, 0.0, 71.18650793650792, 0, 855, 16.0, 227.00000000000017, 391.19999999999993, 692.99, 2.4851580836669886, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/", 252, 0, 0.0, 47.1547619047619, 1, 1134, 4.0, 22.700000000000017, 227.39999999999986, 1064.32, 2.4851335759297064, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2610, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

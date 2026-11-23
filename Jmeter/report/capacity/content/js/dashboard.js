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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http://127.0.0.1:8080/favicon.ico"], "isController": false}, {"data": [1.0, 500, 1500, "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/api/auth/login"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/api/auth/me"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/app.js"], "isController": false}, {"data": [1.0, 500, 1500, "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2"], "isController": false}, {"data": [1.0, 500, 1500, "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jD-iNM8.woff2"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/api/orders"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/api/products"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/style.css"], "isController": false}, {"data": [1.0, 500, 1500, "https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2"], "isController": false}, {"data": [1.0, 500, 1500, "http://127.0.0.1:8080/"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 113, 0, 0.0, 15.106194690265488, 0, 79, 6.0, 42.0, 65.09999999999995, 78.86, 4.551129727334971, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["http://127.0.0.1:8080/favicon.ico", 11, 0, 0.0, 2.7272727272727266, 1, 5, 3.0, 4.800000000000001, 5.0, 5.0, 0.4459399197308145, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap", 11, 0, 0.0, 16.636363636363637, 0, 45, 22.0, 43.2, 45.0, 45.0, 0.4451639012545528, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/auth/login", 5, 0, 0.0, 77.8, 77, 79, 78.0, 79.0, 79.0, 79.0, 0.21465676383462845, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/auth/me", 5, 0, 0.0, 7.2, 6, 10, 7.0, 10.0, 10.0, 10.0, 0.21529452290733725, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/app.js", 11, 0, 0.0, 10.545454545454547, 0, 42, 10.0, 37.80000000000001, 42.0, 42.0, 0.44512787309809, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2", 11, 0, 0.0, 21.454545454545453, 0, 59, 32.0, 55.60000000000001, 59.0, 59.0, 0.4457230844037441, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jD-iNM8.woff2", 11, 0, 0.0, 15.363636363636365, 0, 39, 16.0, 37.800000000000004, 39.0, 39.0, 0.4463017811498357, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/orders", 4, 0, 0.0, 14.5, 13, 15, 15.0, 15.0, 15.0, 15.0, 0.23191094619666047, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/api/products", 11, 0, 0.0, 10.272727272727273, 3, 29, 6.0, 28.6, 29.0, 29.0, 0.44519993524364576, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/style.css", 11, 0, 0.0, 9.363636363636365, 0, 42, 8.0, 37.000000000000014, 42.0, 42.0, 0.4451098612066524, 0.0, 0.0], "isController": false}, {"data": ["https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2", 11, 0, 0.0, 21.636363636363637, 0, 60, 33.0, 56.40000000000001, 60.0, 60.0, 0.4457230844037441, 0.0, 0.0], "isController": false}, {"data": ["http://127.0.0.1:8080/", 11, 0, 0.0, 3.272727272727273, 1, 10, 3.0, 9.200000000000003, 10.0, 10.0, 0.444247001332741, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 113, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

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
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 6455.0, "minX": 0.0, "maxY": 8049.0, "series": [{"data": [[0.0, 6455.0], [0.1, 6455.0], [0.2, 6455.0], [0.3, 6455.0], [0.4, 6455.0], [0.5, 6455.0], [0.6, 6455.0], [0.7, 6455.0], [0.8, 6673.0], [0.9, 6673.0], [1.0, 6673.0], [1.1, 6673.0], [1.2, 6673.0], [1.3, 6673.0], [1.4, 6673.0], [1.5, 6675.0], [1.6, 6675.0], [1.7, 6675.0], [1.8, 6675.0], [1.9, 6675.0], [2.0, 6675.0], [2.1, 6675.0], [2.2, 6684.0], [2.3, 6684.0], [2.4, 6684.0], [2.5, 6684.0], [2.6, 6684.0], [2.7, 6684.0], [2.8, 6684.0], [2.9, 6684.0], [3.0, 6684.0], [3.1, 6684.0], [3.2, 6684.0], [3.3, 6684.0], [3.4, 6684.0], [3.5, 6684.0], [3.6, 6684.0], [3.7, 6687.0], [3.8, 6687.0], [3.9, 6687.0], [4.0, 6687.0], [4.1, 6687.0], [4.2, 6687.0], [4.3, 6687.0], [4.4, 6688.0], [4.5, 6688.0], [4.6, 6688.0], [4.7, 6688.0], [4.8, 6688.0], [4.9, 6688.0], [5.0, 6688.0], [5.1, 6691.0], [5.2, 6691.0], [5.3, 6691.0], [5.4, 6691.0], [5.5, 6691.0], [5.6, 6691.0], [5.7, 6691.0], [5.8, 6692.0], [5.9, 6692.0], [6.0, 6692.0], [6.1, 6692.0], [6.2, 6692.0], [6.3, 6692.0], [6.4, 6692.0], [6.5, 6692.0], [6.6, 6692.0], [6.7, 6692.0], [6.8, 6692.0], [6.9, 6692.0], [7.0, 6692.0], [7.1, 6692.0], [7.2, 6692.0], [7.3, 6692.0], [7.4, 6692.0], [7.5, 6692.0], [7.6, 6692.0], [7.7, 6692.0], [7.8, 6692.0], [7.9, 6692.0], [8.0, 6692.0], [8.1, 6692.0], [8.2, 6692.0], [8.3, 6692.0], [8.4, 6692.0], [8.5, 6692.0], [8.6, 6692.0], [8.7, 6692.0], [8.8, 6692.0], [8.9, 6692.0], [9.0, 6692.0], [9.1, 6692.0], [9.2, 6692.0], [9.3, 6692.0], [9.4, 6692.0], [9.5, 6693.0], [9.6, 6693.0], [9.7, 6693.0], [9.8, 6693.0], [9.9, 6693.0], [10.0, 6693.0], [10.1, 6693.0], [10.2, 6694.0], [10.3, 6694.0], [10.4, 6694.0], [10.5, 6694.0], [10.6, 6694.0], [10.7, 6694.0], [10.8, 6694.0], [10.9, 6694.0], [11.0, 6694.0], [11.1, 6694.0], [11.2, 6694.0], [11.3, 6694.0], [11.4, 6694.0], [11.5, 6694.0], [11.6, 6694.0], [11.7, 6694.0], [11.8, 6694.0], [11.9, 6694.0], [12.0, 6694.0], [12.1, 6694.0], [12.2, 6694.0], [12.3, 6694.0], [12.4, 6695.0], [12.5, 6695.0], [12.6, 6695.0], [12.7, 6695.0], [12.8, 6695.0], [12.9, 6695.0], [13.0, 6695.0], [13.1, 6695.0], [13.2, 6695.0], [13.3, 6695.0], [13.4, 6695.0], [13.5, 6695.0], [13.6, 6695.0], [13.7, 6695.0], [13.8, 6695.0], [13.9, 6695.0], [14.0, 6695.0], [14.1, 6695.0], [14.2, 6695.0], [14.3, 6695.0], [14.4, 6695.0], [14.5, 6695.0], [14.6, 6695.0], [14.7, 6695.0], [14.8, 6695.0], [14.9, 6695.0], [15.0, 6695.0], [15.1, 6695.0], [15.2, 6695.0], [15.3, 6696.0], [15.4, 6696.0], [15.5, 6696.0], [15.6, 6696.0], [15.7, 6696.0], [15.8, 6696.0], [15.9, 6696.0], [16.0, 6696.0], [16.1, 6696.0], [16.2, 6696.0], [16.3, 6696.0], [16.4, 6696.0], [16.5, 6696.0], [16.6, 6696.0], [16.7, 6697.0], [16.8, 6697.0], [16.9, 6697.0], [17.0, 6697.0], [17.1, 6697.0], [17.2, 6697.0], [17.3, 6697.0], [17.4, 6697.0], [17.5, 6697.0], [17.6, 6697.0], [17.7, 6697.0], [17.8, 6697.0], [17.9, 6697.0], [18.0, 6697.0], [18.1, 6697.0], [18.2, 6697.0], [18.3, 6697.0], [18.4, 6697.0], [18.5, 6697.0], [18.6, 6697.0], [18.7, 6697.0], [18.8, 6697.0], [18.9, 6701.0], [19.0, 6701.0], [19.1, 6701.0], [19.2, 6701.0], [19.3, 6701.0], [19.4, 6701.0], [19.5, 6701.0], [19.6, 6705.0], [19.7, 6705.0], [19.8, 6705.0], [19.9, 6705.0], [20.0, 6705.0], [20.1, 6705.0], [20.2, 6705.0], [20.3, 6706.0], [20.4, 6706.0], [20.5, 6706.0], [20.6, 6706.0], [20.7, 6706.0], [20.8, 6706.0], [20.9, 6706.0], [21.0, 6706.0], [21.1, 6706.0], [21.2, 6706.0], [21.3, 6706.0], [21.4, 6706.0], [21.5, 6706.0], [21.6, 6706.0], [21.7, 6706.0], [21.8, 6707.0], [21.9, 6707.0], [22.0, 6707.0], [22.1, 6707.0], [22.2, 6707.0], [22.3, 6707.0], [22.4, 6707.0], [22.5, 6707.0], [22.6, 6707.0], [22.7, 6707.0], [22.8, 6707.0], [22.9, 6707.0], [23.0, 6707.0], [23.1, 6707.0], [23.2, 6708.0], [23.3, 6708.0], [23.4, 6708.0], [23.5, 6708.0], [23.6, 6708.0], [23.7, 6708.0], [23.8, 6708.0], [23.9, 6708.0], [24.0, 6711.0], [24.1, 6711.0], [24.2, 6711.0], [24.3, 6711.0], [24.4, 6711.0], [24.5, 6711.0], [24.6, 6711.0], [24.7, 6711.0], [24.8, 6711.0], [24.9, 6711.0], [25.0, 6711.0], [25.1, 6711.0], [25.2, 6711.0], [25.3, 6711.0], [25.4, 6711.0], [25.5, 6711.0], [25.6, 6711.0], [25.7, 6711.0], [25.8, 6711.0], [25.9, 6711.0], [26.0, 6711.0], [26.1, 6712.0], [26.2, 6712.0], [26.3, 6712.0], [26.4, 6712.0], [26.5, 6712.0], [26.6, 6712.0], [26.7, 6712.0], [26.8, 6712.0], [26.9, 6715.0], [27.0, 6715.0], [27.1, 6715.0], [27.2, 6715.0], [27.3, 6715.0], [27.4, 6715.0], [27.5, 6715.0], [27.6, 6715.0], [27.7, 6715.0], [27.8, 6715.0], [27.9, 6715.0], [28.0, 6715.0], [28.1, 6715.0], [28.2, 6715.0], [28.3, 6717.0], [28.4, 6717.0], [28.5, 6717.0], [28.6, 6717.0], [28.7, 6717.0], [28.8, 6717.0], [28.9, 6717.0], [29.0, 6718.0], [29.1, 6718.0], [29.2, 6718.0], [29.3, 6718.0], [29.4, 6718.0], [29.5, 6718.0], [29.6, 6718.0], [29.7, 6718.0], [29.8, 6718.0], [29.9, 6718.0], [30.0, 6718.0], [30.1, 6718.0], [30.2, 6718.0], [30.3, 6718.0], [30.4, 6718.0], [30.5, 6719.0], [30.6, 6719.0], [30.7, 6719.0], [30.8, 6719.0], [30.9, 6719.0], [31.0, 6719.0], [31.1, 6719.0], [31.2, 6719.0], [31.3, 6719.0], [31.4, 6719.0], [31.5, 6719.0], [31.6, 6719.0], [31.7, 6719.0], [31.8, 6719.0], [31.9, 6721.0], [32.0, 6721.0], [32.1, 6721.0], [32.2, 6721.0], [32.3, 6721.0], [32.4, 6721.0], [32.5, 6721.0], [32.6, 6721.0], [32.7, 6723.0], [32.8, 6723.0], [32.9, 6723.0], [33.0, 6723.0], [33.1, 6723.0], [33.2, 6723.0], [33.3, 6723.0], [33.4, 6724.0], [33.5, 6724.0], [33.6, 6724.0], [33.7, 6724.0], [33.8, 6724.0], [33.9, 6724.0], [34.0, 6724.0], [34.1, 6724.0], [34.2, 6724.0], [34.3, 6724.0], [34.4, 6724.0], [34.5, 6724.0], [34.6, 6724.0], [34.7, 6724.0], [34.8, 6725.0], [34.9, 6725.0], [35.0, 6725.0], [35.1, 6725.0], [35.2, 6725.0], [35.3, 6725.0], [35.4, 6725.0], [35.5, 6725.0], [35.6, 6725.0], [35.7, 6725.0], [35.8, 6725.0], [35.9, 6725.0], [36.0, 6725.0], [36.1, 6725.0], [36.2, 6725.0], [36.3, 6726.0], [36.4, 6726.0], [36.5, 6726.0], [36.6, 6726.0], [36.7, 6726.0], [36.8, 6726.0], [36.9, 6726.0], [37.0, 6728.0], [37.1, 6728.0], [37.2, 6728.0], [37.3, 6728.0], [37.4, 6728.0], [37.5, 6728.0], [37.6, 6728.0], [37.7, 6728.0], [37.8, 6728.0], [37.9, 6728.0], [38.0, 6728.0], [38.1, 6728.0], [38.2, 6728.0], [38.3, 6728.0], [38.4, 6728.0], [38.5, 6729.0], [38.6, 6729.0], [38.7, 6729.0], [38.8, 6729.0], [38.9, 6729.0], [39.0, 6729.0], [39.1, 6729.0], [39.2, 6731.0], [39.3, 6731.0], [39.4, 6731.0], [39.5, 6731.0], [39.6, 6731.0], [39.7, 6731.0], [39.8, 6731.0], [39.9, 6735.0], [40.0, 6735.0], [40.1, 6735.0], [40.2, 6735.0], [40.3, 6735.0], [40.4, 6735.0], [40.5, 6735.0], [40.6, 6738.0], [40.7, 6738.0], [40.8, 6738.0], [40.9, 6738.0], [41.0, 6738.0], [41.1, 6738.0], [41.2, 6738.0], [41.3, 6738.0], [41.4, 6740.0], [41.5, 6740.0], [41.6, 6740.0], [41.7, 6740.0], [41.8, 6740.0], [41.9, 6740.0], [42.0, 6740.0], [42.1, 6741.0], [42.2, 6741.0], [42.3, 6741.0], [42.4, 6741.0], [42.5, 6741.0], [42.6, 6741.0], [42.7, 6741.0], [42.8, 6742.0], [42.9, 6742.0], [43.0, 6742.0], [43.1, 6742.0], [43.2, 6742.0], [43.3, 6742.0], [43.4, 6742.0], [43.5, 6744.0], [43.6, 6744.0], [43.7, 6744.0], [43.8, 6744.0], [43.9, 6744.0], [44.0, 6744.0], [44.1, 6744.0], [44.2, 6744.0], [44.3, 6745.0], [44.4, 6745.0], [44.5, 6745.0], [44.6, 6745.0], [44.7, 6745.0], [44.8, 6745.0], [44.9, 6745.0], [45.0, 6747.0], [45.1, 6747.0], [45.2, 6747.0], [45.3, 6747.0], [45.4, 6747.0], [45.5, 6747.0], [45.6, 6747.0], [45.7, 6750.0], [45.8, 6750.0], [45.9, 6750.0], [46.0, 6750.0], [46.1, 6750.0], [46.2, 6750.0], [46.3, 6750.0], [46.4, 6750.0], [46.5, 6750.0], [46.6, 6750.0], [46.7, 6750.0], [46.8, 6750.0], [46.9, 6750.0], [47.0, 6750.0], [47.1, 6750.0], [47.2, 6756.0], [47.3, 6756.0], [47.4, 6756.0], [47.5, 6756.0], [47.6, 6756.0], [47.7, 6756.0], [47.8, 6756.0], [47.9, 6765.0], [48.0, 6765.0], [48.1, 6765.0], [48.2, 6765.0], [48.3, 6765.0], [48.4, 6765.0], [48.5, 6765.0], [48.6, 6766.0], [48.7, 6766.0], [48.8, 6766.0], [48.9, 6766.0], [49.0, 6766.0], [49.1, 6766.0], [49.2, 6766.0], [49.3, 6770.0], [49.4, 6770.0], [49.5, 6770.0], [49.6, 6770.0], [49.7, 6770.0], [49.8, 6770.0], [49.9, 6770.0], [50.0, 6770.0], [50.1, 6771.0], [50.2, 6771.0], [50.3, 6771.0], [50.4, 6771.0], [50.5, 6771.0], [50.6, 6771.0], [50.7, 6771.0], [50.8, 6771.0], [50.9, 6771.0], [51.0, 6771.0], [51.1, 6771.0], [51.2, 6771.0], [51.3, 6771.0], [51.4, 6771.0], [51.5, 6773.0], [51.6, 6773.0], [51.7, 6773.0], [51.8, 6773.0], [51.9, 6773.0], [52.0, 6773.0], [52.1, 6773.0], [52.2, 6780.0], [52.3, 6780.0], [52.4, 6780.0], [52.5, 6780.0], [52.6, 6780.0], [52.7, 6780.0], [52.8, 6780.0], [52.9, 6781.0], [53.0, 6781.0], [53.1, 6781.0], [53.2, 6781.0], [53.3, 6781.0], [53.4, 6781.0], [53.5, 6781.0], [53.6, 6781.0], [53.7, 6783.0], [53.8, 6783.0], [53.9, 6783.0], [54.0, 6783.0], [54.1, 6783.0], [54.2, 6783.0], [54.3, 6783.0], [54.4, 6786.0], [54.5, 6786.0], [54.6, 6786.0], [54.7, 6786.0], [54.8, 6786.0], [54.9, 6786.0], [55.0, 6786.0], [55.1, 6786.0], [55.2, 6786.0], [55.3, 6786.0], [55.4, 6786.0], [55.5, 6786.0], [55.6, 6786.0], [55.7, 6786.0], [55.8, 6788.0], [55.9, 6788.0], [56.0, 6788.0], [56.1, 6788.0], [56.2, 6788.0], [56.3, 6788.0], [56.4, 6788.0], [56.5, 6788.0], [56.6, 6792.0], [56.7, 6792.0], [56.8, 6792.0], [56.9, 6792.0], [57.0, 6792.0], [57.1, 6792.0], [57.2, 6792.0], [57.3, 6798.0], [57.4, 6798.0], [57.5, 6798.0], [57.6, 6798.0], [57.7, 6798.0], [57.8, 6798.0], [57.9, 6798.0], [58.0, 6799.0], [58.1, 6799.0], [58.2, 6799.0], [58.3, 6799.0], [58.4, 6799.0], [58.5, 6799.0], [58.6, 6799.0], [58.7, 6801.0], [58.8, 6801.0], [58.9, 6801.0], [59.0, 6801.0], [59.1, 6801.0], [59.2, 6801.0], [59.3, 6801.0], [59.4, 6801.0], [59.5, 6801.0], [59.6, 6801.0], [59.7, 6801.0], [59.8, 6801.0], [59.9, 6801.0], [60.0, 6801.0], [60.1, 6801.0], [60.2, 6816.0], [60.3, 6816.0], [60.4, 6816.0], [60.5, 6816.0], [60.6, 6816.0], [60.7, 6816.0], [60.8, 6816.0], [60.9, 6816.0], [61.0, 6816.0], [61.1, 6816.0], [61.2, 6816.0], [61.3, 6816.0], [61.4, 6816.0], [61.5, 6816.0], [61.6, 6835.0], [61.7, 6835.0], [61.8, 6835.0], [61.9, 6835.0], [62.0, 6835.0], [62.1, 6835.0], [62.2, 6835.0], [62.3, 6835.0], [62.4, 6839.0], [62.5, 6839.0], [62.6, 6839.0], [62.7, 6839.0], [62.8, 6839.0], [62.9, 6839.0], [63.0, 6839.0], [63.1, 6841.0], [63.2, 6841.0], [63.3, 6841.0], [63.4, 6841.0], [63.5, 6841.0], [63.6, 6841.0], [63.7, 6841.0], [63.8, 6843.0], [63.9, 6843.0], [64.0, 6843.0], [64.1, 6843.0], [64.2, 6843.0], [64.3, 6843.0], [64.4, 6843.0], [64.5, 6857.0], [64.6, 6857.0], [64.7, 6857.0], [64.8, 6857.0], [64.9, 6857.0], [65.0, 6857.0], [65.1, 6857.0], [65.2, 6857.0], [65.3, 6867.0], [65.4, 6867.0], [65.5, 6867.0], [65.6, 6867.0], [65.7, 6867.0], [65.8, 6867.0], [65.9, 6867.0], [66.0, 6871.0], [66.1, 6871.0], [66.2, 6871.0], [66.3, 6871.0], [66.4, 6871.0], [66.5, 6871.0], [66.6, 6871.0], [66.7, 6885.0], [66.8, 6885.0], [66.9, 6885.0], [67.0, 6885.0], [67.1, 6885.0], [67.2, 6885.0], [67.3, 6885.0], [67.4, 6885.0], [67.5, 6885.0], [67.6, 6885.0], [67.7, 6885.0], [67.8, 6885.0], [67.9, 6885.0], [68.0, 6885.0], [68.1, 6885.0], [68.2, 6894.0], [68.3, 6894.0], [68.4, 6894.0], [68.5, 6894.0], [68.6, 6894.0], [68.7, 6894.0], [68.8, 6894.0], [68.9, 6900.0], [69.0, 6900.0], [69.1, 6900.0], [69.2, 6900.0], [69.3, 6900.0], [69.4, 6900.0], [69.5, 6900.0], [69.6, 6907.0], [69.7, 6907.0], [69.8, 6907.0], [69.9, 6907.0], [70.0, 6907.0], [70.1, 6907.0], [70.2, 6907.0], [70.3, 6917.0], [70.4, 6917.0], [70.5, 6917.0], [70.6, 6917.0], [70.7, 6917.0], [70.8, 6917.0], [70.9, 6917.0], [71.0, 6917.0], [71.1, 6918.0], [71.2, 6918.0], [71.3, 6918.0], [71.4, 6918.0], [71.5, 6918.0], [71.6, 6918.0], [71.7, 6918.0], [71.8, 6926.0], [71.9, 6926.0], [72.0, 6926.0], [72.1, 6926.0], [72.2, 6926.0], [72.3, 6926.0], [72.4, 6926.0], [72.5, 6930.0], [72.6, 6930.0], [72.7, 6930.0], [72.8, 6930.0], [72.9, 6930.0], [73.0, 6930.0], [73.1, 6930.0], [73.2, 6931.0], [73.3, 6931.0], [73.4, 6931.0], [73.5, 6931.0], [73.6, 6931.0], [73.7, 6931.0], [73.8, 6931.0], [73.9, 6931.0], [74.0, 6934.0], [74.1, 6934.0], [74.2, 6934.0], [74.3, 6934.0], [74.4, 6934.0], [74.5, 6934.0], [74.6, 6934.0], [74.7, 6936.0], [74.8, 6936.0], [74.9, 6936.0], [75.0, 6936.0], [75.1, 6936.0], [75.2, 6936.0], [75.3, 6936.0], [75.4, 6940.0], [75.5, 6940.0], [75.6, 6940.0], [75.7, 6940.0], [75.8, 6940.0], [75.9, 6940.0], [76.0, 6940.0], [76.1, 6952.0], [76.2, 6952.0], [76.3, 6952.0], [76.4, 6952.0], [76.5, 6952.0], [76.6, 6952.0], [76.7, 6952.0], [76.8, 6952.0], [76.9, 6964.0], [77.0, 6964.0], [77.1, 6964.0], [77.2, 6964.0], [77.3, 6964.0], [77.4, 6964.0], [77.5, 6964.0], [77.6, 6969.0], [77.7, 6969.0], [77.8, 6969.0], [77.9, 6969.0], [78.0, 6969.0], [78.1, 6969.0], [78.2, 6969.0], [78.3, 6972.0], [78.4, 6972.0], [78.5, 6972.0], [78.6, 6972.0], [78.7, 6972.0], [78.8, 6972.0], [78.9, 6972.0], [79.0, 6983.0], [79.1, 6983.0], [79.2, 6983.0], [79.3, 6983.0], [79.4, 6983.0], [79.5, 6983.0], [79.6, 6983.0], [79.7, 6983.0], [79.8, 6987.0], [79.9, 6987.0], [80.0, 6987.0], [80.1, 6987.0], [80.2, 6987.0], [80.3, 6987.0], [80.4, 6987.0], [80.5, 6989.0], [80.6, 6989.0], [80.7, 6989.0], [80.8, 6989.0], [80.9, 6989.0], [81.0, 6989.0], [81.1, 6989.0], [81.2, 6994.0], [81.3, 6994.0], [81.4, 6994.0], [81.5, 6994.0], [81.6, 6994.0], [81.7, 6994.0], [81.8, 6994.0], [81.9, 7001.0], [82.0, 7001.0], [82.1, 7001.0], [82.2, 7001.0], [82.3, 7001.0], [82.4, 7001.0], [82.5, 7001.0], [82.6, 7001.0], [82.7, 7014.0], [82.8, 7014.0], [82.9, 7014.0], [83.0, 7014.0], [83.1, 7014.0], [83.2, 7014.0], [83.3, 7014.0], [83.4, 7037.0], [83.5, 7037.0], [83.6, 7037.0], [83.7, 7037.0], [83.8, 7037.0], [83.9, 7037.0], [84.0, 7037.0], [84.1, 7048.0], [84.2, 7048.0], [84.3, 7048.0], [84.4, 7048.0], [84.5, 7048.0], [84.6, 7048.0], [84.7, 7048.0], [84.8, 7069.0], [84.9, 7069.0], [85.0, 7069.0], [85.1, 7069.0], [85.2, 7069.0], [85.3, 7069.0], [85.4, 7069.0], [85.5, 7069.0], [85.6, 7071.0], [85.7, 7071.0], [85.8, 7071.0], [85.9, 7071.0], [86.0, 7071.0], [86.1, 7071.0], [86.2, 7071.0], [86.3, 7087.0], [86.4, 7087.0], [86.5, 7087.0], [86.6, 7087.0], [86.7, 7087.0], [86.8, 7087.0], [86.9, 7087.0], [87.0, 7097.0], [87.1, 7097.0], [87.2, 7097.0], [87.3, 7097.0], [87.4, 7097.0], [87.5, 7097.0], [87.6, 7097.0], [87.7, 7125.0], [87.8, 7125.0], [87.9, 7125.0], [88.0, 7125.0], [88.1, 7125.0], [88.2, 7125.0], [88.3, 7125.0], [88.4, 7125.0], [88.5, 7126.0], [88.6, 7126.0], [88.7, 7126.0], [88.8, 7126.0], [88.9, 7126.0], [89.0, 7126.0], [89.1, 7126.0], [89.2, 7150.0], [89.3, 7150.0], [89.4, 7150.0], [89.5, 7150.0], [89.6, 7150.0], [89.7, 7150.0], [89.8, 7150.0], [89.9, 7162.0], [90.0, 7162.0], [90.1, 7162.0], [90.2, 7162.0], [90.3, 7162.0], [90.4, 7162.0], [90.5, 7162.0], [90.6, 7177.0], [90.7, 7177.0], [90.8, 7177.0], [90.9, 7177.0], [91.0, 7177.0], [91.1, 7177.0], [91.2, 7177.0], [91.3, 7177.0], [91.4, 7178.0], [91.5, 7178.0], [91.6, 7178.0], [91.7, 7178.0], [91.8, 7178.0], [91.9, 7178.0], [92.0, 7178.0], [92.1, 7182.0], [92.2, 7182.0], [92.3, 7182.0], [92.4, 7182.0], [92.5, 7182.0], [92.6, 7182.0], [92.7, 7182.0], [92.8, 7191.0], [92.9, 7191.0], [93.0, 7191.0], [93.1, 7191.0], [93.2, 7191.0], [93.3, 7191.0], [93.4, 7191.0], [93.5, 7208.0], [93.6, 7208.0], [93.7, 7208.0], [93.8, 7208.0], [93.9, 7208.0], [94.0, 7208.0], [94.1, 7208.0], [94.2, 7208.0], [94.3, 7259.0], [94.4, 7259.0], [94.5, 7259.0], [94.6, 7259.0], [94.7, 7259.0], [94.8, 7259.0], [94.9, 7259.0], [95.0, 7262.0], [95.1, 7262.0], [95.2, 7262.0], [95.3, 7262.0], [95.4, 7262.0], [95.5, 7262.0], [95.6, 7262.0], [95.7, 7264.0], [95.8, 7264.0], [95.9, 7264.0], [96.0, 7264.0], [96.1, 7264.0], [96.2, 7264.0], [96.3, 7264.0], [96.4, 7280.0], [96.5, 7280.0], [96.6, 7280.0], [96.7, 7280.0], [96.8, 7280.0], [96.9, 7280.0], [97.0, 7280.0], [97.1, 7280.0], [97.2, 7314.0], [97.3, 7314.0], [97.4, 7314.0], [97.5, 7314.0], [97.6, 7314.0], [97.7, 7314.0], [97.8, 7314.0], [97.9, 7329.0], [98.0, 7329.0], [98.1, 7329.0], [98.2, 7329.0], [98.3, 7329.0], [98.4, 7329.0], [98.5, 7329.0], [98.6, 7373.0], [98.7, 7373.0], [98.8, 7373.0], [98.9, 7373.0], [99.0, 7373.0], [99.1, 7373.0], [99.2, 7373.0], [99.3, 8049.0], [99.4, 8049.0], [99.5, 8049.0], [99.6, 8049.0], [99.7, 8049.0], [99.8, 8049.0], [99.9, 8049.0], [100.0, 8049.0]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 6400.0, "maxY": 55.0, "series": [{"data": [[6600.0, 25.0], [6400.0, 1.0], [6700.0, 55.0], [6800.0, 14.0], [6900.0, 18.0], [7000.0, 8.0], [7100.0, 8.0], [7300.0, 3.0], [7200.0, 5.0], [8000.0, 1.0]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 8000.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 138.0, "minX": 2.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 138.0, "series": [{"data": [], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 138.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 2.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 0.0, "minX": 1.79533068E12, "maxY": 4.9E-324, "series": [{"data": [[1.7953308E12, 0.0], [1.79533086E12, 0.0], [1.79533068E12, 0.0], [1.79533074E12, 0.0], [1.79533092E12, 0.0]], "isOverall": false, "label": "checkout_browser", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79533092E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 6850.543478260868, "minX": 0.0, "maxY": 6850.543478260868, "series": [{"data": [[0.0, 6850.543478260868]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}, {"data": [[0.0, 6850.543478260868]], "isOverall": false, "label": "K6 Browser - Product Iteration-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 4.9E-324, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 0.0, "minX": 1.79533068E12, "maxY": 4.9E-324, "series": [{"data": [[1.7953308E12, 0.0], [1.79533086E12, 0.0], [1.79533068E12, 0.0], [1.79533074E12, 0.0], [1.79533092E12, 0.0]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.7953308E12, 0.0], [1.79533086E12, 0.0], [1.79533068E12, 0.0], [1.79533074E12, 0.0], [1.79533092E12, 0.0]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79533092E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 6694.2, "minX": 1.79533068E12, "maxY": 7017.4736842105285, "series": [{"data": [[1.7953308E12, 6714.913043478261], [1.79533086E12, 6755.86046511628], [1.79533068E12, 6698.4], [1.79533074E12, 6694.2], [1.79533092E12, 7017.4736842105285]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79533092E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 0.0, "minX": 1.79533068E12, "maxY": 4.9E-324, "series": [{"data": [[1.7953308E12, 0.0], [1.79533086E12, 0.0], [1.79533068E12, 0.0], [1.79533074E12, 0.0], [1.79533092E12, 0.0]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79533092E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 0.0, "minX": 1.79533068E12, "maxY": 4.9E-324, "series": [{"data": [[1.7953308E12, 0.0], [1.79533086E12, 0.0], [1.79533068E12, 0.0], [1.79533074E12, 0.0], [1.79533092E12, 0.0]], "isOverall": false, "label": "K6 Browser - Product Iteration", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79533092E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 6455.0, "minX": 1.79533068E12, "maxY": 8049.0, "series": [{"data": [[1.7953308E12, 6816.0], [1.79533086E12, 6940.0], [1.79533068E12, 6718.0], [1.79533074E12, 6711.0], [1.79533092E12, 8049.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.7953308E12, 6744.2], [1.79533086E12, 6837.4], [1.79533068E12, 6718.0], [1.79533074E12, 6709.5], [1.79533092E12, 7267.2]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.7953308E12, 6816.0], [1.79533086E12, 6940.0], [1.79533068E12, 6718.0], [1.79533074E12, 6711.0], [1.79533092E12, 8049.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.7953308E12, 6802.2], [1.79533086E12, 6885.0], [1.79533068E12, 6718.0], [1.79533074E12, 6711.0], [1.79533092E12, 7333.4]], "isOverall": false, "label": "95th percentile", "isController": false}, {"data": [[1.7953308E12, 6673.0], [1.79533086E12, 6455.0], [1.79533068E12, 6675.0], [1.79533074E12, 6684.0], [1.79533092E12, 6694.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.7953308E12, 6708.0], [1.79533086E12, 6750.0], [1.79533068E12, 6694.0], [1.79533074E12, 6693.0], [1.79533092E12, 6983.0]], "isOverall": false, "label": "Median", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79533092E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 6731.0, "minX": 1.0, "maxY": 6983.0, "series": [{"data": [[1.0, 6731.0], [2.0, 6892.5], [3.0, 6983.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 3.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 0.0, "minX": 1.0, "maxY": 4.9E-324, "series": [{"data": [[1.0, 0.0], [2.0, 0.0], [3.0, 0.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 3.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 0.1, "minX": 1.79533068E12, "maxY": 0.8166666666666667, "series": [{"data": [[1.7953308E12, 0.4166666666666667], [1.79533086E12, 0.7833333333333333], [1.79533068E12, 0.1], [1.79533074E12, 0.18333333333333332], [1.79533092E12, 0.8166666666666667]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79533092E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 0.08333333333333333, "minX": 1.79533068E12, "maxY": 0.95, "series": [{"data": [[1.7953308E12, 0.38333333333333336], [1.79533086E12, 0.7166666666666667], [1.79533068E12, 0.08333333333333333], [1.79533074E12, 0.16666666666666666], [1.79533092E12, 0.95]], "isOverall": false, "label": "0", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.79533092E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 0.08333333333333333, "minX": 1.79533068E12, "maxY": 0.95, "series": [{"data": [[1.7953308E12, 0.38333333333333336], [1.79533086E12, 0.7166666666666667], [1.79533068E12, 0.08333333333333333], [1.79533074E12, 0.16666666666666666], [1.79533092E12, 0.95]], "isOverall": false, "label": "K6 Browser - Product Iteration-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79533092E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 0.08333333333333333, "minX": 1.79533068E12, "maxY": 0.95, "series": [{"data": [[1.7953308E12, 0.38333333333333336], [1.79533086E12, 0.7166666666666667], [1.79533068E12, 0.08333333333333333], [1.79533074E12, 0.16666666666666666], [1.79533092E12, 0.95]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.79533092E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 25200000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}


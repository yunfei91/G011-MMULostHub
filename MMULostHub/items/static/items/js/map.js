document.addEventListener("DOMContentLoaded", function () {                 //  DOMContentLoaded = wait html to load first then load js file to avoid cannot get element by id        

    /* ============================================== 
            Create Post Upload Image and Preview       
     =============================================== */
    document.getElementById("post_image").addEventListener("change", function (event) {     // addEventListener = see it's changes / changes = when user upload img
        const file = event.target.files[0];                 // event = user action / target = input user added / files = user chosen file / [0] = first file

        if (file) {                 // when user choose img then will run this if
            const preview = document.getElementById("image_preview");

            preview.src = URL.createObjectURL(file);                // website cannot directly preview file but need to convert into url
            preview.style.display = "block";                        // from html display:none change to block
        }
    });

    /* ====================================== 
            Create Post Upload Image        
     ====================================== */
    const mapSmall = document.getElementById("smallMap");
    const mapBig = document.getElementById("bigMap");

    const modal = document.getElementById("map_modal");
    const closeBtn = document.getElementById("close_map");

    const bigMarker = document.getElementById("bigMap_marker");
    const smallMarker = document.getElementById("smallMap_marker");

    const locationSelect = document.getElementById("post_location");

    const locationLabel = document.getElementById("location_label");

    // Coordinates for 43 areas in MMU
    const regions = [
        {
            code: "fci",
            name: "FCI Building",
            type: "rectangle",

            x1:609, y1:1294,
            x2:786, y2:1580,

            markerX: 705,
            markerY: 1432
        },

        {
            code: "fom",
            name: "FOM Building",
            type: "polygon",

            points: [
                [595,1221],
                [836,1295],
                [852,835],
            ],

            markerX: 752,
            markerY: 1124
        },

        {
            code: "faie",
            name: "FAIE Building",
            type: "polygon",

            points: [
                [626,2075],
                [671,1846],
                [801,1870],
                [792,1930],
                [898,1860],
                [936,1920],
                [833,1990],
                [903,2102],
                [833,2150],
                [770,2044],
                [756,2100],
            ],

            markerX: 778,
            markerY: 1996
        },

        {
            code: "fcm",
            name: "FCM Building",
            type: "polygon",

            points: [
                [1070,1858],
                [1191,1892],
                [1166,1969],
                [1211,2014],
                [1290,1989],
                [1342,2048],
                [1142,2192],
                [1003,2025],
            ],

            markerX: 1128,
            markerY: 2040
        },

        {
            code: "clc",
            name: "CLC",
            type: "polygon",

            points: [
                [1026,1578],
                [1096,1547],
                [1114,1594],
                [1123,1641],
                [1121,1685],
                [1112,1718],
                [1100,1756],
                [1087,1785],
                [1067,1810],
                [1008,1778],
                [1026,1740],
                [1035,1702],
                [1042,1566],
                [1031,1605]
            ],

            markerX: 1077,
            markerY: 1657
        },

        {
            code: "mph",
            name: "MPH / Annex Hall",
            type: "polygon",

            points: [
		        [1031,1466],
                [1067,1503],
                [1094,1541],
                [1056,1565],
                [1017,1571],
                [986,1526],
                [1011,1493]
                              
            ],

            markerX: 1037,
            markerY: 1526
        },

        {
            code: "misri-plaza",
            name: "Misri Plaza",
            type: "circle",

            centerX: 956,
            centerY: 1461,
            radius: 43,

            markerX: 956,
            markerY: 1461
        },

        {
            code: "rimbun-ilmu",
            name: "Rimbun Ilmu",
            type: "circle",

            centerX: 951,
            centerY: 2044,
            radius: 38,

            markerX: 951,
            markerY: 2044
        },

        {
            code: "dtc",
            name: "Dewan Tun Canselor",
            type: "rectangle",

            x1:887, y1:1172,
            x2:1062, y2:1401,

            markerX: 969,
            markerY: 1288
        },

        {
            code: "chancellery",
            name: "MMU Chancellery",
            type: "rectangle",

            x1:922, y1:103,
            x2:1061, y2:1131,

            markerX: 990,
            markerY: 1079
        },

        {
            code: "stad",
            name: "STAD Building",
            type: "polygon",

            points: [
                [780,2167],
                [1153,2212],
                [1153,2313],
                [780,2268],
            ],

            markerX: 976,
            markerY: 2253
        },

        {
            code: "ips",
            name: "IPS / ERU",
            type: "polygon",

            points: [
                [1250,1252],
                [1270,1264],
                [1176,1419],
                [1153,1408],               
            ],

            markerX: 1212,
            markerY: 1341
        },

        {
            code: "library",
            name: "Library",
            type: "polygon",

            points: [
                [862,1541],
                [948,1581],
                [930,1619],
                [921,1653],
                [923,1680],
                [927,1710],
                [936,1728],
                [936,1737],
                [858,1778],
                [840,1717],
                [831,1634]               
            ],

            markerX: 879,
            markerY: 1672
        },

        {
            code: "bakery",
            name: "Bakery",
            type: "polygon",

            points: [
                [936,1737],
                [858,1778],
                [876,1799],
                [948,1763],               
            ],

            markerX: 907,
            markerY: 1772
        },

        {
            code: "haji-tapah",
            name: "Haji Tapah",
            type: "polygon",

            points: [
                [890,1798],
                [933,1766],
                [966,1807],
                [921,1836],               
            ],

            markerX: 927,
            markerY: 1808
        },
	    
        {
            code: "deen",
            name: "Deen's Cafe",
            type: "rectangle",

            x1:1155, y1:2209,
            x2:1212, y2:2310,
            
            markerX: 1184,
            markerY: 2271
        },

        {
            code: "starbee",
            name: "Starbee",
            type: "rectangle",

            x1:1229, y1:1476,
            x2:1317, y2:1708,
            
            markerX: 1277,
            markerY: 1600
        },

        {
            code: "dapo-sahang",
            name: "Dapo Sahang",
            type: "rectangle",

           x1:1815, y1:2142,
            x2:1999, y2:2198,

            markerX: 1911,
            markerY: 2176
        },

        {
            code: "hb1",
            name: "Hostel HB1",
            type: "polygon",

            points: [
                [1857,2308],
                [1941,2306],
                [1943,2364],
                [2040,2364],
                [2040,2448],
                [1945,2448],
                [1880,2520],
                [1812,2457],
                [1862,2405],               
            ],

            markerX: 1929,
            markerY: 2409
        },
	    
        {
            code: "hb2",
            name: "Hostel HB2",
            type: "polygon",

            points: [
                [1671,2207],
                [1763,2209],
                [1761,2284],
                [1835,2277],
                [1842,2367],
                [1754,2371],
                [1684,2436],
                [1619,2367],
                [1669,2326],               
            ],

            markerX: 1727,
            markerY: 2317
        },
	    
        {
            code: "hb3",
            name: "Hostel HB3",
            type: "polygon",

            points: [
                [1391,2201],
                [1472,2201],
                [1472,2273],
                [1564,2273],
                [1567,2370],
                [1470,2367],
                [1405,2428],
                [1349,2367],
                [1391,2327],               
            ],

            markerX: 1450,
            markerY: 2310
        },
	    
        {
            code: "hb4",
            name: "Hostel HB4",
            type: "polygon",

            points: [
                [1526,1989],
                [1616,1989],
                [1616,2070],
                [1695,2146],
                [1636,2205],
                [1580,2149],
                [1522,2198],
                [1465,2135],
                [1526,2079],               
            ],

            markerX: 1578,
            markerY: 2097
        },
	    
        {
            code: "entrance-A",
            name: "MMU Entrance A",
            type: "polygon",

            points: [
                [1100,389],
                [1133,400],
                [1102,505],
                [1066,494],               
            ],

            markerX: 1103,
            markerY: 447
        },
	    
        {
            code: "entrance-B",
            name: "MMU Entrance B",
            type: "rectangle",

            x1:981, y1:2846,
            x2:1012, y2:2938,

            markerX: 996,
            markerY: 2897
        },
	    
        {
            code: "bustop-A",
            name: "Bustop Entrance A",
            type: "circle",

            centerX: 1439,
            centerY: 577,
            radius: 35,

            markerX: 1439,
            markerY: 577
        },
	    
        {
            code: "bustop-B",
            name: "Bustop Entrance B",
            type: "circle",

            centerX: 1205,
            centerY: 2942,
            radius: 39,

            markerX: 1205,
            markerY: 2942
        },
	    
        {
            code: "cyberpark",
            name: "MMU Cyberpark",
            type: "rectangle",

            x1:1397, y1:901,
            x2:1815, y2:1313,

            markerX: 1599,
            markerY: 1126
        },
	    
        {
            code: "stadium",
            name: "MMU Stadium",
            type: "polygon",

            points: [
                [1466,1382],
                [1680,1379],
                [1682,1411],
                [1857,1411],
                [1860,1670],
                [1680,1672],
                [1680,1770],
                [1466,1770],               
            ],

            markerX: 1644,
            markerY: 1561
        },
	    
        {
            code: "isc",
            name: "Indoor Sports Centre",
            type: "rectangle",

            x1:1221, y1:1722,
            x2:1345, y2:1823,

            markerX: 1289,
            markerY: 1774
        },
	    
        {
            code: "footbal",
            name: "Football Field",
            type: "polygon",

            points: [
                [305,435],
                [546,292],
                [737,616],
                [501,760],               
            ],

            markerX: 528,
            markerY: 528
        },
	    
        {
            code: "rugby",
            name: "Rugby Field",
            type: "polygon",

            points: [
                [569,279],
                [693,206],
                [886,528],
                [762,600],               
            ],

            markerX: 744,
            markerY: 416
        },
	    
        {
            code: "swimming",
            name: "Swimming Pool",
            type: "rectangle",

            x1:1387, y1:1341,
            x2:1441, y2:1478,

            markerX: 1414,
            markerY: 1415
        },
	    
        {
            code: "tennis",
            name: "Tennis Court",
            type: "rectangle",

            x1:1714, y1:1698,
            x2:1884, y2:1784,

            markerX: 1801,
            markerY: 1741
        },
	    
        {
            code: "basketball",
            name: "Basketball Court",
            type: "rectangle",

            x1:1657, y1:1927,
            x2:1770, y2:2082,

            markerX: 1716,
            markerY: 2014
        },
	    
        {
            code: "volleyball",
            name: "Volleyball Court",
            type: "polygon",

            points: [
                [1697,2407],
                [1834,2487],
                [1823,2617],
                [1688,2606],               
            ],

            markerX: 1777,
            markerY: 2542
        },

	{
            code: "badminton",
            name: "Badminton Court",
            type: "polygon",

            points: [
                [1508,2465],
                [1697,2407],
                [1688,2606],
                [1562,2604],               
            ],

            markerX: 1628,
            markerY: 2533
        },

	    
        {
            code: "archery",
            name: "Archery",
            type: "polygon",

            points: [
                [287,818],
                [213,1061],
                [478,1140],
                [550,897], 
            ],

            markerX: 389,
            markerY: 987
        },
	    
        {
            code: "edc",
            name: "Entrepreneurship Developement Center (EDC)",
            type: "rectangle",

            x1:816, y1:1319,
            x2:875, y2:1441,

            markerX: 848,
            markerY: 1385
        },
	    
        {
            code: "fmd",
            name: "Facilities Management Department (FMD)",
            type: "rectangle",

            x1:218, y1:1605,
            x2:562, y2:1736,

            markerX: 388,
            markerY: 1676
        },
	    
        {
            code: "mosque",
            name: "Mosque",
            type: "polygon",

            points: [
               	[1168,2544],
               	[1258,2481],
               	[1332,2585],
               	[1242,2648],
            ],

            markerX: 1250,
            markerY: 2560
        },
	    
        {
            code: "nea",
            name: "Non Executive Apartment (NEA)",
            type: "rectangle",

            x1:1794, y1:1923,
            x2:1997, y2:2059,

            markerX: 1893,
            markerY: 1991
        },
	    
        {
            code: "eaa",
            name: "Executive Apartment A (EAA)",
            type: "polygon",

            points: [
               	[652,2421],
               	[672,2407],
               	[652,2373],
               	[739,2326],
               	[811,2439],
               	[726,2490],
               	[701,2452],
               	[679,2468],
               
            ],

            markerX: 735,
            markerY: 2413
        },
	    
        {
            code: "eab",
            name: "Executive Apartment B (EAB)",
            type: "polygon",

            points: [
               	[1432,2711],
               	[1459,2628],
               	[1744,2724],
               	[1717,2803],
            ],

            markerX: 1582,
            markerY: 2713
        },
	    
        {
            code: "guest house",
            name: "MMU Guest House",
            type: "polygon",

            points: [
               	[714,2623],
               	[786,2664],
               	[717,2778],
               	[645,2736],
            ],

            markerX: 726,
            markerY: 2702
        },        
    ];

    // open map modal when click small map
    mapSmall.addEventListener("click", function(){
        modal.style.display = "block";
    });

    //close map modal when click close button
    closeBtn.addEventListener("click", function(){
        modal.style.display = "none";
        locationLabel.style.display = "none";       // Also close the label
    });

    /* ===============================================
                Big Map Choose Area Functions            
    ===================================================*/
    mapBig.addEventListener("click", function(event){

        const rect = mapBig.getBoundingClientRect();            // Get bigMap's position inside website

        // natural = original width | client = width inside computer/website
        const scaleX = mapBig.naturalWidth / mapBig.clientWidth;
        const scaleY = mapBig.naturalHeight / mapBig.clientHeight;

        // event = mouse click
        // count the accurate coordinate in the map
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // show inside console the accurate coordinate to add to above                                          CONSOLE
        console.log("Clicked Position:", x, y);


        /* ====================================== 
                        Marker       
        ====================================== */

        // Display Marker inside bigMap
        bigMarker.style.display = "block";
        bigMarker.style.left = (event.clientX - rect.left) + "px";
        bigMarker.style.top = (event.clientY - rect.top) + "px";

        // To make marker position in smallMap smaller bcz SmallMap
        const scaleSmallX = mapSmall.clientWidth / mapBig.clientWidth;
        const scaleSmallY = mapSmall.clientHeight / mapBig.clientHeight;
        
        // Display Marker inside smallMap
        smallMarker.style.display = "block";
        smallMarker.style.left = (event.clientX - rect.left) * scaleSmallX + "px";
        smallMarker.style.top = (event.clientY - rect.top) * scaleSmallY + "px";

        /* =================================================================== 
                Auto choose Loaction Dropdown after choosing are in Map        
        ====================================================================== */
        // location not found
        let foundLocation = false;
        
        for (let region of regions){

            // Region type = RECTANGLE | === nore accurate
            if (region.type === "rectangle"){
                if(
                    // check if selection is in between
                    x >= region.x1 && 
                    x <= region.x2 && 
                    y >= region.y1 && 
                    y <= region.y2
                ){
                    // choose inside dropdown location list
                    selectLocation(region.code);

                    // show a label above bigMap to show the location area user choose
                    locationLabel.style.display = "block";
                    locationLabel.innerText = "Selected Location: " + region.name;

                    // location found then end loop
                    foundLocation = true;
                    break;
                }
            }

            // Region type = POLYGON
            if (region.type === "polygon"){
                
                if(
                    // check point user choose is inside region or not
                    isPointInsidePolygon(
                        x,
                        y,
                        region.points
                    )
                ){
                    // auto choose location inside dropdown list
                    selectLocation(region.code);

                    // show a label above bigMap to show the lacation area name user choose
                    locationLabel.style.display = "block";
                    locationLabel.innerText = "Selected Location: " + region.name;
                    
                    // location found then end loop
                    foundLocation = true;
                    break;
                }                
            }

            // Region type = CIRCLE
            if (region.type === "circle"){

                const dx = x - region.centerX;
                const dy = y - region.centerY;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= region.radius){

                    selectLocation(region.code);

                    locationLabel.style.display = "block";
                    locationLabel.innerText = "Selected Location: " + region.name;

                    foundLocation = true;
                    break;
                }
            }
        }

        // User chosen point is not inside any location region
        if(!foundLocation){
            // show pop up
            showPopup(
                "Invalid Area",
                "This area is not assigned to any MMU places. Please choose another area or choose a location inside the dropdown list.",
                true,   // auto close
                1500
            );

           
            // auto change te dropdown list to default
            selectLocation("");

            // show a label above bigMap to show none are chosen
            locationLabel.style.display = "block";
            locationLabel.innerText = "None Location Chosen. Please choose an area again.";
        }
    });

    // auto choose dropdown location
    function selectLocation(locationCode){
        
        // load all dropdown selections
        for (let option of locationSelect.options){
            
            if (option.value === locationCode){
                option.selected = true;
                break;
            }
        }
    }

    
    /* ================================================ 
        check point is inside region area or not       
    ================================================= */
    function isPointInsidePolygon(x,y,polygon){         // x & y = user chosen point | polygon = area all coordinate
        
        let inside = false;

        for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
            // j = last point
            // loop 2 start, j take previouse i, then i +1
            let xi = polygon[i][0]; 
            let yi = polygon[i][1]; 

            let xj = polygon[j][0]; 
            let yj = polygon[j][1]; 
            
            // formula to calculate if user chosen point intersect in a certain area
            let intersect = 
                ( 
                    // check point user choose o the line or not
                    (yi > y) !== (yj > y) 
                ) 
                && 
                ( 
                    // check point user took intersect the line or not T
                    x < ( ((xj - xi) * (y - yi)) / (yj - yi) ) + xi 
                ); 
            
            if (intersect) { 
                inside = !inside; 
            }
        }

        return inside;
    }

    /* ==================================================================== 
        Choose Location form dropdown and show a marker in the smallMap        
    ======================================================================== */
    locationSelect.addEventListener("change", function(){

        // this = dropdown
        const selectedCode = this.value;

        // check all code inside regions
        for (let region of regions){

            if(region.code === selectedCode){

                placeMarkerFromRegion(region);
                break;
            }
        }

    });

    // function to put marker when selected dropdown location
    function placeMarkerFromRegion(region){

        // take coordinate from data above markerX and marker
        let centerX = region.markerX;
        let centerY = region.markerY;

        // change to smallMap coordinate to mark
        const scaleX = mapSmall.clientWidth / mapBig.naturalWidth;
        const scaleY = mapSmall.clientHeight / mapBig.naturalHeight;

        smallMarker.style.display = "block";
        smallMarker.style.left = (centerX * scaleX) + "px";
        smallMarker.style.top  = (centerY * scaleY) + "px";

    }
});
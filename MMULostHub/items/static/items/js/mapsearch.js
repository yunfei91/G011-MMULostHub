document.addEventListener("DOMContentLoaded", function () {

    const map = document.getElementById("map");
    if (!map) return;

    const regions = getRegions();

    const tooltip = document.getElementById("map-tooltip");

    const canvas = document.getElementById("map-overlay");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {

        canvas.width = map.clientWidth;
        canvas.height = map.clientHeight;

        canvas.style.width = map.clientWidth + "px";
        canvas.style.height = map.clientHeight + "px";
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    function drawRegion(region) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "blue";

        const scaleX =
            map.clientWidth / map.naturalWidth;

        const scaleY =
            map.clientHeight / map.naturalHeight;

        if (region.type === "rectangle") {

            ctx.fillRect(
                region.x1 * scaleX,
                region.y1 * scaleY,
                (region.x2 - region.x1) * scaleX,
                (region.y2 - region.y1) * scaleY
            );
        }

        if (region.type === "polygon") {

            ctx.beginPath();

            ctx.moveTo(
                region.points[0][0] * scaleX,
                region.points[0][1] * scaleY
            );

            for (let i = 1; i < region.points.length; i++) {

                ctx.lineTo(
                    region.points[i][0] * scaleX,
                    region.points[i][1] * scaleY
                );
            }

            ctx.closePath();

            ctx.fill();
        }

        if (region.type === "circle") {

            ctx.beginPath();

            ctx.arc(
                region.centerX * scaleX,
                region.centerY * scaleY,
                region.radius * scaleX,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }

    function findRegion(x, y) {

        for (let region of regions) {

            if (region.type === "rectangle") {
                if (
                    x >= region.x1 &&
                    x <= region.x2 &&
                    y >= region.y1 &&
                    y <= region.y2
                ) {
                    return region;
                }
            }

            if (region.type === "polygon") {
                if (isPointInsidePolygon(x, y, region.points)) {
                    return region;
                }
            }

            if (region.type === "circle") {

                const dx = x - region.centerX;
                const dy = y - region.centerY;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= region.radius) {
                    return region;
                }
            }
        }

        return null;
    }

    // =========================
    // LOAD FILTER FROM URL
    // =========================
    const urlParams = new URLSearchParams(window.location.search);
    const locationCode = urlParams.get("location");

    if (locationCode) {

        const region = regions.find(
            r => r.code === locationCode
        );

        if (region) {
            filterPosts(region.code, region.name);

            document.getElementById("back-btn").style.display = "block";
        }
    }

    map.addEventListener("mousemove", function (event) {

        const rect = map.getBoundingClientRect();

        const scaleX = map.naturalWidth / map.clientWidth;
        const scaleY = map.naturalHeight / map.clientHeight;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const found = findRegion(x, y);

        if (found) {

            map.style.cursor = "pointer";

            drawRegion(found);

            tooltip.style.display = "block";
            tooltip.textContent = found.name;

            tooltip.style.left =
                (event.clientX - rect.left + 15) + "px";

            tooltip.style.top =
                (event.clientY - rect.top + 15) + "px";

        } else {

            map.style.cursor = "default";
            tooltip.style.display = "none";

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    });

    map.addEventListener("mouseleave", function () {

        map.style.cursor = "default";
        tooltip.style.display = "none";

    });

    function showAllPosts() {

        const posts = document.querySelectorAll(".post");
        const noneMsg = document.getElementById("related-none-msg");

        posts.forEach(post => {
            post.style.display = "block";
        });

        noneMsg.style.display = "none";

        document.getElementById("back-btn").style.display = "none";

        const url = new URL(window.location.href);
        url.searchParams.delete("location");
        window.history.pushState({}, "", url);
    }

    // =========================
    // MAP CLICK
    // =========================
    map.addEventListener("click", function (event) {

        const rect = map.getBoundingClientRect();

        const scaleX = map.naturalWidth / map.clientWidth;
        const scaleY = map.naturalHeight / map.clientHeight;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const found = findRegion(x, y);

        if (!found) {
            showPopup("Invalid Area", "No region found", true, 1500);

            showAllPosts();
            
            return;
        }

        // =========================
        // ACTION: FILTER + URL
        // =========================
        filterPosts(found.code, found.name);
        document.getElementById("back-btn").style.display = "block";
        updateURL(found.code);
    });

    // =========================
    // FILTER POSTS
    // =========================
    function filterPosts(locationCode,locationName = locationCode) {

        isFiltered = true;

        const posts = document.querySelectorAll(".post");
        const noneMsg = document.getElementById("related-none-msg");

        let visibleCount = 0;

        posts.forEach(post => {

            const postLocation = post.dataset.location || "";

            const match =
                postLocation.toLowerCase() ===
                locationCode.toLowerCase();

            post.style.display =
                match ? "block" : "none";

            if (match) {
                visibleCount++;
            }
        });

        if (visibleCount === 0) {
            noneMsg.style.display = "block";
            noneMsg.textContent =
                `No posts in ${locationName}`;
        } else {
            noneMsg.style.display = "none";
        }

        document.getElementById("back-btn").style.display = "inline-block";
    }

    // =========================
    // UPDATE URL (?location=xxx)
    // =========================
    function updateURL(code) {
        const url = new URL(window.location.href);
        url.searchParams.set("location", code);
        window.history.pushState({}, "", url);
    }

    // =========================
    // POLYGON CHECK
    // =========================
    function isPointInsidePolygon(x, y, polygon) {

        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {

            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect =
                ((yi > y) !== (yj > y)) &&
                (x < ((xj - xi) * (y - yi)) / (yj - yi + 0.000001) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }

    // =========================
    // REGIONS DATA
    // =========================
    function getRegions() {
        return [
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

            centerX: 958,
            centerY: 1465,
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

            x1:918, y1:993,
            x2:1067, y2:1134,

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
                [1699,2470],
                [1836,2490],
                [1827,2616],
                [1687,2603],               
            ],

            markerX: 1777,
            markerY: 2542
        },

	    {
            code: "badminton",
            name: "Badminton Court",
            type: "polygon",

            points: [
                [1584,2463],
                [1699,2470],
                [1687,2603],
                [1570,2594],               
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
    ]};

});

window.showAllPosts = function () {

    const posts =
        document.querySelectorAll(".post");

    const noneMsg =
        document.getElementById("related-none-msg");

    posts.forEach(post => {
        post.style.display = "block";
    });

    noneMsg.style.display = "none";

    document.getElementById("back-btn").style.display = "block";

    const url = new URL(window.location.href);
    url.searchParams.delete("location");

    window.history.pushState({}, "", url);
};
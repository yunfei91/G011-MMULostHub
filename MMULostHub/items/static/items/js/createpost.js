function confirmCreate(event) {

    event.preventDefault();

    const form = document.querySelector("form");

    const postType = form.querySelector("[name='post_type']").value;
    const category = form.querySelector("[name='post_itemcategory']").value;
    const image = form.querySelector("[name='userposts_images']").files[0];
    const datetime = form.querySelector("[name='post_datetime']").value;
    const location = form.querySelector("[name='post_location']").value;

    if (!postType) {
        Swal.fire("Error", "Please choose Lost or Found.", "error");
        return;
    }
    if (postType === "found" && !location) {
        Swal.fire("Error", "Location is required for Found Posts.", "error");
        return;
    }

    if (!datetime) {
        Swal.fire("Error", "Please select date & time.", "error");
        return;
    }
    const selectedDate = new Date(datetime);
    const now = new Date();

    if (selectedDate > now) {
        Swal.fire("Error", "Datetime cannot be in the future.", "error");
        return;
    }
    
    if (!category) {
        Swal.fire("Error", "Please choose a category.", "error");
        return;
    }
    
    if (!image) {
        Swal.fire("Error", "Please upload an image.", "error");
        return;
    }

    Swal.fire({
        title: "CONFIRMATION",
        text: "Do you want to create this post?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed){
            form.submit();
        }
    });
}

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

            x1:620, y1:1300,
            x2:785, y2:1580,

            markerX: 705,
            markerY: 1432
        },

        {
            code: "fom",
            name: "FOM Building",
            type: "polygon",

            points: [
                [850,840],
                [605,1215],
                [835,1288],
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
        console.log(
            "natural:",
            mapBig.naturalWidth,
            mapBig.naturalHeight
        );
        console.log(
            "client:",
            mapBig.clientWidth,
            mapBig.clientHeight
        );

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
        }

        // User chosen point is not inside any location region
        if(!foundLocation){
            // show pop up
            alert("This area is not assigned to any MMU places. Please choose another area or choose a location inside the dropdown list.");
           
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

        for(
            // j = last point
            let i = 0, j = polygon.length - 1;
            i < polygon.length;
            // loop 2 start, j take previouse i, then i +1
            j = i ++
        ){
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
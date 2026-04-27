document.addEventListener("DOMContentLoaded", function () {                 //  DOMContentLoaded = wait html to load first then load js file to avoid cannot get element by id        

    document.getElementById("post_image").addEventListener("change", function (event) {     // addEventListener = see it's changes / changes = when user upload img
        const file = event.target.files[0];                 // event = user action / target = input user added / files = user chosen file / [0] = first file

        if (file) {                 // when user choose img then will run this if
            const preview = document.getElementById("image_preview");

            preview.src = URL.createObjectURL(file);                // website cannot directly preview file but need to convert into url
            preview.style.display = "block";                        // from html display:none change to block
        }
    });

    const mapSmall = document.getElementById("smallMap");
    const mapBig = document.getElementById("bigMap");

    const modal = document.getElementById("map_modal");
    const closeBtn = document.getElementById("close_map");

    const bigMarker = document.getElementById("bigMap_marker");
    const smallMarker = document.getElementById("smallMap_marker");

    const locationSelect = document.getElementById("post_location");

    const locationLabel = document.getElementById("location_label");

    const regions = [
        {
            code: "fci",
            name: "FCI Building",
            type: "rectangle",

            x1:617,y1:1296,
            x2:785,y2:1573
        },

        {
            code: "fom",
            name: "FOM Building",
            type: "polygon",

            points: [
                [420,520],
                [520,420],
                [610,720]
            ]
        },
    ];

    // open map modal
    mapSmall.addEventListener("click", function(){
        modal.style.display = "block";
    });

    //close map modal
    closeBtn.addEventListener("click", function(){
        modal.style.display = "none";
        locationLabel.style.display = "none";
    });

    //click big map
    mapBig.addEventListener("click", function(event){

        const rect = mapBig.getBoundingClientRect();

        const scaleX = mapBig.naturalWidth / mapBig.clientWidth;
        const scaleY = mapBig.naturalHeight / mapBig.clientHeight;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

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


        bigMarker.style.display = "block";
        bigMarker.style.left = (event.clientX - rect.left) + "px";
        bigMarker.style.top = (event.clientY - rect.top) + "px";

        const scaleSmallX = mapSmall.clientWidth / mapBig.clientWidth;
        const scaleSmallY = mapSmall.clientHeight / mapBig.clientHeight;

        smallMarker.style.display = "block";
        smallMarker.style.left =
            (event.clientX - rect.left) * scaleSmallX + "px";

        smallMarker.style.top =
            (event.clientY - rect.top) * scaleSmallY + "px";



        //auto detect location
        let foundLocation = false;
        
        for (let region of regions){

            //rectangle
            if (region.type === "rectangle"){
                if(
                    x >= region.x1 && 
                    x <= region.x2 && 
                    y >= region.y1 && 
                    y <= region.y2
                ){
                    selectLocation(region.code);
                    locationLabel.style.display = "block";
                    locationLabel.innerText = "Selected Location: " + region.name;

                    foundLocation = true;
                    break;
                }
            }

            //polygon
            if (region.type === "polygon"){
                
                if(
                    isPointInsidePolygon(
                        x,
                        y,
                        region.points
                    )
                ){
                    selectLocation(region.code);
                    locationLabel.style.display = "block";
                    locationLabel.innerText = "Selected Location: " + region.name;
                    
                    foundLocation = true;
                    break;
                }                
            }
        }

        //no match location found in the area
        if(!foundLocation){
            alert("This area is not assigned to any MMU places. Please choose another area.");
        }
    });

    //select dropdown
    function selectLocation(locationCode){
        
        for (let option of locationSelect.options){
            
            if (option.value === locationCode){
                option.selected = true;
                break;
            }
        }
    }

    //check point is inside area or not
    function isPointInsidePolygon(x,y,polygon){
        
        let inside = false;

        for(
            let i = 0, j = polygon.length - 1;
            i < polygon.length;
            j = i ++
        ){
            let xi = polygon[i][0]; 
            let yi = polygon[i][1]; 

            let xj = polygon[j][0]; 
            let yj = polygon[j][1]; 
            
            let intersect = 
                ( 
                    (yi > y) !== (yj > y) 
                ) 
                && 
                ( 
                    x < 
                    ( 
                        ((xj - xi) * (y - yi)) / (yj - yi) 
                    ) 
                    + xi 
                ); 
            
            if (intersect) { 
                inside = !inside; 
            }
        }

        return inside;
    }

    locationSelect.addEventListener("change", function(){

        const selectedCode = this.value;

        for (let region of regions){

            if(region.code === selectedCode){

                placeMarkerFromRegion(region);
                break;
            }
        }

    });

    function placeMarkerFromRegion(region){

        let centerX, centerY;

        // rectangle center
        if(region.type === "rectangle"){
            centerX = (region.x1 + region.x2) / 2;
            centerY = (region.y1 + region.y2) / 2;
        }

        // polygon center
        if(region.type === "polygon"){

            let sumX = 0;
            let sumY = 0;

            for(let point of region.points){
                sumX += point[0];
                sumY += point[1];
            }

            centerX = sumX / region.points.length;
            centerY = sumY / region.points.length;
        }

        // 转换到 small map
        const scaleX = mapSmall.clientWidth / mapBig.naturalWidth;
        const scaleY = mapSmall.clientHeight / mapBig.naturalHeight;

        smallMarker.style.display = "block";
        smallMarker.style.left = (centerX * scaleX) + "px";
        smallMarker.style.top  = (centerY * scaleY) + "px";

    }
});
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

    const regions = [
        {
            code: "fci",
            type: "rectangle",

            x1: 782,
            x2: 612,

            y1: 1289,
            y2: 1568,
        },

        {
            code: "fom",
            type: "polygon",

            points: [
                [841, 836],
                [599, 1211],
                [827, 1284],
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
    });

    //click big map
    mapBig.addEventListener("click", function(event){
        const rect = mapBig.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        console.log("Clicked Position:", x, y);

        //big map marker
        bigMarker.style.display = "block";
        bigMarker.style.left = x + "px";
        bigMarker.style.top = y + "px";

        //small map marker
        const scaleX = mapSmall.clientWidth / mapBig.clientWidth;
        const scaleY = mapSmall.clientHeight / mapBig.clientHeight;

        smallMarker.style.display = "block"; 
        smallMarker.style.left = (x * scaleX) + "px"; 
        smallMarker.style.top = (y * scaleY) + "px";

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

});
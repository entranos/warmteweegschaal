<!--
Bestand: Map.Svelte
Omschrijving: Kaartplots
Functies:   init_map()                          - initialiseert leaflet kaart
            draw_contextlaag()                  - plot de contextlaag (bronbudget, bebouwingsdichtheid, bouwperiode of alleen achtergrondkaart)
            window.get_color_warmtebudget_d02   - mapstyler op waarde d02
            getColor_bbdh()                     - mapstyler op waarde bebouwingsdichtheid
            getColor_leeftijd()                 - mapstyler op waarde leeftijd bebouwing
            getColor_combinatie()               - mapstyler op waarde leeftijd en bebouwingsdichtheid gecombineerd
            getClass_with_label()               - Codering op bouwjaar en bebouwingsdichtheid
            window.start_analysis()             - Initieert map plots, wordt aangeroepen na selectie van gemeente
            window.draw_buurten()               - tekent CBS buurten in op kaart
            buurtselectie_logger()              - houdt logboek bij van geselecteerde buurten. Initialiseert hercalculaties en sommaties bij verandeirngen van buurtsleectie.
Opmerkingen: -
Verbeterpotentieel: routing logischer maken
Dependencies: d3, leaflet
Auteur: Tijs Langeveld
-->
<script>
    import { onMount } from "svelte";
    import { store_input_primarydataset_raw } from "./stores.js";
    import { store_instelling_lengtetransportleiding } from "./stores.js";
    import { store_selectie_buurtcodes } from "./stores.js";
    import { store_selectie_weq } from "./stores.js";
    import { store_selectie_co2reductie } from "./stores.js";
    import { store_selectie_buurtnamen } from "./stores.js";
    import { store_instelling_mapcontextswitch } from "./stores.js";
    import { store_selectie_gemeentenaam } from "./stores.js";

    var selectie_gemeentenaam;
        store_selectie_gemeentenaam.subscribe((value) => {
        selectie_gemeentenaam = value;
    });

    var mapinit_done = false;

    onMount(() => {
        init_map(); 
    });
    
    var map;
    var plot;
    var data_gemeenten;
    
    var redIcon = L.icon({ iconUrl: "img/map_markers/marker-icon-red-2x.png", shadowUrl: "img/map_markers/marker-shadow.png", iconSize: [25, 40], shadowSize: [40, 20], iconAnchor: [13, 35], shadowAnchor: [13, 15], popupAnchor: [20, 20],});

    store_input_primarydataset_raw.subscribe((value) => { data_gemeenten = value; });

    var mapcontextswitch;
    
    store_instelling_mapcontextswitch.subscribe((value) => {
        mapcontextswitch = value;
    });

    $: change_mapcontext(mapcontextswitch);
    function change_mapcontext() {
        // console.log('mapcontextswitch: '+ mapcontextswitch)
    if (mapinit_done){switchcontextlaag(mapcontextswitch);}
    }

    function init_map() {
        map = new L.Map("map", { center: [52.0919, 5.09], zoom: 8, attributionControl: false, scrollWheelZoom: true, zoomControl: false, zoomAnimation: false });
        //init leaflet draw
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        var options = {
            position: "topright",
            draw: {
                polyline: {
                    shapeOptions: {
                        color: "red",
                        weight: 10,
                    },
                },
            },
        };

        var drawControl = new L.Control.Draw(options);

        map.addControl(drawControl);
        d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-5px");
        
        var drawresult;
        
        map.on("draw:created", function (e) {
            drawnItems.removeLayer(drawresult); 
            drawresult = e.layer;
            // Calculating the distance of the polyline
            var tempLatLng = e.layer._latlngs[0];
            var totalDistance = 0.0;
            var i;
            for (i = 0; i < e.layer._latlngs.length; i++) {
                totalDistance += tempLatLng.distanceTo(e.layer._latlngs[i]);
                tempLatLng = e.layer._latlngs[i];
            }
            store_instelling_lengtetransportleiding.update((n) => totalDistance);
            d3.select("#slider_container_transport")
                .transition()
                .duration(1500)
                .style("top", "10px");
            recalculate_all();
            drawnItems.addLayer(drawresult);
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        //panes
        map.createPane("backgroundmap");
        map.getPane("backgroundmap").style.zIndex = 0;
        map.createPane("referentienet");
        map.getPane("referentienet").style.zIndex = 200;

        var brtLayer = new L.tileLayer( "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png", { minZoom: 0, maxZoom: 20, pane: "backgroundmap" }).addTo(map);
    }

    // MT puntbronnen
    // d3.json("geojson/20200213_MT_bronnen.geojson").then(function (data, error) {
    //     map.createPane("puntbronnen");
    //     map.getPane("puntbronnen").style.zIndex = 800;

    //     var oms = new OverlappingMarkerSpiderfier(map);
    //     var popup = new L.Popup();
        
    //     oms.addListener("click", function (marker) {
    //         popup.setContent(marker.desc);
    //         popup.setLatLng(marker.getLatLng());
    //         map.openPopup(popup);
    //     });

    //     oms.addListener("spiderfy", function (markers) {
    //         map.closePopup();
    //     });

    //     for (var i = 0; i < data.features.length; i++) {
    //         var datum = data.features[i];
    //         var loc = new L.LatLng(
    //             datum.geometry.coordinates[1],
    //             datum.geometry.coordinates[0]
    //         );
    //         var marker = new L.Marker(loc, { icon: redIcon });
    //         if ( datum.properties.MWcapaciteit != null && datum.properties.MWcapaciteitn != ""){
    //             marker.desc = "<b>Naam:</b> " +
    //             datum.properties.bron_naam + "<br><b>Type:</b> " +
    //             datum.properties.type_bron + "<br><b>Vermogen:</b> " +
    //             Math.round(parseFloat(datum.properties.MWcapaciteit) * 100) / 100 + " MW";
    //         } else {
    //             marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam + "<br><b>Type:</b> " + datum.properties.type_bron +"<br><b>Vermogen: </b>onbekend";
    //         }
    //         map.addLayer(marker);
    //         oms.addMarker(marker);
    //     }
    // });

    window.draw_contextlaag= () => {
        var contextlaag_geojson = selectie_gemeentenaam + '.geojson';
        window.switchcontextlaag = (state) => {
        map.removeLayer(plot);

        if (state == 'dichtheid'){
            d3.json("startkaart/"+contextlaag_geojson).then(function (data, error) {
                map.createPane("puntbronnen");
                map.getPane("puntbronnen").style.zIndex = 300;

                plot = L.vectorGrid.slicer( data, {
                    workerCode: 'js/webworker.js',id:'puntbronnen', pane: 'puntbronnen', maxZoom: 21, tolerance: 2, extent: 8000 , buffer: 64, debug: 0, indexMaxZoom: 0, indexMaxPoints: 1000, rendererFactory: L.svg.tile,
                    vectorTileLayerStyles:{sliced: function(properties) {return {fillOpacity: 1, opacity: 1, stroke: false, fill: true,weight: 1,fillColor: getColor_bbdh(properties), color: '#000' }}},
                    interactive: true, getFeatureId: function(feature) {return feature.properties.BU_CODE;}
                }).on('click', function(e) {}).addTo(map);
                mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
            });
        }
        else if (state == 'bouwperiode'){
            d3.json("startkaart/"+contextlaag_geojson).then(function (data, error) {
                map.createPane("puntbronnen");
                map.getPane("puntbronnen").style.zIndex = 300;
                plot = L.vectorGrid.slicer( data, {
                    workerCode: 'js/webworker.js',id:'puntbronnen', pane: 'puntbronnen', maxZoom: 21, tolerance: 2, extent: 8000 , buffer: 64, debug: 0, indexMaxZoom: 0, indexMaxPoints: 1000, rendererFactory: L.svg.tile,
                    vectorTileLayerStyles:{sliced: function(properties) {return {fillOpacity: 1, opacity: 1, stroke: false, fill: true,weight: 1,fillColor: getColor_leeftijd(properties), color: '#000' }}},
                    interactive: true, getFeatureId: function(feature) {return feature.properties.BU_CODE;}
                }).on('click', function(e) {}).addTo(map);
                mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
            });
        }
        else if (state == 'combinatie'){
            d3.json("startkaart/"+contextlaag_geojson).then(function (data, error) {
                map.createPane("puntbronnen");
                map.getPane("puntbronnen").style.zIndex = 300;
                plot = L.vectorGrid.slicer( data, {
                        workerCode: 'js/webworker.js',id:'puntbronnen', pane: 'puntbronnen', maxZoom: 21, tolerance: 2, extent: 8000 , buffer: 64, debug: 0, indexMaxZoom: 0, indexMaxPoints: 1000, rendererFactory: L.svg.tile,
                        vectorTileLayerStyles:{sliced: function(properties) {return {fillOpacity: 1, opacity: 1, stroke: false, fill: true,weight: 1,fillColor: getColor_combinatie(properties), color: '#000' }}},
                        interactive: true, getFeatureId: function(feature) {return feature.properties.BU_CODE;}
                    }).on('click', function(e) {}).addTo(map);
                mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
            });
        }
        else if (state == 'd02'){
            map.createPane("puntbronnen");
            map.getPane("puntbronnen").style.zIndex = 300;
            plot = L.vectorGrid.slicer( data, {
                workerCode: 'js/webworker.js',id:'puntbronnen', pane: 'puntbronnen', maxZoom: 21, tolerance: 2, extent: 8000 , buffer: 64, debug: 0, indexMaxZoom: 0, indexMaxPoints: 1000, rendererFactory: L.svg.tile,
                vectorTileLayerStyles:{sliced: function(properties) {return {fillOpacity: 1, opacity: 1, stroke: false, fill: true,weight: 1,fillColor: get_color_warmtebudget_d02(properties.D02), color: '#000' }}},
                interactive: true, getFeatureId: function(feature) {return feature.properties.BU_CODE;}
            }).on('click', function(e) {}).addTo(map);
            mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
        }
        else {
            //do nothing
        }    
    }
    // plot contextlaag
    d3.json("startkaart/"+contextlaag_geojson).then(function (data, error) {
        map.createPane("puntbronnen");
        map.getPane("puntbronnen").style.zIndex = 300;
        plot = L.vectorGrid.slicer( data, {
            workerCode: 'js/webworker.js',id:'puntbronnen', pane: 'puntbronnen', maxZoom: 21, tolerance: 2, extent: 8000 , buffer: 64, debug: 0, indexMaxZoom: 0, indexMaxPoints: 1000, rendererFactory: L.svg.tile,
            vectorTileLayerStyles:{sliced: function(properties) {return {fillOpacity: 1, opacity: 1, stroke: false, fill: true,weight: 1,fillColor: getColor_bbdh(properties), color: '#000' }}},
            interactive: true, getFeatureId: function(feature) {return feature.properties.BU_CODE;}
        }).on('click', function(e) {}).addTo(map);
        mapinit_done = true; // FLAG DONE, prevents trying to remove map layer before creation
    });

    var color_gradient = ['#181818', '#383838', '#464646', '#555555', '#646464', '#747474', '#848484', '#959595', '#a6a6a6', '#bcbcbc', '#d2d2d2', '#e8e8e8', '#ffffff'];

    window.get_color_warmtebudget_d02 = (D02) => {
        if (D02 < 0) { return color_gradient[0]}
        else if (D02 >= 0 && D02 < 2) {     return color_gradient[1]}
        else if (D02 >= 2 && D02 < 4) {     return color_gradient[2]}
        else if (D02 >= 4 && D02 < 6) {     return color_gradient[3]}
        else if (D02 >= 6 && D02 < 8) {     return color_gradient[4]}
        else if (D02 >= 8 && D02 < 10) {    return color_gradient[5]}
        else if (D02 >= 10 && D02 < 12) {   return color_gradient[6]}
        else if (D02 >= 12 && D02 < 14) {   return color_gradient[7]}
        else if (D02 >= 14 && D02 < 16) {   return color_gradient[8]}
        else if (D02 >= 16 && D02 < 18) {   return color_gradient[9]}
        else if (D02 >= 18 && D02 < 20) {   return color_gradient[10]}
        else if (D02 >= 20 && D02 < 30) {   return color_gradient[11]}
        else if (D02 >= 30) {               return color_gradient[12]}
    };

    function getColor_bbdh(properties){
        const classresult = getClass_with_label(properties);
        var low = '#bdbdbd';
        var mid = '#757575';
        var high = '#424242';
        if (   classresult == 'W' || classresult == 'X'){return high;}
        if (   classresult == 'O' || classresult == 'P'){return mid;}
        if (   classresult == 'G' || classresult == 'H'){return low;}
        if (   classresult == 'U' || classresult == 'V'){return high;}
        if (   classresult == 'M' || classresult == 'N'){return mid;}
        if (   classresult == 'E' || classresult == 'F'){return low;}
        if (   classresult == 'S' || classresult == 'T' || classresult == 'Q' || classresult == 'R'){return high;}
        if (   classresult == 'I' || classresult == 'J' || classresult == 'K' || classresult == 'L'){return mid;}
        if (   classresult == 'A' || classresult == 'B' || classresult == 'C' || classresult == 'D'){return low;}
        return 'none';
    }

    function getColor_leeftijd(properties){
        const classresult = getClass_with_label(properties);
        var low = '#bdbdbd';
        var mid = '#757575';
        var high = '#424242';
        // LEEFTIJD
        if ( classresult == 'W' || classresult == 'X')      {return high;}
        if (   classresult == 'O' || classresult == 'P')    {return high;}
        if (   classresult == 'G' || classresult == 'H')    {return high;}
        if (   classresult == 'U' || classresult == 'V')    {return mid;}
        if (   classresult == 'M' || classresult == 'N')    {return mid;}
        if (   classresult == 'E' || classresult == 'F')    {return mid;}
        if (   classresult == 'S' || classresult == 'T' || classresult == 'Q' || classresult == 'R') {return low;}
        if (   classresult == 'I' || classresult == 'J' || classresult == 'K' || classresult == 'L') {return low;}
        if (   classresult == 'A' || classresult == 'B' || classresult == 'C' || classresult == 'D') {return low;}
        return 'none'
    }

    function getColor_combinatie(properties){
        if (   classresult == 'W' || classresult == 'X' )   {return '#608CCF';}
        if (   classresult == 'O' || classresult == 'P' )   {return '#AFC5E7';}
        if (   classresult == 'G' || classresult == 'H' )   {return '#D7E2F3';}
        if (   classresult == 'U' || classresult == 'V' )   {return '#333333';}
        if (   classresult == 'M' || classresult == 'N' )   {return '#999999';}
        if (   classresult == 'E' || classresult == 'F' )   {return '#CCCCCC';}
        if (   classresult == 'S' || classresult == 'T' || classresult == 'Q' || classresult == 'R') {return '#B02318';}
        if (   classresult == 'I' || classresult == 'J' || classresult == 'K' || classresult == 'L') {return '#D8918C';}
        if (   classresult == 'A' || classresult == 'B' || classresult == 'C' || classresult == 'D') {return '#EBC8C5';}
        return 'none';
    }

    function getClass_with_label(properties){
        var bbdh = parseInt(properties.bbdh);
        var woningoppervlakte = parseInt(properties.oppervlakteverblijfsobject_median);
        var avg_bj = parseInt(properties.bouwjaar_median);
        var weq = parseInt(properties.bbdh);
        var percb = parseInt(properties.percbplus);
        let percb_limit = 50
        let opp_limit = 100
        const bbdh_limit_1 = 50;
        const bbdh_limit_2 = 70;

        if (bbdh > 0 && bbdh < bbdh_limit_1){
            if (avg_bj < 1945){                         //#EF902A
                if (woningoppervlakte < opp_limit){     return 'Q';}
                if (woningoppervlakte >= opp_limit){    return 'R';}
            }
            if (avg_bj >= 1945 && avg_bj < 1965){       //#EF902A
                if (woningoppervlakte < opp_limit){     return 'S';}
                if (woningoppervlakte >= opp_limit){    return 'T';}
            }
            if (avg_bj >= 1965 && avg_bj < 1992){       //#878463
                if (woningoppervlakte < opp_limit){     return 'U';}
                if (woningoppervlakte >= opp_limit){    return 'V';}
            }
            if (avg_bj >= 1992 && avg_bj < 2021){       //#1B7C9A
                if (woningoppervlakte < opp_limit){     return 'W';}
                if (woningoppervlakte >= opp_limit){    return 'X';}
            }
        }
        if (bbdh >= bbdh_limit_1 && bbdh < bbdh_limit_2){
            if (avg_bj < 1945){                         //#F3AB5F
                    if (woningoppervlakte < opp_limit){     return 'I';}
                    if (woningoppervlakte >= opp_limit){    return 'J';}
                }
            if (avg_bj >= 1945 && avg_bj < 1965){           //#F3AB5F
                    if (woningoppervlakte < opp_limit){     return 'K';}
                    if (woningoppervlakte >= opp_limit){    return 'L';}
                }
            if (avg_bj >= 1965 && avg_bj < 1992){           //#A4A389
                if (woningoppervlakte < opp_limit){         return 'M';}
                if (woningoppervlakte >= opp_limit){        return 'N';}
                }
            if (avg_bj >= 1992 && avg_bj < 2021){           //#559DB3
                if (woningoppervlakte < opp_limit){         return 'O';}
                if (woningoppervlakte >= opp_limit){        return 'P';}
                }
            }
            if (bbdh >= bbdh_limit_2){
                if (avg_bj < 1945){                         //#F8C798
                    if (woningoppervlakte < opp_limit){     return 'A';}
                    if (woningoppervlakte >= opp_limit){    return 'B';}
                }
                if (avg_bj >= 1945 && avg_bj < 1965){       //#F8C798
                    if (woningoppervlakte < opp_limit){     return 'C';}
                    if (woningoppervlakte >= opp_limit){    return 'D';}
                }
                if (avg_bj >= 1965 && avg_bj < 1992){       //#C2C2B0
                    if (woningoppervlakte < opp_limit){     return 'E';}
                    if (woningoppervlakte >= opp_limit){    return 'F';}
                }
                if (avg_bj >= 1992 && avg_bj < 2021){       //#8CBECD
                    if (woningoppervlakte < opp_limit){     return 'G';}
                    if (woningoppervlakte >= opp_limit){    return 'H';}
                }
            }
        }
    }

    //overlapping markers MT-bronnen
    // var oms = new OverlappingMarkerSpiderfier(map);
    // var popup = new L.Popup();
    // oms.addListener("click", function (marker) {
    //     popup.setContent(marker.desc);
    //     popup.setLatLng(marker.getLatLng());
    //     map.openPopup(popup);
    // });

    // oms.addListener("spiderfy", function (markers) {
    //     map.closePopup();
    // });

    // for (var i = 0; i < data.features.length; i++) {
    //     var datum = data.features[i];
    //     var loc = new L.LatLng(
    //         datum.geometry.coordinates[1],
    //         datum.geometry.coordinates[0]
    //     );
    //     var marker = new L.Marker(loc, { icon: redIcon });
    //     if (datum.properties.MWcapaciteit != null && datum.properties.MWcapaciteitn != ""){
    //         marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam +
    //         "<br><b>Type:</b> " + datum.properties.type_bron + "<br><b>Vermogen:</b> " +
    //         Math.round(parseFloat(datum.properties.MWcapaciteit) * 100) / 100 + " MW";
    //     }
    //     else {
    //         marker.desc = "<b>Naam:</b> " + datum.properties.bron_naam + "<br><b>Type:</b> " + datum.properties.type_bron + "<br><b>Vermogen: </b>onbekend";
    //     }
    //     map.addLayer(marker);
    //     oms.addMarker(marker);
    // }

    var data;
    var data_contour;

    window.start_analysis = (gm_code) => {
        d3.json("geojson/data/" + gm_code + ".geojson").then(function (
        data_output, error) {
            data = data_output;
            store_input_primarydataset_raw.update((n) => data);
            var geojsonLayer = L.geoJson(data_output);
            map.fitBounds(geojsonLayer.getBounds());
            draw_buurten(data_output);
        });

        d3.json("geojson/contours/" + gm_code + ".geojson").then(function (data_output,error) {
            data_contour = data_output;
            L.geoJSON(data_contour, { invert: true, renderer: L.svg({ padding: 1 }), pane: "buurtselectie", fillOpacity: 0.1, srokeOpacity: 0.6, stroke: true, fill: true, weight: 3, color: "#000"}).addTo(map);
        });
    };

    window.draw_buurten = (data) => {
        var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var transform = d3.geoTransform({ point: projectPoint }),path = d3.geoPath().projection(transform);
        var feature = g
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("id", function (d) { return d.properties.BU_CODE; })
            .attr("fill", "#666")
            .style("stroke-width", 3)
            .style("opacity", 1)
            .style("stroke", function (d) { return "#000"; })
            .on("click", function (d) {
                toggle_output(1); //toggle_output unfolds output panel
                if (flag_racechart_active) { draw_racechart(); }
                buurtselectie_logger(this.id);
            });
        map.on("viewreset", reset);
        reset();
        // Reposition the SVG to cover the features
        function reset() {
            var bounds = path.bounds(data), topLeft = bounds[0], bottomRight = bounds[1];
            svg
                .attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");
            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
            feature.attr("d", path);
        }
        // Leaflet-D3 geometric transformation
        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        var cnt;
        for (cnt = 0; cnt < data.features.length; cnt++) {
            recalculate_results(data.features[cnt].properties);
            color_buurten(cnt, data.features[cnt].properties.BU_CODE);
        }
    };

    var buurtselectie_array = [];
    var buurtnamen_array = [];
    var co2emissiereductie_selectie = 0;
    var totaalweq_selectie = 0;

    store_selectie_buurtcodes.update((n) => buurtselectie_array);

    var buurtpolygonen_array = [];
    var vectorgrid_joinedpolygon;
    
    function buurtselectie_logger(caller) {
        var i;
        var buurtpolygon;
        var buurtproperties;

        for (i = 0; i < data_gemeenten.features.length; i++) {
            if (data_gemeenten.features[i].properties.BU_CODE == caller) {
                buurtpolygon = data_gemeenten.features[i].geometry;
                buurtproperties = data_gemeenten.features[i].properties;
                break;
            }
        }

        var buurtpolygon = turf.polygon(buurtpolygon.coordinates[0], {fill: "#0f0",});

        if (buurtselectie_array.length == 0) {
            buurtpolygonen_array.push(buurtpolygon);
            buurtselectie_array.push(caller);
            buurtnamen_array.push(buurtproperties.I02_buurtnaam);
            co2emissiereductie_selectie =co2emissiereductie_selectie + parseInt(buurtproperties.ref_2030_H15);
            totaalweq_selectie = totaalweq_selectie + parseInt(buurtproperties.I11_aantalweq);
        }
        else if (buurtselectie_array.indexOf(caller) >= 0) {
            buurtpolygonen_array.splice(buurtselectie_array.indexOf(caller), 1);
            buurtselectie_array.splice(buurtselectie_array.indexOf(caller), 1);
            buurtnamen_array.splice(buurtnamen_array.indexOf(buurtproperties.I02_buurtnaam),1);
            co2emissiereductie_selectie = co2emissiereductie_selectie - parseInt(buurtproperties.ref_2030_H15);
            totaalweq_selectie = totaalweq_selectie - parseInt(buurtproperties.I11_aantalweq);
        }
        else {
            buurtpolygonen_array.push(buurtpolygon);
            buurtselectie_array.push(caller);
            buurtnamen_array.push(buurtproperties.I02_buurtnaam);
            co2emissiereductie_selectie = co2emissiereductie_selectie + parseInt(buurtproperties.ref_2030_H15);
            totaalweq_selectie = totaalweq_selectie + parseInt(buurtproperties.I11_aantalweq);
        }

        store_selectie_weq.update((n) => totaalweq_selectie);
        store_selectie_co2reductie.update((n) => co2emissiereductie_selectie);
        store_selectie_buurtnamen.update((n) => buurtnamen_array);
        store_selectie_buurtcodes.update((n) => buurtselectie_array);

        var joinedpolygons;
        if (buurtpolygonen_array.length > 0) {
            joinedpolygons = turf.union(...buurtpolygonen_array);
            if (vectorgrid_joinedpolygon) {
                map.removeLayer(vectorgrid_joinedpolygon);
            }
            vectorgrid_joinedpolygon = L.geoJSON(joinedpolygons, {
                fillOpacity: 0.0,
                strokeOpacity: 1,
                stroke: true,
                fill: true,
                weight: 12,
                color: "#000",
            }).addTo(map);

            unfold_sliderpanel();
            recalculate_all();
        }
    }
</script>

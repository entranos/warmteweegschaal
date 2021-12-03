<script>
    import { onMount } from "svelte";
    import { store_input_primarydataset_raw } from "./stores.js";
    import { store_visualisatiedataset_racechart} from './stores.js';
    import {store_selectie_buurtnamen} from "./stores.js";

    var buurtnamen_current;
    store_selectie_buurtnamen.subscribe((value) => {
        buurtnamen_current = value;
    })
    var data_wa_h17;
    store_visualisatiedataset_racechart.subscribe((value) => {
        data_wa_h17 = value;
    })

    var data_gemeenten;
        store_input_primarydataset_raw.subscribe((value) => {
        data_gemeenten = value;
    });

    var myElementToCheckIfClicksAreInsideOf = document.querySelector('#OutputPanel');
    // Listen for click events on body
    document.body.addEventListener('click', function (event) {
        if (myElementToCheckIfClicksAreInsideOf.contains(event.target)) {
            draw_racechart();
            donutChartChange_bouwperiode(donutdata_bouwperiode_log)
            donutChartChange_woningtype(donutdata_woningtype_log);
            donutChartChange_weq(donutdata_weq_log);
        } else {
        // do nothing
        }
    });
    
    onMount(() => {
        svg_RaceChart = d3
            .select("#RaceChartDiv")
            .style('background-color','#fff')
            .append("svg")
            .attr("width", 500)
            .attr("height", 300);
        svg_BuurtTitle = d3
            .select("#BuurtTitleDiv")
            .style('background-color','#fff')
            .append("svg")
            .attr("width", 500)
            .attr("height", 60);

        flag_racechart_active = true;
    });

    //global vars
    var data_runchart = [{name: "dummy",value: 1,color: "#f00",rank: 0,}];
    var top_n = 12;
    var height = 600;
    var width = 450;
    const margin = {top: 20,right: 0,bottom: 4,left: 20,};
    let barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);
    var svg_RaceChart;
    var svg_BuurtTitle;

    let x = d3.scaleLinear().domain([0, d3.max(data_runchart, (d) => d.value)]).range([margin.left, width - margin.right - 65]);
    let y = d3.scaleLinear().domain([top_n, 0]).range([height - margin.bottom, margin.top]);
    let xAxis = d3.axisTop().scale(x).ticks(width > 500 ? 5 : 2).tickSize(-(height - margin.top - margin.bottom)).tickFormat((d) => d3.format(",")(d));
    var tickDuration = 200;

    window.draw_racechart = (buurt) => {
        var i;
        var fetch = 0;
        for (i = 0; i < data_gemeenten.features.length; i++) {
            if (data_gemeenten.features[i].properties.BU_CODE == buurt) {
                fetch = data_gemeenten.features[i].properties;
            }
        }

        let colors = {
            s1a: "#90caf9",
            s2c: "#ffecb3",
            s2f: "#ffab91",
        };

        let translate_title = {s1a: 'All-electric (B+)', s2c: 'Warmtenet (B+)', s2f: 'Warmtenet (D+)'};

        var value = data_wa_h17;
        var data_runchart = [];
        var i;
        
        for (i = 0; i < value.length; i++) {data_runchart.push({name: translate_title[value[i].strat],value: value[i].h17,color: colors[value[i].strat],rank: i,});}

        var yearSlice = data_runchart;
        var max_dynamic = d3.max(data_runchart, (d) => d.value) 
        x.domain([0, max_dynamic]);
        // x.domain([0, 800]);

        let bars = svg_RaceChart.selectAll(".bar").data(yearSlice, (d) => d.name);

        bars.enter()
            .append("rect")
            .attr("class", (d) => `bar ${d.name.replace(/\s/g, "_")}`)
            .attr("x", x(0) + 1)
            .attr("width", (d) => x(d.value) - x(0) - 1)
            .attr("y", (d) => y(top_n + 1) + 5)
            .attr("height", y(1) - y(0) - barPadding)
            .style('fill', (d) => d.color)
            .style("opacity", 1)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("y", (d) => y(d.rank) + 5);

        bars.transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("width", (d) => x(d.value) - x(0) - 1)
            .attr("y", (d) => y(d.rank) + 5);

        bars.exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("width", (d) => x(d.value) - x(0) - 1)
            .attr("y", (d) => y(top_n + 1) + 5)
            .remove();

        bars.style("opacity", function(d){
            if (d.name == 's4a' || d.name == 's4b' || d.name == 's4c' || d.name == 's4d'){
                if (ln == d.name){
                    return 1;
                }
                else 
                    return 0.5;
            }
            else
                return 1;
        })

        let labels = svg_RaceChart.selectAll(".label").data(data_runchart, (d) => d.name);

        labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("x", (d) => x(d.value) - 8)
            .attr("y", (d) => y(top_n + 1) + 5 + (y(1) - y(0)) / 2)
            .style("text-anchor", "end")
            .attr("fill",function (d){ if(d.color == '#fff' || d.color == '#ffd54f') return "black"; else return 'black'; })
            .style("font-weight", "800")
            .style("font-size", "12px")
            .html((d) => d.name)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

        labels.transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("x", (d) => x(d.value) - 8)
            .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

        labels.exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("x", (d) => x(d.value) - 8)
            .attr("y", (d) => y(top_n + 1) + 5)
            .remove();

        let valueLabels = svg_RaceChart
            .selectAll(".valueLabel")
            .data(data_runchart, (d) => d.name);

        valueLabels
            .enter()
            .append("text")
            .attr("class", "valueLabel")
            .attr("x", (d) => x(d.value) + 5)
            .attr("y", (d) => y(top_n + 1) + 5)
            .text(function(d){var str = d3.format(",.0f")(d.value); str=str.replace(",","."); return str;})
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1);

        valueLabels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("x", (d) => x(d.value) + 5)
            .attr("y", (d) => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1)
            .tween("text", function (d) {
                let i = d3.interpolateRound(d.value, d.value);
                return function (t) {
                var str = d3.format(",")(i(t)); str=str.replace(",",".");
                this.textContent = str;
                };
            });

        valueLabels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr("x", (d) => x(d.value) + 5)
            .attr("y", (d) => y(top_n + 1) + 5)
            .remove();

        var j;
        var buurtnamen_string ='';
        if (buurtnamen_current.length == 1){buurtnamen_string = 'Enkele buurt: ';}
        if (buurtnamen_current.length > 1){ buurtnamen_string = 'Gemiddeld resultaat voor '+ buurtnamen_current.length + ' buurten: ';}
        for (j=0;j<buurtnamen_current.length;j++){
            buurtnamen_string = buurtnamen_string.concat(buurtnamen_current[j])
            if (buurtnamen_current.length - j > 2){buurtnamen_string = buurtnamen_string.concat(', ')}
            else if (buurtnamen_current.length - j > 1){buurtnamen_string = buurtnamen_string.concat(' en ')}
        }
    };
</script>
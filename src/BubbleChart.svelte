<!--
Bestand: BlockChart.Svelte
Functie: Tekent en manipuleert de grafiek met bolletjes aan de linkerkant van het output-paneel
Opmerkingen: haakt in op tool via "#BlockChartDiv", geinstantieerd in "OutputPanel.svelte"
Afhankelijk van libraries: d3.js
Auteur: Tijs Langeveld
-->
<script>
    import { onMount } from "svelte";
    import { store_visualisatiedataset_bubblechart } from "./stores.js";

    //grafiek ontvangt data via store 'resultaat_bubblechartdata'
    var data;
    store_visualisatiedataset_bubblechart.subscribe((value) => {data = value;});

    var svg;
    var i;

    onMount(() => {
        // onMount, initialiseer en teken in
        var viewport_width = Math.max(document.documentElement.clientWidth,window.innerWidth || 0);
        svg = d3
            .select("#BlockChartDiv")
            .append("svg")
            .attr("width", 750)
            .style("background-color", "#fff")
            .style("overflow", "visible")
            .attr("height", 240);
        // viz draws first data
        init_BlockChart();
        if (data.length > 0) {manipulate_blockchart(data);}
    });

    // reageer op mutaties op input
    $: {if (data.length > 0) {manipulate_blockchart(data);}}

    function init_BlockChart() {
        svg.append('text')
            .style('font-family', 'RijksoverheidSans')
            .style('font-size', 14 +'px')
            .style('font-weight',200)
            .call(wrap,300)
            .attr('transform','translate(0,75)');

        svg.append('text')
            .style('font-family', 'RijksoverheidSans')
            .style('font-size', 14 +'px')
            .style('font-weight',200)
            .call(wrap,300)
            .attr('transform','translate(0,190)');

        //afmetingen en posities
        let spacing = 3;
        var graph_width = 35;
        var graph_height = graph_width;
        var margin_left = 0;
        var margin_top = 0;
        var gpos = []; // datapunten referentie voor posities en labels

        //data keys
        let posten = ["egnet","wnet_buurt","wnet_pand","wnet_transport","wnet_bron","iso","inst","om","warmtepomp_elek"];
        //maak datapunt-referenties (s1a (warmtepomp, B+)
        
        for (i = 0; i < 9; i++) {
            gpos.push({
                post: posten[i],
                strat: "s1a",
                graph: i,
                xpos: (graph_width + spacing) * i + margin_left,
                ypos: 80 + margin_top,
            });
        }
        //maak datapunt-referenties s2c (warmtenet, B+)
        for (i = 0; i < 9; i++) {
            gpos.push({
                post: posten[i],
                strat: "s2c",
                graph: i,
                xpos: (graph_width + spacing) * i + margin_left,
                ypos: 118 + margin_top,
            });
        }
        //maak datapunt-referenties voor s2f (warmtenet, D+)
        for (i = 0; i < 9; i++) {
            gpos.push({
                post: posten[i],
                strat: "s2f",
                graph: i,
                xpos: (graph_width + spacing) * i + margin_left,
                ypos: 156 + margin_top,
            });
        }

        //titels posten en afmetingen achtergrondlabels (de diagonale etiketten bovenaan de grafiek en de horizontale labels aan de linkerkant van de grafiek)
        let posten_labels = ["Elek.- en gasnetten","Warmtenet buurt","Warmtenet pand","Warmtenet transport","Warmtekosten","Isolatie","Gebouwinstallaties","Onderhoud & beheer","Elektrct. warmtepomp",];
        let posten_widths = [105, 95, 95, 114, 82, 45, 103, 113, 119];
        let horlabels_text = ["All-electric (B+)","Warmtenet (B+)","Warmtenet (D+)",];
        let horlabels_color = ["#90caf9", "#ffecb3", "#ffab91"];
        let horlabels_textcolor = ["#000", "#000", "#000"];

        for (i = 0; i < 3; i++) {
            svg // horizontale gridlines
                .append("rect")
                .attr("width", 373).attr("height", 2)
                .attr("fill", "#333")
                .attr("rx", 2).attr("ry", 2)
                .attr("x", 65+margin_left-115).attr("y", margin_top - 40 + 136 + 38 * i);
            svg // teken horizontale labels
                .append("rect")
                .attr("width", 105).attr("height", 20)
                .attr("fill", horlabels_color[i])
                .attr("rx", 5).attr("ry", 5)
                .attr("x", margin_left-115).attr("y", margin_top - 40 + 136 + 38 * i - 9);
            svg // teken text op horizontale labels
                .append("text")
                .style("color", horlabels_textcolor[i])
                .text(horlabels_text[i]).style("font-family", "RijksoverheidSans").style("font-size", 12 + "px").style("font-weight", 800)
                .attr("x", margin_left-109).attr("y", margin_top - 40 + 136 + 38 * i + 4);
        }

        for (i = 0; i < 9; i++) {
            // positie diagonale labels bovenaan grafiek
            var xpos = gpos[i].xpos + 7;
            var ypos = gpos[i].ypos - 13;

            svg // achtergrond diagonale labels bovenaan grafiek
                .append("rect")
                .attr("width", posten_widths[i]).attr("height", 17)
                .attr("fill", "#fff")
                .attr("rx", 5).attr("ry", 5)
                .attr("transform", "translate(" + xpos + "," + ypos + ") rotate(-55)");

            svg // verticale gridlines
                .append("rect")
                .attr("width", 2).attr("height", 106)
                .attr("fill", "#333")
                .attr("rx", 2).attr("ry", 2)
                .attr("x", xpos + 9.5).attr("y", ypos);

            // positie horizontale labels links van grafiek
            xpos = gpos[i].xpos + 20;
            ypos = gpos[i].ypos - 15;

            svg // tekst op horizontale labels links van grafiek
                .append("text")
                .style("color", "black")
                .text(posten_labels[i])
                .style("color", "black")
                .style("font-family", "RijksoverheidSans")
                .style("font-size", 14 + "px")
                .style("font-weight", 800)
                .attr("transform", "translate(" + xpos + "," + ypos + ") rotate(-55)");
        }

        // bubble kleuren per post (in huidige inmplementatie geen onderscheid op kleur)
        let bubbleColors = {
            egnet:            "#424242",
            wnet_buurt:       "#424242",
            wnet_pand:        "#424242",
            wnet_transport:   "#424242",
            wnet_bron:        "#424242",
            iso:              "#424242",
            inst:             "#424242",
            om:               "#424242",
            warmtepomp_elek:  "#424242",
        };

        //generereer bubbles
        for (i = 0; i < gpos.length; i++) {
            var j;
            svg //rode omcirkeling per bubble, is indicator voor negatieve waarden
                .append("circle")
                .attr("id", gpos[i].strat + "_" + gpos[i].post + "_back")
                .attr("cx", gpos[i].xpos + graph_width / 2).attr("cy", gpos[i].ypos + graph_height / 2)
                .attr("fill", "red")
                .style("stroke", "red").style("stroke-width", 4).style("stroke-opacity", 0)
                .attr("r", 0);

            svg //teken bubbles
                .append("circle")
                .attr("id", gpos[i].strat + "_" + gpos[i].post)
                .attr("cx", gpos[i].xpos + graph_width / 2).attr("cy", gpos[i].ypos + graph_height / 2)
                .attr("fill", bubbleColors[gpos[i].post])
                .attr("r", 10)
                .style("stroke", "#fff")
                .style("stroke-width", 1)
                .attr("margin", 100);
        }
    } // init_BlockChart()

    function manipulate_blockchart(data) {  // manipuleer blockchar (omvang van bubbles, rode omcirkeling)
    // referentielabels
    let labels = ["s1a", "s2c", "s2f"];
    // bepaal maximumwaarde per variant en over de gehele dataset (voor schaalfactor bubbles)
    var maxima = [];
    for (i = 0; i < data.length; i++) {
        let arr = [data[i].egnet, data[i].warmtepomp_elek, data[i].inst, data[i].iso, data[i].om, data[i].wnet_bron, data[i].wnet_buurt, data[i].wnet_pand, data[i].wnet_transport];
        var max = Math.max(...arr);
        maxima.push(max);
    }
    var max_global = Math.max(...maxima);
    // overkoepelende uitgangspunten voor de schaling van de bubbles op de data
    let opp = 1.8;
    const sqrtScale = d3.scaleSqrt().domain([0, 10]).range([0, 40]);
    //schaal bubbles per post (afmeting bubble, wel/geen rode omcerikeling en update textlabel met waarde
    // (1/9) EGNET ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].egnet)) / max_global;
        d3.select("#" + labels[i] + "_egnet").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].egnet < 0) {
            d3.select("#" + labels[i] + "_egnet_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_egnet_back").style("stroke-opacity", 0);
        }
        // d3.select("#" + labels[i] + "_egnet_text").text(data[i].egnet); // voor debugging
    }

    // (2/9) WARMTEPOMP ELEK ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].warmtepomp_elek)) / max_global;
        d3.select("#" + labels[i] + "_warmtepomp_elek").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].warmtepomp_elek < 0) {
            d3.select("#" + labels[i] + "_warmtepomp_elek_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_warmtepomp_elek_back").style("stroke-opacity",0);
        }
        // d3.select("#" + labels[i] + "_warmtepomp_elek_text").text(data[i].warmtepomp_elek); // voor debugging
    }

    // (3/9) INST ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].inst)) / max_global;
        d3.select("#" + labels[i] + "_inst").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].inst < 0) {
            d3.select("#" + labels[i] + "_inst_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_inst_back").style("stroke-opacity", 0);
        }
        // d3.select("#" + labels[i] + "_inst_text").text(data[i].inst); // voor debugging
    }
    // (4/9) ISO ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].iso)) / max_global;
        d3.select("#" + labels[i] + "_iso").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].iso < 0) {
            d3.select("#" + labels[i] + "_iso_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_iso_back").style("stroke-opacity", 0);
        }
        // d3.select("#" + labels[i] + "_iso_text").text(data[i].iso); // voor debugging
    }
    // (5/9) OM ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].om)) / max_global;
        d3.select("#" + labels[i] + "_om")
            .transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].om < 0) {
            d3.select("#" + labels[i] + "_om_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_om_back").style("stroke-opacity", 0);
        }
        // d3.select("#" + labels[i] + "_om_text").text(data[i].om); // voor debugging
    }
    // (6/9) WNET_BRON ----------------
    for (i = 0; i < labels.length; i++) {
        let res = Math.sqrt((opp * Math.abs(data[i].wnet_bron)) / max_global);
        d3.select("#" + labels[i] + "_wnet_bron").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].wnet_bron < 0) {
            d3.select("#" + labels[i] + "_wnet_bron_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_wnet_bron_back").style("stroke-opacity",0);
        }
        // d3.select("#" + labels[i] + "_wnet_bron_text").text(data[i].wnet_bron); // voor debugging
    }
    // (7/9) WNET_BUURT ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].wnet_buurt)) / max_global;
        d3.select("#" + labels[i] + "_wnet_buurt").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].wnet_buurt < 0) {
            d3.select("#" + labels[i] + "_wnet_buurt_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_wnet_buurt_back").style("stroke-opacity",0);
        }
        // d3.select("#" + labels[i] + "_wnet_buurt_text").text(data[i].wnet_buurt); // voor debugging
    }
    // (8/9) WNET_PAND ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].wnet_pand)) / max_global;
        d3.select("#" + labels[i] + "_wnet_pand").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].wnet_pand < 0) {
            d3.select("#" + labels[i] + "_wnet_pand_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_wnet_pand_back").style("stroke-opacity",0);
        }
      // d3.select("#" + labels[i] + "_wnet_pand_text").text(data[i].wnet_pand); // voor debugging
    }
    // (9/9) WNET_TRANSPORT ----------------
    for (i = 0; i < labels.length; i++) {
        let res = (opp * Math.abs(data[i].wnet_transport)) / max_global;
        d3.select("#" + labels[i] + "_wnet_transport").transition().duration(50).attr("r", sqrtScale(res));
        if (data[i].wnet_transport < 0) {
            d3.select("#" + labels[i] + "_wnet_transport_back").transition().duration(50).attr("r", sqrtScale(res)).style("stroke-opacity", 0.8);
        } else {
            d3.select("#" + labels[i] + "_wnet_transport_back").style("stroke-opacity",0);
        }
      // d3.select("#" + labels[i] + "_wnet_transport_text").text(data[i].wnet_transport); // voor debugging
    }
    // voor debugging:
    // d3.selectAll("#blockchart_overlays")
    //   .interrupt()
    //   .style("opacity", 0.6)
    //   .transition()
    //   .duration(5000)
    //   .style("opacity", "0");
    // d3.selectAll(".blockchart_overlays_text")
    //   .interrupt()
    //   .style("opacity", 1)
    //   .transition()
    //   .duration(5000)
    //   .style("opacity", "0");
}
</script>
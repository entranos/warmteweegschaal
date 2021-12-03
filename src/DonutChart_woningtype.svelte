<!--
Bestand: DonutChart_woningtype.Svelte
Functie: Tekent en manipuleert donutchart met weergave van aantallen woningen per woningtype
Opmerkingen: haakt in op div '#DonutChartB' geinstantieerd in 'OutputPanel.svelte'
Dependencies: d3.js
Auteur: Tijs Langeveld
-->
<script>
    import { onMount } from "svelte";
    var piechart_canvas;

    onMount(() => {
        piechart_canvas = d3
            .select("#DonutChartB")
            .append("svg")
            .attr("width", "150px")
            .attr("height", "100px")
            .append("g");
        piechart_canvas
            .append("text")
            .style("font-family", "RijksoverheidSans")
            .style("font-size", 16 + "px")
            .style("font-weight", 800)
            .text("Woningtype")
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("transform", "translate(0,0)");

        piechart_canvas.append("g").attr("class", "slices");
        piechart_canvas.append("g").attr("class", "labels");
        piechart_canvas.append("g").attr("class", "lines");

    var width = 250, height = 250, radius = Math.min(width, height) / 2;

    var pie = d3
        .pie()
        .sort(null)
        .value(function (d) {return d.value;});

    var arc = d3
        .arc()
        .outerRadius(radius * 0.7)
        .innerRadius(radius * 0.5);

    var outerArc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.9);

    piechart_canvas.attr("transform","translate(" + width / 2 + "," + height / 2 + ")");

    var key = function (d) {return d.data.label;};

    var color = d3
        .scaleOrdinal()
        .domain(["Gestapeld", "2-1-kap", "Rij-hoek","Rij-tussen","Vrijstaand"])
        .range(['#DE6451','#1F9DCE','#9667B8','#60BA80','#F1A33A']);
    
    window.donutChartChange_woningtype = (data) => {
        var i;
        var total_weq=0;
        for (i=0;i<data.length;i++){
            total_weq = total_weq + data[i].value;
        }

        // pie slices
        var slice = piechart_canvas
            .select(".slices")
            .selectAll("path.slice")
            .data(pie(data), key);

        slice
            .enter()
            .insert("path")
            .style("opacity", 1)
            .style('stroke','#333')
            .style('stroke-width',0.5)
            .style("fill", function (d) {
                return color(d.data.label);
            })
            .attr("class", "slice");

        slice
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        slice.exit().remove();

        //textlabels
        var text = piechart_canvas
            .select(".labels")
            .selectAll("text")
            .data(pie(data), key)
            .text(function (d) {
                if (parseInt((d.value / total_weq) * 100) > 2) {
                    return d.data.label + ", " +parseInt((d.value / total_weq) * 100) + "%";
                } else return "";
            });

        text
            .enter()
            .append("text")
            .style("font-family", "RijksoverheidSans")
            .style('font-size','16px')
            .style('font-weight',800)
            .attr("dy", ".35em")
            .attr('fill','black')
            .text(function (d) {
                return parseInt(d.value * 100);
            });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        text
            .transition()
            .duration(1000)
            .attrTween("transform", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            });

        text.exit().remove();

        // slice text to polylines
        var polyline = piechart_canvas
            .select(".lines")
            .selectAll("polyline")
            .data(pie(data), key)
            .style("opacity", function (d) {
                if (parseInt((d.value / total_weq) * 100) > 2) {
                    return 1;
                } else return 0;
            });

        polyline.enter().append("polyline");

        polyline
            .transition()
            .duration(1000)
            .attrTween("points", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });
        polyline.exit().remove();
        }
    });
</script>

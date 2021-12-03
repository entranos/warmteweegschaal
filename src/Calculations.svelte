<!--
Bestand:        Calculations.Svelte
Functie:        Berekenen van SA-indicator H17
Opmerkingen:    Uitsluitend berekeningen, geen DOM maniuplaties
Dependencies:   Geen
Functies:       window.color_buurten - kleurt buurten op variant met de laagste kosten en logt aantal weq per variant
                window.adapt_opacity - verandering van transparantie buurtpolygoon
                window.get_color_D02 - kleurt ongeselecteerde buurten
                window.recalculate_results - herberekent, samen met window.process_NK, indicator H17 op basis van de actuele instellingen
                window.update_boxchartdata - herberekent de resultaten voor visualisatie in bubblechart
                window.process_NK - herberekent, samen met window.process_NK, indicator H17 op basis van de actuele instellingen
                window.mutationrequest - registreert een mutatie op de uitgangspunten
                window.redraw_donutChart - update de donut-charts op basis van de actuele selectie van buurten

Auteur:         Tijs Langeveld
-->

<script>
    import { store_input_primarydataset_raw } from "./stores.js";
    import { store_input_primarydataset_processed } from "./stores.js";

    import { store_visualisatiedataset_racechart } from "./stores.js";
    import { store_visualisatiedataset_bubblechart } from "./stores.js";

    import { store_instelling_gjtarief } from "./stores.js";
    import { store_instelling_lengtetransportleiding } from "./stores.js";

    import { store_selectie_buurtcodes } from "./stores.js";
    import { store_selectie_weq } from "./stores.js";
    import { store_selectie_co2reductie } from "./stores.js";
    import { store_selectie_woningen_woningtype } from "./stores.js";
    import { store_selectie_woningen_bouwperiode } from "./stores.js";

    import { store_tussenresultaat_kapitaalslasten_transportnet } from "./stores.js";
    import { store_tussenresultaat_primarydataset_processed } from "./stores.js";

    var kapitaalslasten_transportnet_current;
    store_tussenresultaat_kapitaalslasten_transportnet.subscribe((value) => { kapitaalslasten_transportnet_current = value; });

    var selectie_weq;
    store_selectie_weq.subscribe((value) => { selectie_weq = value; });

    var selectie_co2reductie; store_selectie_co2reductie.subscribe((value) => { selectie_co2reductie = value; });

    var instelling_lengtetransportleiding;
    store_instelling_lengtetransportleiding.subscribe((value) => { instelling_lengtetransportleiding = value; });

    var selectie_buurtcodes;
    store_selectie_buurtcodes.subscribe((value) => { selectie_buurtcodes = value; });

    var instelling_gjtarief;
    store_instelling_gjtarief.subscribe((value) => { instelling_gjtarief = value; });

    var input_primarydataset_raw;
    store_input_primarydataset_raw.subscribe((value) => { input_primarydataset_raw = value; });

    var i, j;
    var h17_ranking = [];
    var bubblechartdata_collector = [];

    var s1a_hoofdresultaat = 0;
    var s2c_hoofdresultaat = 0;
    var s2f_hoofdresultaat = 0;

    // aantallen registry
    var s1a_aantalweq = 0;
    var s2c_aantalweq = 0;
    var s2f_aantalweq = 0;

    var totaal_aantal_woningen_per_bouwperiode = {bp1: 0,bp2: 0,bp3: 0,bp4: 0,bp5: 0,bp6: 0,bp7: 0}
    var totaal_aantal_woningen_per_woningtype = {twee1kap: 0,vrij: 0,gestapeld: 0,rijhoek: 0,rijtussen: 0};

    var co2_reductie_som = 0;
    var count_analysed = 0;

    // berekeningen
    var results_dynamic = {
        s1a: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        s2c: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        s2f: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        ref30: {I11_aantalweq: 0, H15: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H09: 0, H10: 0, H11: 0, H12: 0}
    };

    var results_static = {
        s1a: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        s2c: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        s2f: {K01: 0, K02: 0, K03: 0, K04: 0, K05: 0, K06: 0, K07: 0, K08: 0, K09: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H02: 0, H03: 0, H09: 0, H10: 0, H11: 0, H12: 0, H13: 0},
        ref30: {I11_aantalweq: 0, H15: 0, K11: 0, K12: 0, K13: 0, K14: 0, K15: 0, K16: 0, H09: 0, H10: 0, H11: 0, H12: 0}
    };

    var knobvalues_dynamic = {
        s1a: {K01: 1, K02: 1, K03: 1, K04: 1, K05: 1, K06: 1, K07: 1, K08: 1, K09: 1, K11: 1, K12: 1, K13: 1, K14: 1, K15: 1, K16: 1, H02: 1, H03: 1, H09: 1, H10: 1, H11: 1, H12: 1, H13: 1}, 
        s2c: {K01: 1, K02: 1, K03: 1, K04: 1, K05: 1, K06: 1, K07: 1, K08: 1, K09: 1, K11: 1, K12: 1, K13: 1, K14: 1, K15: 1, K16: 1, H02: 1, H03: 1, H09: 1, H10: 1, H11: 1, H12: 1, H13: 1},
        s2f: {K01: 1, K02: 1, K03: 1, K04: 1, K05: 1, K06: 1, K07: 1, K08: 1, K09: 1, K11: 1, K12: 1, K13: 1, K14: 1, K15: 1, K16: 1, H02: 1, H03: 1, H09: 1, H10: 1, H11: 1, H12: 1, H13: 1}
    };

    var s1a_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}
    var s2c_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}
    var s2f_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}

    window.color_buurten = (index, buco) => {
        let colors2 = ["#1976d2", "#ffd54f", "#e64a19"];
        var polygon_opacity = 0.4;
        //register bouwperiode woningen
    
        totaal_aantal_woningen_per_bouwperiode.bp1 += parseInt(input_primarydataset_raw.features[index].properties.won_bp1)
        totaal_aantal_woningen_per_bouwperiode.bp2 += parseInt(input_primarydataset_raw.features[index].properties.won_bp2)
        totaal_aantal_woningen_per_bouwperiode.bp3 += parseInt(input_primarydataset_raw.features[index].properties.won_bp3)
        totaal_aantal_woningen_per_bouwperiode.bp4 += parseInt(input_primarydataset_raw.features[index].properties.won_bp4)
        totaal_aantal_woningen_per_bouwperiode.bp5 += parseInt(input_primarydataset_raw.features[index].properties.won_bp5)
        totaal_aantal_woningen_per_bouwperiode.bp6 += parseInt(input_primarydataset_raw.features[index].properties.won_bp6)
        totaal_aantal_woningen_per_bouwperiode.bp7 += parseInt(input_primarydataset_raw.features[index].properties.won_bp7)
        // console.log(totaal_aantal_woningen_per_bouwperiode)
        //register woningtype woningen
        totaal_aantal_woningen_per_woningtype.twee1kap +=   parseInt(input_primarydataset_raw.features[index].properties.wt_21kap)
        totaal_aantal_woningen_per_woningtype.vrijstaand +=       parseInt(input_primarydataset_raw.features[index].properties.wt_vrijsaa)
        totaal_aantal_woningen_per_woningtype.gestapeld +=  (parseInt(input_primarydataset_raw.features[index].properties.wt_mgz_hoo) + parseInt(input_primarydataset_raw.features[index].properties.wt_mgz_laa))
        totaal_aantal_woningen_per_woningtype.rijhoek +=    parseInt(input_primarydataset_raw.features[index].properties.wt_rwhoek)
        totaal_aantal_woningen_per_woningtype.rijtussen +=  parseInt(input_primarydataset_raw.features[index].properties.wt_rwtusse)

        switch (h17_ranking[0].strat) {
        case "s1a":
            if (selectie_buurtcodes.indexOf(buco) >= 0) {
            d3.select("#" + buco)
                .attr("fill", colors2[0])
                .style("opacity", polygon_opacity);
            //register aantal weq
            s1a_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq);
            
            } else {
            d3.select("#" + buco)
                .attr("fill", function () {return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));})
                .style("opacity", 0.6);
            }
            break;
        case "s2c":
            if (selectie_buurtcodes.indexOf(buco) >= 0) {
            d3.select("#" + buco)
                .attr("fill", colors2[1])
                .style("opacity", polygon_opacity);
            //register aantal weq
            s2c_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq
            );
            
            } else {
            d3.select("#" + buco)
                .attr("fill", function () {return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));})
                .style("opacity", 0.6);
            }
            break;
        case "s2f":
            if (selectie_buurtcodes.indexOf(buco) >= 0) {
            d3.select("#" + buco)
                .attr("fill", colors2[2])
                .style("opacity", polygon_opacity);
            //register aantal weq
            s2f_aantalweq += parseInt(input_primarydataset_raw.features[index].properties.I11_aantalweq);
            } else {
            d3.select("#" + buco)
                .attr("fill", function () {return get_color_D02(parseInt(input_primarydataset_raw.features[index].properties.D02));})
                .style("opacity", 0.6);
            }
            break;
        }
    };

    window.adapt_opacity = (opacity) => {
        var i;
        for(i=0;i<selectie_buurtcodes.length;i++){
            d3.select('#' + selectie_buurtcodes[i]).style('opacity',opacity)
        }
    }

    window.get_color_D02 = (D02) => { // deze functie kleurt niet-geselecteerde buurten. Wordt nu geen gebruik van gemaakt.
        return 'none';
    };

    window.recalculate_results = (buurt_geladen) => {
        var variantcode = ["s1a", "s2c", "s2f"];
        var K_code = ["K01","K02","K03","K04","K05","K06","K07","K08","K09","K11","K12","K13","K14","K15","K16","H02","H03","H09","H10","H11","H12","H13"];
        var ref30_code = ["I11_aantalweq","H15","K11","K12","K13","K14","K15","K16","H09","H10","H11","H12"];
        // STAP A: STRUCTUREER STATISCHE RESULTATEN
        for (j = 0; j < variantcode.length; j++) {
            for (i = 0; i < K_code.length; i++) {
                if (Number.isInteger(parseInt(buurt_geladen[variantcode[j] + "_" + K_code[i]]))){
                    results_static[variantcode[j]][K_code[i]] = parseInt(
                    buurt_geladen[variantcode[j] + "_" + K_code[i]]);
                }
                else {
                    results_static[variantcode[j]][K_code[i]] = 0;
                }
            }
        }
        
        for (i = 0; i < ref30_code.length; i++) {
            if (Number.isInteger(parseInt(buurt_geladen["ref_2030_" + ref30_code[i]]))) {
                results_static["ref30"][ref30_code[i]] = parseInt(buurt_geladen["ref_2030_" + ref30_code[i]]);
            }
            else {
                results_static["ref30"][ref30_code[i]] = 0;
            }
        }
        results_static["ref30"]["I11_aantalweq"] = parseInt(buurt_geladen["I11_aantalweq"]);
        //MUTEER DYNAMISCHE RESULTATEN MET INSTELLINGEN
        for (j = 0; j < variantcode.length; j++) {
            for (i = 0; i < K_code.length; i++) {
                results_dynamic[variantcode[j]][K_code[i]] =
                results_static[variantcode[j]][K_code[i]] *
                knobvalues_dynamic[variantcode[j]][K_code[i]];
            }
        }
        
        bubblechartdata_collector = [];
        //BEREKEN H17
        s1a_hoofdresultaat = process_NK("s1a", buurt_geladen.BU_CODE);
        s2c_hoofdresultaat = process_NK("s2c", buurt_geladen.BU_CODE);
        s2f_hoofdresultaat = process_NK("s2f", buurt_geladen.BU_CODE);
        // CREEER ARRAY MET RESULTATEN, NEGEER WAARVOOR GEEN RESULTAAT
        h17_ranking = [];
        
        if (Number.isNaN(s1a_hoofdresultaat) == false) {
            h17_ranking.push({ strat: "s1a", h17: s1a_hoofdresultaat });
        }
        if (Number.isNaN(s2c_hoofdresultaat) == false) {
            h17_ranking.push({ strat: "s2c", h17: s2c_hoofdresultaat });
        }
        if (Number.isNaN(s2f_hoofdresultaat) == false) {
            h17_ranking.push({ strat: "s2f", h17: s2f_hoofdresultaat });
        }
        //SORTEER DE RESULTATEN VAN LAAGSTE NAAR HOOGSTE NATIONALE KOSTEN
        h17_ranking.sort(dynamicSort("h17"));
        store_visualisatiedataset_racechart.update((n) => h17_ranking);
        store_tussenresultaat_primarydataset_processed.update((n) => results_dynamic);
        store_input_primarydataset_processed.update((n) => results_static);
    };

    window.update_boxchartdata = () => {
        var boxchart_data = [];
        boxchart_data.push({
            stratid: "s1a",
            egnet: Math.round(s1a_som.egnet / selectie_weq),
            wnet_buurt: Math.round(s1a_som.wnet_buurt / selectie_weq),
            wnet_pand: Math.round(s1a_som.wnet_pand / selectie_weq),
            wnet_transport: Math.round(s1a_som.wnet_transport / selectie_weq),
            wnet_bron: Math.round(s1a_som.wnet_bron / selectie_weq),
            iso: Math.round(s1a_som.iso / selectie_weq),
            inst: Math.round(s1a_som.inst / selectie_weq),
            om: Math.round(s1a_som.om / selectie_weq),
            energie: Math.round(s1a_som.energie / selectie_weq),
            h17_weighed: Math.round(s1a_som.h17_share),
            totaal_aantal_weq: s1a_som.aantalweq,
            warmtepomp_elek: s1a_som.kosten_elektriciteit_warmtepomp / selectie_weq,
            co2_red_totaal: co2_reductie_som,
        });

        bubblechartdata_collector.push(boxchart_data[0]);

        boxchart_data.push({
            stratid: "s2c",
            egnet: Math.round(s2c_som.egnet / selectie_weq),
            wnet_buurt: Math.round(s2c_som.wnet_buurt / selectie_weq),
            wnet_pand: Math.round(s2c_som.wnet_pand / selectie_weq),
            wnet_transport: Math.round(kapitaalslasten_transportnet_current),
            wnet_bron: Math.round(s2c_som.wnet_bron / selectie_weq),
            iso: Math.round(s2c_som.iso / selectie_weq),
            inst: Math.round(s2c_som.inst / selectie_weq),
            om: Math.round(s2c_som.om / selectie_weq),
            energie: Math.round(s2c_som.energie / selectie_weq),
            I11_aantalweq: results_static["ref30"].I11_aantalweq,
            warmtevraag: s2c_som.wnet_warmtevraag,
            h17_weighed: Math.round(s2c_som.h17_share),
            totaal_aantal_weq: s2c_som.aantalweq,
            warmtepomp_elek: 0,
        });

        bubblechartdata_collector.push(boxchart_data[1]);

        boxchart_data.push({
            stratid: "s2f",
            egnet: Math.round(s2f_som.egnet / selectie_weq),
            wnet_buurt: Math.round(s2f_som.wnet_buurt / selectie_weq),
            wnet_pand: Math.round(s2f_som.wnet_pand / selectie_weq),
            wnet_transport: Math.round(kapitaalslasten_transportnet_current),
            wnet_bron: Math.round(s2f_som.wnet_bron / selectie_weq),
            iso: Math.round(s2f_som.iso / selectie_weq),
            inst: Math.round(s2f_som.inst / selectie_weq),
            om: Math.round(s2f_som.om / selectie_weq),
            energie: Math.round(s2f_som.energie / selectie_weq),
            I11_aantalweq: results_static["ref30"].I11_aantalweq,
            warmtevraag: s2f_som.wnet_warmtevraag,
            h17_weighed: Math.round(s2f_som.h17_share),
            totaal_aantal_weq: s2f_som.aantalweq,
            warmtepomp_elek: 0,
        });

        bubblechartdata_collector.push(boxchart_data[2]);

        var h17_wa_array = [];
        h17_wa_array.push({
            strat: "s1a",
            h17: Math.round(s1a_som.h17_share),
        });
        h17_wa_array.push({
            strat: "s2c",
            h17: Math.round(s2c_som.h17_share),
        });
        h17_wa_array.push({
            strat: "s2f",
            h17: Math.round(s2f_som.h17_share),
        });

        h17_wa_array.sort(dynamicSort("h17"));
        store_visualisatiedataset_racechart.update((n) => h17_wa_array);
        store_visualisatiedataset_bubblechart.update((n) => bubblechartdata_collector);

        s1a_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}
        s2c_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}
        s2f_som = {egnet: 0, wnet_buurt: 0, wnet_pand: 0, wnet_transport: 0, wnet_bron: 0, iso: 0, inst: 0, om: 0, energie: 0, aantalweq: 0, h17_share: 0, kosten_elektriciteit_warmtepomp: 0, wnet_warmtevraag: 0}

        co2_reductie_som = 0;
        count_analysed = 0;
    };

    window.process_NK = (stratid, buurtcode) => {

        if (stratid == "s1a") {
            var mutatie_kapitaalslasten =
                results_dynamic[stratid].K01 +
                results_dynamic[stratid].K02 +
                results_dynamic[stratid].K03 +
                results_dynamic[stratid].K04 +
                results_dynamic[stratid].K05 +
                results_dynamic[stratid].K06 +
                results_dynamic[stratid].K07 +
                results_dynamic[stratid].K08 +
                results_dynamic[stratid].K09;

            var mutatie_variabelekosten =
                results_dynamic[stratid].K11 +
                results_dynamic[stratid].K12 +
                results_dynamic[stratid].K13 +
                results_dynamic[stratid].K14 +
                results_dynamic[stratid].K15 +
                results_dynamic[stratid].K16 -
                (results_static.ref30.K11 +
                results_static.ref30.K12 +
                results_static.ref30.K13 +
                results_static.ref30.K14 +
                results_static.ref30.K15 +
                results_static.ref30.K16);

            var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
            var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

            if ( selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
                count_analysed = count_analysed + 1;
                s1a_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
                s1a_som.wnet_buurt += results_dynamic[stratid].K04;
                s1a_som.wnet_pand += results_dynamic[stratid].K05;
                s1a_som.wnet_transport += results_dynamic[stratid].K06;
                s1a_som.wnet_bron += results_dynamic[stratid].K07;
                s1a_som.iso += results_dynamic[stratid].K08;
                s1a_som.inst +=  results_dynamic[stratid].K09;
                s1a_som.om += (results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16) - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
                s1a_som.energie += (results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13) - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
                s1a_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
                s1a_som.h17_share += (results_static.ref30.H15 / selectie_co2reductie) * resultaat_H17;
                co2_reductie_som += results_static.ref30.H15;
            }
            return Math.round(resultaat_H17);
        }
        //else do custom calculations for S2
        else if (stratid == "s2c") {
            var kostprijs_warmte = instelling_gjtarief / 100;
            var warmtekosten_allin = (results_dynamic[stratid].H10 + results_dynamic[stratid].H12) * kostprijs_warmte * results_static.ref30.I11_aantalweq;
            // H12 en H10 voor meting warmtevraag op niveau 'levering aan buurt'
            var mutatie_kapitaalslasten =
                results_dynamic[stratid].K01 +
                results_dynamic[stratid].K02 +
                results_dynamic[stratid].K03 +
                results_dynamic[stratid].K04 +
                results_dynamic[stratid].K05 +
                //results_dynamic[stratid].K06 +
                kapitaalslasten_transportnet_current *
                results_static.ref30.I11_aantalweq + // = K06
                //results_dynamic[stratid].K07 + //covered under allin-warmteprijs
                results_dynamic[stratid].K08 +
                results_dynamic[stratid].K09;

            var mutatie_variabelekosten =
                // results_dynamic[stratid].K11 +
                // results_dynamic[stratid].K12 +
                results_dynamic[stratid].K13 +
                results_dynamic[stratid].K14 +
                results_dynamic[stratid].K15 +
                results_dynamic[stratid].K16 -
                // results_static.ref30.K11 +
                (results_static.ref30.K12 + // discount reference gas use
                results_static.ref30.K13 +
                results_static.ref30.K14 +
                results_static.ref30.K15 +
                results_static.ref30.K16) +
                warmtekosten_allin;

            var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
            var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

            if ( selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
                s2c_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
                s2c_som.wnet_buurt += results_dynamic[stratid].K04;
                s2c_som.wnet_pand += results_dynamic[stratid].K05;
                s2c_som.wnet_transport += results_dynamic[stratid].K06; //unused, neaten
                s2c_som.wnet_bron += warmtekosten_allin;
                s2c_som.iso += results_dynamic[stratid].K08;
                s2c_som.inst += results_dynamic[stratid].K09;
                s2c_som.om += (results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16) - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
                s2c_som.energie += (results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13) - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
                s2c_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
                s2c_som.wnet_warmtevraag += (results_dynamic[stratid].H02 + results_dynamic[stratid].H03) * results_static.ref30.I11_aantalweq;
                s2c_som.h17_share += (results_static.ref30.H15 / selectie_co2reductie) * resultaat_H17;
            }
            return Math.round(resultaat_H17);
        }
        else if (stratid == "s2f") {
            var kostprijs_warmte = instelling_gjtarief / 100;
            var warmtekosten_allin = (results_dynamic[stratid].H10 + results_dynamic[stratid].H12) * kostprijs_warmte * results_static.ref30.I11_aantalweq;
            var mutatie_kapitaalslasten =
                results_dynamic[stratid].K01 +
                results_dynamic[stratid].K02 +
                results_dynamic[stratid].K03 +
                results_dynamic[stratid].K04 +
                results_dynamic[stratid].K05 +
                kapitaalslasten_transportnet_current *
                results_static.ref30.I11_aantalweq + // = K06 en  K07 = covered under allin-warmteprijs
                results_dynamic[stratid].K08 +
                results_dynamic[stratid].K09;

            var mutatie_variabelekosten =
                results_dynamic[stratid].K13 +
                results_dynamic[stratid].K14 +
                results_dynamic[stratid].K15 +
                results_dynamic[stratid].K16 -
                (results_static.ref30.K12 + // discount reference gas use
                results_static.ref30.K13 +
                results_static.ref30.K14 +
                results_static.ref30.K15 +
                results_static.ref30.K16) +
                warmtekosten_allin;

            var mutatie_netto = mutatie_kapitaalslasten + mutatie_variabelekosten;
            var resultaat_H17 = mutatie_netto / results_static.ref30.H15;

        if (selectie_buurtcodes.length >= 0 && selectie_buurtcodes.indexOf(buurtcode) >= 0) {
            s2f_som.egnet += results_dynamic[stratid].K01 + results_dynamic[stratid].K02 + results_dynamic[stratid].K03;
            s2f_som.wnet_buurt += results_dynamic[stratid].K04;
            s2f_som.wnet_pand += results_dynamic[stratid].K05;
            s2f_som.wnet_transport += results_dynamic[stratid].K06;
            s2f_som.wnet_bron += warmtekosten_allin;
            s2f_som.iso += results_dynamic[stratid].K08;
            s2f_som.inst += results_dynamic[stratid].K09;
            s2f_som.om += (results_dynamic[stratid].K14 + results_dynamic[stratid].K15 + results_dynamic[stratid].K16) - (results_static.ref30.K14 + results_static.ref30.K15 + results_static.ref30.K16);
            s2f_som.energie += (results_dynamic[stratid].K11 + results_dynamic[stratid].K12 + results_dynamic[stratid].K13) - (results_static.ref30.K11 + results_static.ref30.K12 + results_static.ref30.K13);
            s2f_som.aantalweq += parseInt(results_static.ref30.I11_aantalweq);
            s2f_som.wnet_warmtevraag += (results_dynamic[stratid].H02 + results_dynamic[stratid].H03) * results_static.ref30.I11_aantalweq;
            s2f_som.h17_share += (results_static.ref30.H15 / selectie_co2reductie) * resultaat_H17;
            }
        return Math.round(resultaat_H17);
        }
    };

    window.mutationrequest = (stratid, kid, value) => { knobvalues_dynamic[stratid][kid] = value; results_dynamic[stratid][kid] = results_static[stratid][kid] * knobvalues_dynamic[stratid][kid];};

    window.redraw_donutChart = () => {
    

    //var totaal_aantal_woningen_per_bouwperiode = [{bp1: 0},{bp2: 0},{bp3: 0},{bp4: 0},{bp5: 0},{bp6: 0},{bp7: 0}];
    //var totaal_aantal_woningen_per_woningtype = [{twee1kap: 0},{vrij: 0},{gestapeld: 0},{rijhoek: 0},{rijtussen: 0}];

    var donutdata_bouwperiode = [
        { label: "< 1930", value: totaal_aantal_woningen_per_bouwperiode.bp1 },
        { label: "1930 - 1945", value: totaal_aantal_woningen_per_bouwperiode.bp2 },
        { label: "1945 - 1965", value: totaal_aantal_woningen_per_bouwperiode.bp3 },
        { label: "1965 - 1976", value: totaal_aantal_woningen_per_bouwperiode.bp4 },
        { label: "1975 - 1992", value: totaal_aantal_woningen_per_bouwperiode.bp5 },
        { label: "1992 - 2005", value: totaal_aantal_woningen_per_bouwperiode.bp6 },
        { label: "2006 >", value: totaal_aantal_woningen_per_bouwperiode.bp7 }];

    store_selectie_woningen_bouwperiode.update((n) => donutdata_bouwperiode);

    var donutdata_woningtype = [
        { label: "Gestapeld", value: totaal_aantal_woningen_per_woningtype.gestapeld },
        { label: "2-1-kap", value: totaal_aantal_woningen_per_woningtype.twee1kap },
        { label: "Rij-hoek", value: totaal_aantal_woningen_per_woningtype.rijhoek },
        { label: "Rij-tussen", value: totaal_aantal_woningen_per_woningtype.rijtussen },
        { label: "Vrijstaand", value: totaal_aantal_woningen_per_woningtype.vrijstaand },
    ];

    store_selectie_woningen_woningtype.update((n) => donutdata_woningtype);

    var donutdata_weq = [
        { label: "s1a", value: s1a_aantalweq },
        { label: "s2c", value: s2c_aantalweq },
        { label: "s2f", value: s2f_aantalweq }];
    
        s1a_aantalweq = 0;
        s2c_aantalweq = 0;
        s2f_aantalweq = 0;
        totaal_aantal_woningen_per_bouwperiode.bp1 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp2 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp3 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp4 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp5 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp6 = 0;
        totaal_aantal_woningen_per_bouwperiode.bp7 = 0;

        totaal_aantal_woningen_per_woningtype.gestapeld = 0;
        totaal_aantal_woningen_per_woningtype.twee1kap = 0;
        totaal_aantal_woningen_per_woningtype.rijhoek = 0;
        totaal_aantal_woningen_per_woningtype.rijtussen = 0;
        totaal_aantal_woningen_per_woningtype.vrijstaand = 0;
    
    if ( JSON.stringify(donutdata_bouwperiode) != JSON.stringify(window.donutdata_bouwperiode_log)){
        donutChartChange_bouwperiode(donutdata_bouwperiode);
    }
    if ( JSON.stringify(donutdata_woningtype) != JSON.stringify(window.donutdata_woningtype_log)) {
        donutChartChange_woningtype(donutdata_woningtype);
    }
    if (JSON.stringify(window.donutdata_weq_log) != JSON.stringify(donutdata_weq)){
     // do nothing
    }
    if ( JSON.stringify(window.donutdata_weq_log) != JSON.stringify(donutdata_weq)) {
        donutChartChange_weq(donutdata_weq);
    }

    window.donutdata_bouwperiode_log = donutdata_bouwperiode; // store van maken
    window.donutdata_woningtype_log = donutdata_woningtype; // store van maken
    window.donutdata_weq_log = donutdata_weq; // store van maken

    };

    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
            return result * sortOrder;
        };
    }
</script>
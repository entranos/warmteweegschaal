<!--
Bestand: OutputPanel.Svelte
Omschrijving: Informatieweergave window linksonder
Opmerkingen: -
Verbeterpotentieel: routing logischer maken
Dependencies: d3, leaflet
Auteur: Tijs Langeveld
-->
<script>
    import { store_visualisatiedataset_bubblechart } from "./stores.js";
    import { mdiArrowUpDropCircle} from "@mdi/js"; // npm install @mdi/js
    import { MaterialApp, Tabs, Tab, Icon, Window, WindowItem, ExpansionPanels, ExpansionPanel,} from "svelte-materialify";
    import { onMount } from "svelte";
    import { store_input_primarydataset_raw } from "./stores.js";
    
    var data_gemeenten;
    store_input_primarydataset_raw.subscribe((value) => { data_gemeenten = value;});
    
    import RaceChart from "./RaceChart.svelte";
    import BlockChart from "./BubbleChart.svelte";
    import DonutChartBouwperiode from "./DonutChart_bouwperiode.svelte";
    import DonutChartWoningtype from "./DonutChart_woningtype.svelte";

    import { store_selectie_woningen_woningtype } from "./stores.js";
    var selectie_woningen_woningtype;
    store_selectie_woningen_woningtype.subscribe((value) => { selectie_woningen_woningtype = value; });
    
    import { store_selectie_woningen_bouwperiode } from "./stores.js";
    var selectie_woningen_bouwperiode;
    store_selectie_woningen_bouwperiode.subscribe((value) => { selectie_woningen_bouwperiode = value; });


    import { store_selectie_buurtnamen } from "./stores.js";
    var selectie_buurtnamen;
    store_selectie_buurtnamen.subscribe((value) => { selectie_buurtnamen = value; });

    import { store_tussenresultaat_primarydataset_processed } from "./stores.js";
    import { store_input_primarydataset_processed } from "./stores.js";

    import { store_instelling_lengtetransportleiding } from "./stores.js";
    var lengte_transportleiding_current;
    store_instelling_lengtetransportleiding.subscribe((value) => { lengte_transportleiding_current = value; });

    var results_dynamic_listen;
    store_tussenresultaat_primarydataset_processed.subscribe((value) => { results_dynamic_listen = value; });

    var results_static_listen;
    store_input_primarydataset_processed.subscribe((value) => { results_static_listen = value; });

    var data_boxchart;
    store_visualisatiedataset_bubblechart.subscribe((value) => { data_boxchart = value; });

    import { store_instelling_gjtarief } from "./stores.js";

    var slider_s2_gjtarief;
    store_instelling_gjtarief.subscribe((value) => { slider_s2_gjtarief = value; });

    let theme = "light";

    onMount(() => {
        d3.selectAll("#OutputPanel .horizontal").style("margin", "0px");
        d3.selectAll("#OutputPanel .s-expansion-panel__header").style("background-color","#323232");
        d3.selectAll("#OutputPanel .s-expansion-panel__header").style("margin-bottom","0px");
    
    });

    let value = 0;
    let yeah;
    // $: console.log(klapuit_output);

    let klapuit_output = [1]; //start closed
    window.toggle_output = (n) => {
        if (klapuit_output[0] == 1 || klapuit_output.length == 0) {
            klapuit_output = [0]; //open
            setTimeout(function () { draw_racechart(); }, 100); //neaten
        }
    };

    var dyna = results_dynamic_listen;
    var stati = store_input_primarydataset_processed;

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function generate_selection_string(selectie_buurtnamen){
        var i;
        var returnstring = '';
        console.log(selectie_buurtnamen)
        if (selectie_buurtnamen){
            for (i=0;i<selectie_buurtnamen.length;i++){
                returnstring = returnstring.concat(selectie_buurtnamen[i])
                if (selectie_buurtnamen.length - i > 1 ){ returnstring = returnstring.concat(', ')}
            }
            return returnstring;
        }
        return '';
    }
</script>

<MaterialApp {theme}>
    <ExpansionPanels tile class="rounded-0" bind:value={klapuit_output} style="pointer-events: all; position:absolute; left: 5px; bottom:5px; width: 800px; border-top-left-radius:0px; border-top-right-radius:0px;">
        <ExpansionPanel>
            <span class="white-text text-accent-3" slot="header" style="font-size: 18px; font-weight:800;">Selectie <p style='font-size:13px; position:absolute; top:20px;left:130px; width:600px;'>{generate_selection_string(selectie_buurtnamen)}</p></span>
            <span slot="icon" let:active>
                <Icon path={mdiArrowUpDropCircle} size="40px" class="mdi white-text" rotate={active ? 180 : 0}/>
            </span>
            <div style="height:290px; width:100%;">
                <Tabs class="black-text text-accent-3" bind:value>
                    <div slot="tabs">
                        <Tab>KOSTEN</Tab>
                        <Tab>POSTEN</Tab>
                        <Tab>WARMTENET</Tab>
                        <Tab>WONINGTYPEN</Tab>
                        <Tab>BOUWPERIODE</Tab>
                    </div>
                </Tabs>
                <Window {value} class="ma-0">
                    <WindowItem>
                        <div style="height:240px; background-color:none;">
                            <p style="position:absolute;left:0px; top:20px; font-size:18px; font-weight:800; width:600px;">Nationale kosten (€ per ton CO2-reductie per jaar)</p>
                            <p style="position:absolute;left:0px; top:60px; font-size: 13px; width:280px;">[ Toelichting Grafiek ]</p>
                            <div id="RaceChartDiv" style="position:absolute; width:100%; left:300px; height:300px; top: 50px;">
                                <RaceChart />
                            </div>
                        </div>
                    </WindowItem>
                    <WindowItem>
                        <div style="position:relative; width:100%; height:240px; float:left;">
                            <div style="position:absolute; right:0px; width:100%; height:240px; background-color:none;">
                                <p style="position:absolute;left:0px; top:20px; font-size:18px; font-weight:800; width:600px;">Verdeling over kostenposten</p>
                                <p style="position:absolute;left:0px; top:60px; font-size: 13px; width:280px;">De grafiek toont voor elk van de drie opties de verdeling van kosten over negen verschillene kostenposten.</p>
                                <p style="position:absolute;left:0px; top:150px; font-size: 13px; width:220px;">De omvang van een bolletje is een maat voor de omvang van de kostenpost.</p>
                                <div id="BlockChartDiv" style="position:absolute; width:100%; left:340px; height:300px; top: 50px;">
                                    <BlockChart />
                                </div>
                            </div>
                        </div>
                    </WindowItem>
                    <WindowItem>
                        <!-- content -->
                    </WindowItem>
                    <WindowItem>
                        <div style ="width:300px; height:300px;">
                            <img style="position:absolute; top:55px; left:10px;" src="img/wt_gestapeld.png" alt="icon" width="26" height="33"/>
                            <img style="position:absolute; top:95px; left:10px;" src="img/wt_rijhoek.png" alt="icon" width="26" height="33"/>
                            <img style="position:absolute; top:135px; left:10px;" src="img/wt_rijtussen.png" alt="icon" width="26" height="33"/>
                            <img style="position:absolute; top:175px;  left:10px;" src="img/wt_21kap.png" alt="icon" width="26" height="26"/>
                            <img style="position:absolute; top:215px; left:10px;" src="img/wt_vrij.png" alt="icon" width="26" height="26"/>
                            <p style="position:absolute;left:10px; top:10px; font-size:20px; font-weight:600; width:600px;">{numberWithCommas(selectie_woningen_woningtype[0].value + selectie_woningen_woningtype[1].value + selectie_woningen_woningtype[2].value +selectie_woningen_woningtype[3].value + selectie_woningen_woningtype[4].value)} woningen</p>
                            <p style="position:absolute;left:60px; top:60px; font-size:15px; font-weight:400; width:600px;"><strong>Gestapeld:</strong> {numberWithCommas(selectie_woningen_woningtype[0].value)}</p>        
                            <p style="position:absolute;left:60px; top:100px; font-size:15px; font-weight:400; width:600px;"><strong>Rijwoning hoek:</strong> {numberWithCommas(selectie_woningen_woningtype[2].value)}</p>
                            <p style="position:absolute;left:60px; top:140px; font-size:15px; font-weight:400; width:600px;"><strong>Rijwoning tussen:</strong> {numberWithCommas(selectie_woningen_woningtype[3].value)}</p>
                            <p style="position:absolute;left:60px; top:180px; font-size:15px; font-weight:400; width:600px;"><strong>Twee-onder-één-kap:</strong> {numberWithCommas(selectie_woningen_woningtype[1].value)}</p>
                            <p style="position:absolute;left:60px; top:220px; font-size:15px; font-weight:400; width:600px;"><strong>Vrijstaand:</strong> {numberWithCommas(selectie_woningen_woningtype[4].value)}</p>
                            <div id="DonutChartB" style="position:absolute; width:400px; left:380px; height:300px; top: 0px;">
                                <DonutChartWoningtype />
                            </div>
                        </div>
                    </WindowItem >
                    <WindowItem>
                        <div style ="width:300px; height:300px;">
                            <p style="position:absolute;left:10px; top:10px; font-size:20px; font-weight:600; width:600px;">{numberWithCommas(selectie_woningen_woningtype[0].value + selectie_woningen_woningtype[1].value + selectie_woningen_woningtype[2].value +selectie_woningen_woningtype[3].value + selectie_woningen_woningtype[4].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:60px; font-size:15px; font-weight:600; width:600px;">1930 en eerder:</p>  <p style="position:absolute;left:130px; top:60px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[0].value)} woningen</p>        
                            <p style="position:absolute;left:10px; top:85px; font-size:15px; font-weight:600; width:600px;">1930 - 1945:</p>     <p style="position:absolute;left:130px; top:85px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[1].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:110px; font-size:15px; font-weight:600; width:600px;">1945 - 1965:</p>    <p style="position:absolute;left:130px; top:110px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[2].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:135px; font-size:15px; font-weight:600; width:600px;">1965 - 1975:</p>    <p style="position:absolute;left:130px; top:135px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[3].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:160px; font-size:15px; font-weight:600; width:600px;">1975 - 1992:</p>    <p style="position:absolute;left:130px; top:160px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[4].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:185px; font-size:15px; font-weight:600; width:600px;">1992 - 2005:</p>    <p style="position:absolute;left:130px; top:185px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[5].value)} woningen</p>
                            <p style="position:absolute;left:10px; top:210px; font-size:15px; font-weight:600; width:600px;">2006 en later:</p>  <p style="position:absolute;left:130px; top:210px; font-size:15px; font-weight:400; width:600px;">{numberWithCommas(selectie_woningen_bouwperiode[6].value)} woningen</p>
                            <div id="DonutChartA" style="position:absolute; width:400px; left:380px; height:300px; top: 0px;">
                                <DonutChartBouwperiode />
                            </div>
                        </div>
                    </WindowItem>
                </Window>
            </div>
        </ExpansionPanel>
    </ExpansionPanels>
</MaterialApp>

<style>
    p {
        margin: 0;
        font-size: 13px;
    }
</style>
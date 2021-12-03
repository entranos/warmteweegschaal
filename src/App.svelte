<!--
Bestand: App.svelte
Functie: Top-level svelte app bestand, component declaraties
Toellichting:   Calculations.svelte             - Logic - Code voor berekeningen (mutaties van) nationale kosten
                DonutChartWeq.svelte            - Datavisualisatie - donut chart, verdeling woningequivalenten over varianten
                DonutChartBouwperiode.svelte    - Datavisualisatie - donut chart, verdeling aantallen woningen over bouwperioden
                DonutChartWoningtype.svelte     - Datavisualisatie - donut chart, verdeling aantallen woningen over woningtypen
                InputPanel.svelte               - GUI - titel en kaartlaagselectiemenu
                SliderPanel.svelte              - GUI - sliders voor instellingen bronkosten en kosten transportnet
                OutputPanel.svelte              - GUI - tabbed menu met uitkomsten (text + datavisualisaties)
                LegendaPanel.svelte             - GUI - Kaartlegenda
                Map.svelte                      - GUI - Leaflet kaart
                GemeenteSelector.svelte         - Gemeenteselectiemenu
                
                SUB-IMPORTS (.svelte):
                BubbleChart.svelte              - Datavisualisatie - custom chart, verdeling van totaalkosten over posten
                RaceChart                       - Datavisualisatie - Race chart bar chart, actuele nationale kosten per variant
Opmerkingen: haakt in op tool via "#BlockChartDiv", geinstantieerd in "OutputPanel.svelte"
Dependencies: d3.js
Auteur: Tijs Langeveld
-->
<script>

    import Calculations from './Calculations.svelte';
    import DonutChartWeq from './DonutChart_weq.svelte'
    import DonutChartBouwperiode from './DonutChart_bouwperiode.svelte';
    import DonutChartWoningtype from './DonutChart_woningtype.svelte';
    import InputPanel from "./InputPanel.svelte";
    import SliderPanel from "./SliderPanel.svelte";
    import OutputPanel from "./OutputPanel.svelte";
    import LegendaPanel from "./LegendaPanel.svelte";
    import Map from './Map.svelte';
    import GemeenteSelector from './GemeenteSelector.svelte';

    import { onMount } from "svelte";

    const component0 = new Calculations({target:document.querySelector('#InputPanel')});
    const component1 = new DonutChartWeq({target: document.querySelector('#donutChart')});
    const component2 = new DonutChartBouwperiode({target: document.querySelector('body')});
    const component3 = new DonutChartWoningtype({target: document.querySelector('body')});
    const component4 = new InputPanel({target: document.querySelector('#InputPanel')});
    const component5 = new SliderPanel({target: document.querySelector('#SliderPanel')});
    const component6 = new OutputPanel({target: document.querySelector('#OutputPanel')});
    const component7 = new LegendaPanel({target: document.querySelector('#LegendaPanel')});
    const component8 = new Map({target: document.querySelector('#map')});
    const component9 = new GemeenteSelector({target: document.querySelector('#main')});


    onMount(() => {
        window.onresize(); // init
    });

    window.onresize= () => {
        window.resize_sliderpanel();
        window.redraw_topbar();
    };

</script>
<!--
Bestand: InputPanel.Svelte
Functie: Intekenen logo linksboven. Kaartlagenselectiemenu links. Dialogs met gebruiksaanwijzing tool.
Opmerkingen: -
Verbeterpotentieel: Kaartlaagselectiemenu volledig uitvoeren in SvelteMaterialify componenten
Dependencies: SvelteMaterialify, d3.js
Auteur: Tijs Langeveld
-->
<script>
    import { store_input_primarydataset_raw } from "./stores.js";
    import { store_instelling_gjtarief } from "./stores.js";
    import { Switch, MaterialApp, Button, Dialog} from "svelte-materialify";

    import { store_selectie_weq } from "./stores.js";
    var aant_weq_curr_select;
    store_selectie_weq.subscribe((value) => {
        aant_weq_curr_select = value;
    });

    import { store_instelling_lengtetransportleiding } from "./stores.js";
    var lengte_transportleiding_current;
    store_instelling_lengtetransportleiding.subscribe((value) => {
        lengte_transportleiding_current = value;
    });

    import { store_tussenresultaat_kapitaalslasten_transportnet } from "./stores.js";
    
    import { store_instelling_kostenkentaltransportnet } from "./stores.js";
    var sliderpanel_transportnet_kostenkental_current;
    store_instelling_kostenkentaltransportnet.subscribe((value) => {
        sliderpanel_transportnet_kostenkental_current = value;
    });

    import { store_selectie_buurtcodes } from "./stores.js";
    var buurtselectie_array;
    store_selectie_buurtcodes.subscribe((value) => {
        buurtselectie_array = value;
    });

    store_input_primarydataset_raw.subscribe((value) => {
        data = value;
    });

    import { store_instelling_mapcontextswitch } from "./stores.js";

    // import { store_instelling_kleurselectieswitch } from "./stores.js";
    // var instelling_kleurselectieswitch = true;
    // $: if (instelling_kleurselectieswitch) {adapt_opacity(0.4)} else {adapt_opacity(0)}
    // $: store_instelling_kleurselectieswitch.update((n) => instelling_kleurselectieswitch);

    var sliderpanel_active = false;

    var data = 0;
    var svg_top;
    let theme = "light";

    var cnt;

    let infoDialog_KL1; function open_iD_KL1(){ infoDialog_KL1 = true} function close_iD_KL1(){ infoDialog_KL1 = false} 
    
    let infoDialog_Gebruiksaanwijzing; function open_iD_Gebruiksaanwijzing(){ infoDialog_Gebruiksaanwijzing = true} function close_iD_Gebruiksaanwijzing(){ infoDialog_Gebruiksaanwijzing = false} 

    import { onMount } from "svelte";

    onMount(() => {
        d3.selectAll("#InputPanel .s-app-bar__wrapper").style("background","transparent");
    
        svg_top = d3
            .select("#InputPanel")
            .append("svg")
            .style('position','absolute')
            .style('pointer-events','none')
            .style('top','0px')
            .style("width", '100%')
            .attr("height", 70)
            .style('opacity',1)
            redraw_topbar();
    });

    window.redraw_topbar = () => {

        d3.selectAll('.topbaritem').remove();
        var topbarcolor = '#323232'
        svg_top.append('rect')
            .attr('x',3)
            .attr('y',3)
            .attr('fill',topbarcolor)
            .attr('width',305)
            .attr('height',64)
            .attr('class','topbaritem')
        svg_top
            .append('svg:image')
            .attr('xlink:href', 'img/scale.png')
            .attr('x', 20)
            .attr('y', 16-1)
            .style('opacity',1)
            .attr('width', 40)
            .attr('height', 40);
        svg_top // teken text op horizontale labels
            .append("text")
            .attr('class','topbaritem')
            .style("color", '#fff')
            .text('WARMTEWEEGSCHAAL').style("font-family", "Varela Round").style("font-size", 17 + "px").style("font-weight", 800)
            .attr("x", 19+60).attr("y", 29+7-6);
        svg_top // teken text op horizontale labels
            .append("text")
            .attr('class','topbaritem')
            .style("color", '#ffab91')
            .text('warmtenet').style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400)
            .attr("x", 19+60).attr("y", 53+7-6-3)
        svg_top // teken text op horizontale labels
            .append("text")
            .attr('class','topbaritem')
            .style("color", '#fff')
            .text('vs.').style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400)
            .attr("x", 19+98+60-6).attr("y", 53+7-6-3)
        svg_top // teken text op horizontale labels
            .append("text")
            .attr('class','topbaritem')
            .style("color", '#90caf9')
            .text('all-electric').style("font-family", "Varela Round").style("font-size", 16 + "px").style("font-weight", 400)
            .attr("x", 19+125+60).attr("y", 53+7-6-3)
    };

    window.unfold_sliderpanel = () => {
        if (!sliderpanel_active) {
            sliderpanel_active = true;
            d3.select("#SliderPanel")
                .transition()
                .duration(1000)
                .style("top", "40px");
            d3.select("#OutputPanel")
                .transition()
                .duration(1000)
                .style("bottom", "0px");
            d3.select("#LegendaPanel")
                .transition()
                .duration(1000)
                .style("bottom", "0px");
        }
    };

    window.recalculate_all = () => {
        if (data != 0) {
            var totaalinvestering_transportnet = lengte_transportleiding_current * sliderpanel_transportnet_kostenkental_current;
            var totaalinvestering_transportnet_per_weq = totaalinvestering_transportnet / aant_weq_curr_select;
            var kapitaalslasten_transportnet_per_weq = Math.abs(PMT(0.03, 30, totaalinvestering_transportnet_per_weq, 0, 0));

            store_tussenresultaat_kapitaalslasten_transportnet.update((n) => kapitaalslasten_transportnet_per_weq);

            for (cnt = 0; cnt < data.features.length; cnt++) {
                if (buurtselectie_array.indexOf(data.features[cnt].properties.BU_CODE) >= 0) {
                    recalculate_results(data.features[cnt].properties);
                    color_buurten(cnt, data.features[cnt].properties.BU_CODE);
                } else {
                    d3.select("#" + data.features[cnt].properties.BU_CODE)
                        .attr("fill", function () {
                            return get_color_D02(parseInt(data.features[cnt].properties.D02));
                        })
                        .style("opacity", 0.6);
                }
            }
            update_boxchartdata();
            if (flag_racechart_active) {
                draw_racechart();
            }
            redraw_donutChart(); 
        }
    };

    // SLIDER S2: GJ-tarief
    let slider_s2_gjtarief = [300];
    
    $: store_instelling_gjtarief.update((n) => slider_s2_gjtarief);

    $: change_s2_gjtarief(slider_s2_gjtarief);
    function change_s2_gjtarief() {
        var value_ = slider_s2_gjtarief / 100;
        recalculate_all();
        redraw_donutChart();
    }

    let selected = 'dichtheid';

    store_instelling_mapcontextswitch.update((n) => selected);	//init
	function onChange(event) {
		selected = event.currentTarget.value;
        store_instelling_mapcontextswitch.update((n) => event.currentTarget.value);
	}
</script>

<MaterialApp {theme}>
    <div id= "button_handleiding" style = "position:absolute; width: 305px; height:47px; top:70px; left:-200px; pointer-events:all; background-color:#323232; ">
        <div class="text-center">
            <Button style='width:465px; position:absolute; top:3px; left:-80px; height: 40px; font-size:25px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_Gebruiksaanwijzing = true)}><strong>GEBRUIKSAANWIJZING</strong></Button>
        </div>
    </div>
    <div id= "mapcontext_radiobuttons" style = "position:absolute; width: 305px; height:285px; top:120px; left:-200px; pointer-events:all; background-color:#323232; ">
        <p style="position: absolute; font-size: 18px; left:20px; top: 20px;"><strong>Kaartlagen</strong></p>
        <p style="position: absolute; font-size: 16px; left:55px; top: 108px;">Bebouwingsdichtheid</p>
        <p style="position: absolute; font-size: 16px; left:55px; top: 148px;">Bouwperiode</p>
        <p style="position: absolute; font-size: 16px; left:55px; top: 68px;">Bronbudget</p>
        <!-- <p style="position: absolute; font-size: 16px; left:55px; top: 188px;">Combinatie dichtheid/periode</p> -->
        <p style="position: absolute; font-size: 16px; left:55px; top: 188px;">Achtergrondkaart</p>
        <!-- <p style="position: absolute; font-size: 14px; left:75px; top: 242px;">Kleur selectie op kaart</p> -->
        <label>
            <input checked={selected===30} on:change={onChange} type="radio" style="position: absolute; left:25px; top:70px;" name="amount" value="d02" />
        </label>
        <label>
            <input checked={selected==='dichtheid'} on:change={onChange} type="radio" style="position: absolute; left: 25px; top:110px;" name="amount" value="dichtheid" />
            <div style="position:absolute; top:66px; left:215px;">
                <div class="text-center">
                    <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_KL1 = true)}>info</Button>
                </div>
            </div>
        </label>
        <label>
            <input checked={selected===20} on:change={onChange} type="radio" style="position: absolute; left:25px; top:150px;" name="amount" value="bouwperiode" />
        </label>
        <label>
            <input checked={selected===40} on:change={onChange} type="radio" style="position: absolute; left:25px; top:190px;" name="amount" value="nothing" />
        </label>
    </div>

    <!-- INFO DIALOGS -->

    <Dialog class="pa-16 text-center" width='1200px' bind:active={infoDialog_KL1}>
        <p style='color:black; font-size:30px'><strong>Bronbudget</strong></p>
        <img style="z-index:90000;" src="img/bestedingsruimte_warmtenet.jpg" alt="icon" width="1100" height="630"/>
        <Button on:click={close_iD_KL1} text class="black-text" style='margin-top:30px;border:1px solid #333;'>OK</Button>
    </Dialog>
    <Dialog class="pa-16 text-center" width='800px' bind:active={infoDialog_Gebruiksaanwijzing}>
        <h1 style='color:black'><strong>GEBRUIKSAANWIJZING WARMTEWEEGSCHAAL</strong></h1>
        <div class='p2' style='color:black;'>Dit is een korte versie van de handleiding waar je snel mee van start kunt. Een uitgebreide versie van de handleiding vind je <a href> hier</a>. (volgt nog)</div>
        <h2 style='color:black'><span style="background-color: #64ffda">Het gebruiksdoel</span></h2>
        <p style='color:black'>Met de warmteweegschaal vergelijk je <strong>twee transitieroutes</strong> met elkaar. Op de ene kant van de weegschaal staat de <strong>collectieve</strong> route en op de andere kant de <strong>individuele</strong> route. De collectieve route behelst het ontwikkelen van een buurt-breed warmtenet. Op de individuele route wordt een all-electric oplossing met warmtepomp toegepast, individueel per woning of gebouw. </p>
        <h2 style='color:black'><span style="background-color: #64ffda">De focus</span></h2>
        <p style='color:black'>De Warmteweegschaal is er primair op gericht gebieden op de <strong>potentie van warmtenetten</strong> als eindoplossing te verkennen. Tussenstappen, oplossingen met hernieuwbaar gas in de basis en kleinschalige gebouw- of blokgebonden warmtenetten vallen buiten de scope van de Warmteweegschaal. Voor gebied waar de Warmteweegschaal een lage potentie voor warmtenetten en buitengewoon hoge kosten voor all-electric laat zien zijn laatstgenoemde oplossingsrichtingen mogelijk een beter alternatief.
        <h2 style='color:black'><span style="background-color: #64ffda">De bediening</span></h2>
        <p style='color:black'>Kies een te analyseren gemeente en klik op één of meerdere buurten om een gebiedsselectie te maken. Analyseer het gebied door gebruik te maken van de volgende onderdelen:</p>
        <ul>
            <li>
                <p style='color:black'>Het <strong>'Selectie'</strong> menu links onderaan de pagina toont rekenresultaten en statistieken over het geselecteerde gebied. Bij selectie van meerdere buurten tonen de grafieken de totalen over alle geselecteerde buurten of de op het aantal woningequivalenten in een buurt gewogen gemiddelde kosten over alle geselecteerde buurten. Dit menu bestaat uit een vijftal tabs welke de volgende informatie tonen:</p>
                <ul>
                    <li>Tab <strong>'Kosten'</strong>: De nationale meerkosten per oplossing in €/ton C02-reductie/jaar. </li>
                    <li>Tab <strong>'Posten'</strong>: De verdeling van de kosten over de verschillende posten.</li>
                    <li>Tab <strong>'Warmtenet'</strong>: Informatie over het warmtenet (aangesloten aantal woningequivalenten, het benodigde warmtevolume en de veronderstelde kosten per weq) </li>
                    <li>Tab <strong>'Woningtypen'</strong>: De verdeling van het totaal aantal woningen binnen de selectie over de woningtypen</li>
                    <li>Tab <strong>'Bouwperiode'</strong>: De verdeling van het totaal aantal woningen binnen de selectie over de bouwperioden</li>
                </ul>
            </li>
            <li>In de Warmteweegschaal zijn een aantal kaarten opgenomen die inzicht geven in de bebouwingsdichtheid en leeftijd van bebouwing. Wijzig via het <strong>'Kaartlagen'</strong> menu links bovenaan de pagina de getoonde kaartlaag. Klik op de 'INFO' knoppen bij de kaartlagen voor een uitgebreide toelichting bij de kaartlaag.</li>
            <li>Zodra er een gebiedsselectie is gemaakt verschijnt bovenaan het scherm een schuif getiteld 'warmtekosten'. Klik op de 'INFO' knop naast de schuif voor een uitleg over de schuif.</li>
        </ul>
        <h2 style='color:black'><span style="background-color: #64ffda">De basis</span></h2>
        <p style='color:black'>De warmteweegschaal is gebaseerd op de uitkomsten uit de <strong>Startanalyse Aardgasvrije Buurten</strong> van het Planbureau voor de Leefomgeving. In lijn met de Startanalyse rekent de warmteweegschaal op het niveau van <strong>nationale kosten</strong> en kijkt de warmteweegschaal op <strong>CBS-buurtniveau.</p>
        <h2 style='color:black'><span style="background-color: #64ffda">De uitbreiding</span></h2>
        <p style='color:black'>De warmteweegschaal volgt de resultaten uit de Startanalyse, met één belangrijke uitzondering: op de collectieve route zijn de kosten voor de warmtebron en warmtetransportleiding dynamisch instelbaar gemaakt. Dit dient twee doelen:</p>
        <ul>
            <li><strong>Alle</strong> buurten kunnen op de potentie van warmtenetten worden geanalyseerd, zonder afhankelijk te zijn van de <strong>beschikbaarheid of volledigheid van data</strong> over een nabijgelegen warmtebron en de bronallocaties van Vesta MAIS.</li>
            <li><strong>Verbeterd inzicht</strong> in de redenen <strong>waarom</strong> een warmtenet qua kosten als meer of minder interessant naar voren komt voor een bepaalde buurt of combinatie van buurten</li>
            <ul>
                <li>door inzichtelijk te maken <strong>onder welke condities </strong> van bronbeschikbaarheid een warmtenet lagere nationale kosten geeft</li>
                <li>door de <strong>bebouwingskarakteristieken</strong> van een buurt op dichtheid en bouwperiode in beeld te brengen.</li>
            </ul>
        </ul>
        <h2 style='color:black'><span style="background-color: #64ffda">De methode</span></h2>
        <p style='color:black'>De Warmteweegschaal berekent de extra nationale kosten per ton CO2-uitstoot voor een drietal oplossingen:</p>
        <ul>
            <li><span style="background-color: #90caf9"><strong>Een individuele all-electric oplossing met warmtepomp.</strong></span> De getoonde kosten voor deze route komen exact overeen met de in de Startanalyse getoonde resultaten voor variant met individuele lucht-water warmtepomp (variant S1a).</li>
            <li><span style="background-color: #ffab91"><strong>Een warmtenet in combinatie met isolatieniveau D+.</strong></span> De getoonde kosten voor deze route zijn deels overgenomen uit de resultaten uit de Startanalyse. Dit geldt voor de kosten voor aanleg van het wijkdistributienet, voor onderhoud en beheer, leidingen en installaties in gebouwen en de isolatiekosten (variant S2f). De kosten voor de ontwikkeling en exploitatie van de warmtebron en de warmtetransportleiding zijn vrij instelbaar.</li>
            <li><span style="background-color: #ffecb3"><strong>Een warmtenet in combinatie met isolatieniveau B+.</strong></span> Hiervoor is de opzet overeenkomstig met laatstgenoemde oplossing, met als verschil de toepassing van schilisolatieniveau label B+ in plaats van D+ (variant S2c).</li>
        </ul>
        <h2 style='color:black'><span style="background-color: #64ffda">Aandachtspunt</span></h2>
        <p style='color:black'>De warmteweegschaal volgt de Nationale Kosten methodiek van de Startanalyse. Houd er rekening mee dat het niet zonder meer mogelijk is om op basis van de Nationale Kosten te concluderen dat een warmtenet voor een buurt zowel een haalbare businesscase voor een warmtebedrijf als lagere kosten voor de eindgebruiker ten opzichte van all-electric oplevert. Een businesscase berekening is noodzakelijk om daar uitsluitsel over te krijgen. Met gebruik van de warmteweegschaal kan je erachter komen voor welke buurten het de moeite waard kan zijn zo'n businesscase berekening uit te werken. Hoe groter het verschil in Nationale Kosten, hoe groter de kans dat een warmtenet een voor zowel het warmtebedrijf als de eindgebruiker interessante optie is. Uit een steekproefsgewijze analyse van buurten komt naar voren dat... </p>
        <Button on:click={close_iD_Gebruiksaanwijzing} text class="black-text" style='margin-top:30px;border:1px solid #333;'>OK</Button>
    </Dialog>
</MaterialApp>


<style>

    ul{
        text-align: left;
    }

    li{
    margin-bottom: 5px;
    }

    p {
        font-size: 16px;
        margin-bottom: 10px;
        left: 10px;
        color: white;
        position: relative;
        text-align: left;
    }

    .p2 {
        font-size: 18px;
        top: 10px;
        margin-bottom: 10px;
        left: 10px;
        color: white;
        position: relative;
        text-align: left;
    }

    h1 {
        font-size: 28px;
        top: 10px;
        font-weight:400;
        margin-bottom: 10px;
        left: 10px;
        color: white;
        position: relative;
    }

    h2 {
        font-size: 18px;
        top: 10px;
        font-weight:800;
        margin-bottom: 0px;
        text-align:left;
        left: 10px;
        color: white;
        position: relative;
    }

    input[type='radio']:after {
            width: 25px;
            height: 25px;
            border-radius: 15px;
            top: -4px;
            left: -4px;
            position: relative;
            background-color: #777;
            content: '';
            display: inline-block;
            visibility: visible;
            border: 2px solid #777;
        }

    input[type='radio']:checked:after {
        width: 25px;
        height: 25px;
        border-radius: 15px;
        top: -4px;
        left: -4px;
        position: relative;
        background-color: #64ffda;
        content: '';
        display: inline-block;
        visibility: visible;
        border: 4px solid #64ffda;
    }
</style>
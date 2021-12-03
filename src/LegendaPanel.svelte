<!--
Bestand: LegendaPanel.Svelte
Functie: Kaartlegenda
Opmerkingen: -
Verbeterpotentieel: styling obv SvelteMaterialify's classes schema's toepassen
Dependencies: SvelteMaterialify, @mdi/js
Auteur: Tijs Langeveld
-->
<script>
    import { mdiArrowUpDropCircle } from "@mdi/js"; // npm install @mdi/js
    import { MaterialApp, Icon, Window, WindowItem, ExpansionPanels, ExpansionPanel,} from "svelte-materialify";
    import { onMount } from "svelte";

    import { store_instelling_mapcontextswitch } from "./stores.js";
    var instelling_mapcontextswitch;
    store_instelling_mapcontextswitch.subscribe((value) => { instelling_mapcontextswitch = value; });

    let theme = "light";
    let value = 0;

    onMount(() => {

        d3.selectAll("#LegendaPanel .horizontal").style("margin", "0px");
        d3.selectAll("#LegendaPanel .s-expansion-panel__header").style("background-color","#323232");
        d3.selectAll("#LegendaPanel .s-expansion-panel__header").style("margin-bottom","0px");
            
    });

    $: if(klapuit_legenda.length > 0){console.log('uitgeklapt'); d3.selectAll('.leaflet-control').transition().duration(200).style("right", "305px").style('top','85px'); d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-305px");} else {d3.selectAll(".leaflet-draw").style("top", "85px").style("left", "-5px"); d3.selectAll('.leaflet-control').transition().duration(200).style("top", "85px").style("right", "5px");};

    let klapuit_legenda= [1]; //start closed
    window.toggle_legenda = (n) => {
        if (klapuit_legenda[0] == 1 || klapuit_legenda.length == 0) {
            klapuit_legenda= [0]; //open
        }
    };

    function resize_legend(height){
        d3.select('#legenda_content_container').style('height',height+'px')
        return '';
    }
</script>

<MaterialApp {theme}>
    <ExpansionPanels tile class="rounded-0" bind:value={klapuit_legenda} style="pointer-events: all; position:absolute; right: 5px; top:3px; width: 300px; border-top-left-radius:0px; border-top-right-radius:0px;">
        <ExpansionPanel>
            <span class="white-text text-accent-3" slot="header" style="position:absolute; margin-bottom:20px; font-size: 18px; top:22px; font-family:'Varela Round';"><strong>Legenda</strong></span>
            <span slot="icon" let:active>
                <Icon path={mdiArrowUpDropCircle} size="40px" class="mdi white-text" rotate={active ? 0 : 180}/>
            </span>
            <div id = 'legenda_content_container' style="height:290px; width:100%;">
                <Window {value} class="ma-0">
                    <WindowItem>
                        <div class='legenda_sectie'>
                            <p><strong>Strategie met de laagste kosten</strong></p>
                            <div class='legenda_item'>
                                <div class='legenda_key' style="background-color:#90caf9;"></div>
                                <div class='legenda_text'>Individueel, warmtepomp (B+)</div>
                            </div>
                            <div class='legenda_item'>
                                <div class='legenda_key' style="background-color:#ffecb3;"></div>
                                <div class='legenda_text'>Collectief, warmtenet (B+)</div>
                            </div>
                            <div class='legenda_item'>
                                <div class='legenda_key' style="background-color:#ffab91;"></div>
                                <div class='legenda_text'>Collectief, warmtenet (D+)</div>
                            </div>
                        </div>
                        {#if instelling_mapcontextswitch == 'dichtheid'}
                            <div class='legenda_sectie'>
                                <p><strong>Bebouwingsdichtheid</strong></p>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#bdbdbd;"></div>
                                    <div class='legenda_text'>Laag</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#757575;"></div>
                                    <div class='legenda_text'>Gemiddeld</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#424242;"></div>
                                    <div class='legenda_text'>Hoog</div>
                                </div>
                            </div>
                        {/if}
                        
                        {#if instelling_mapcontextswitch == 'bouwperiode'}
                            <div class='legenda_sectie'>
                                <p><strong>Bouwperiode</strong></p>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#bdbdbd;"></div>
                                    <div class='legenda_text'>Oud</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#757575;"></div>
                                    <div class='legenda_text'>Gemiddeld</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#424242;"></div>
                                    <div class='legenda_text'>Nieuw</div>
                                </div>
                            </div>
                        {/if}
                        {#if instelling_mapcontextswitch == 'd02'}
                            <div class='legenda_sectie'>
                                <p><strong>Bestedingsruimte warmtebron</strong></p>
                                <div class='legenda_item'> 
                                    <div class='legenda_key' style="background-color:#181818;"></div>
                                    <div class='legenda_text'> &lt 0 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#383838;"></div>
                                    <div class='legenda_text'>0 - 2 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#464646;"></div>
                                    <div class='legenda_text'>2 - 4 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#555555;"></div>
                                    <div class='legenda_text'>4 - 6 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#646464;"></div>
                                    <div class='legenda_text'>6 - 8 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#747474;"></div>
                                    <div class='legenda_text'>8 - 10 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#848484;"></div>
                                    <div class='legenda_text'>10 - 12 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#959595;"></div>
                                    <div class='legenda_text'>12 - 14 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#a6a6a6;"></div>
                                    <div class='legenda_text'>14 - 16 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#bcbcbc;"></div>
                                    <div class='legenda_text'>16 - 18 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#d2d2d2;"></div>
                                    <div class='legenda_text'>18 - 20 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#e8e8e8;"></div>
                                    <div class='legenda_text'>20 - 30 €/GJ</div>
                                </div>
                                <div class='legenda_item'>
                                    <div class='legenda_key' style="background-color:#ffffff;"></div>
                                    <div class='legenda_text'>30+ €/GJ</div>
                                </div>
                            </div>
                            {@html resize_legend(500)}
                        {:else}
                            {@html resize_legend(290)}
                        {/if}       
                    </WindowItem >
                </Window>
            </div>
        </ExpansionPanel>
    </ExpansionPanels>
</MaterialApp>

<style>
    .legenda_sectie{
        margin-top:10px;
        margin-bottom:30px;
        width:100%;
    }
    .legenda_item{
        margin-top:5px;
        display:flex;
        width:100%;
        height:18px;
    }
    .legenda_key{
    margin:5px;
    width:20px;
    height:20px;
    border:1px solid #222;
    }
    .legenda_text{
        width:100%;
        font-size:13px;
        position:relative;
        top:6px;
        left:6px;
    }
    p {
        margin: 0;
        font-size: 13px;
    }
</style>

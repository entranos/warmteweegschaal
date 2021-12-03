<!--
Bestand: SliderPanel.Svelte
Omschrijving: Toont en verwerkt input van sliders voor user-input op bronkosten en kosten transportnet.   
Opmerkingen: 
Verbeterpotentieel: SvelteMaterialify gebruiken om responsive te maken in plaats van window.resize_sliderpanel
Dependencies: SvelteMaterialify
Auteur: Tijs Langeveld
-->
<script>

    import { store_instelling_gjtarief} from "./stores.js";
    import { Slider } from "svelte-materialify";
    
    import { MaterialApp, Button, Dialog} from "svelte-materialify";
    import { store_instelling_kostenkentaltransportnet} from './stores.js'

    let slider_s2_gjtarief = [1000];
    $: store_instelling_gjtarief.update((n) => slider_s2_gjtarief);
    $: change_s2_gjtarief(slider_s2_gjtarief);
    function change_s2_gjtarief() {
        var value_ = slider_s2_gjtarief / 100;
        recalculate_all();
    }

    // SLIDER S2: transport
    let slider_s2_transport = [1000];
    $: store_instelling_kostenkentaltransportnet.update(n => slider_s2_transport)
    $: change_s2_transport(slider_s2_transport);
    function change_s2_transport(){
        var value_ = slider_s2_transport/1000;
        recalculate_all();
    }

    window.resize_sliderpanel = () => {
        var titlewidth = 282+25;
        var logowidth = 305;
        var sliderlabel_width = 130;
        var slidervalue_width = 140;
        var individual_slider_width = (window.innerWidth-titlewidth-logowidth)/2;

        d3.select('#sliderpanel_containerdiv').style('width',window.innerWidth-titlewidth-logowidth + 'px')
        d3.select('#sliderpanel_containerdiv').style('left',titlewidth + 'px')
        
        d3.select('#slider_container_warmte').style('left', 5 + 'px')
        d3.select('#slider_container_warmte').style('width', individual_slider_width + 'px')
        d3.select('#warmteslider_kern').style('width', (individual_slider_width - sliderlabel_width - slidervalue_width) - 50 + 'px')

        d3.select('#slider_container_transport').style('left', 5 + individual_slider_width + 5 + 'px')
        d3.select('#slider_container_transport').style('width', individual_slider_width - 15 + 'px')
        d3.select('#transportslider_kern').style('width', (individual_slider_width - sliderlabel_width - slidervalue_width) - 65 + 'px')
    }
    let theme = 'light';
    let infoDialog_SL1; function open_iD_SL1(){ infoDialog_SL1 = true} function close_iD_SL1(){ infoDialog_SL1 = false} 
    let infoDialog_SL2; function open_iD_SL2(){ infoDialog_SL2 = true} function close_iD_SL2(){ infoDialog_SL2 = false} 
</script>

<MaterialApp {theme}>
    <!-- KOSTEN WARMTE -->
    <div id="sliderpanel_containerdiv" style="position:absolute; top:-47px; height: 80px;left:60px; pointer-events: all; background-color:none;">
    <div id = 'slider_container_warmte' style="border-style:solid; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); border-color:black; border-width:0px; top:10px; height: 64px; width:500px; position: absolute; left:5px; margin-right:5px; margin-bottom:10px; background-color: #323232; border-radius:0px;">
        <div style = 'position:absolute; height:100%; width:125px; background-color:#323232; border-radius:00px 0px 0px 0px;'></div>
        <div style = 'position:absolute; height:100%; left:125px; width:90px; background-color:#24242; border-radius:0px 0px 0px 0px;'></div>
        <p style='color: white; position:absolute; top: 21px; left:25px;'><strong>Bronkosten:</strong> &nbsp&nbsp <strong>{Math.round(slider_s2_gjtarief/10)*10/100} €/GJ</strong> </p>
        <div id = 'warmteslider_kern' style="position: absolute; top: 15px; left: 240px; width:0px;">
            <Slider min={0} max={3000} color="white" bind:value={slider_s2_gjtarief}/>
            <div style="position:absolute; top:0px; right:-73px;">
                <div class="text-center">
                    <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL1 = true)}>info</Button>
                </div>
            </div>
        </div>
    </div>
    <div id = 'slider_container_transport' style="border-style:solid; left: 530px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); border-color:black; border-width:0px; top:-75px; height: 64px; width:500px; position: absolute; margin-right:5px; margin-bottom:10px;  background-color:#323232; border-radius:0px;">
        <div style = 'position:absolute; height:100%; width:110px; background-color:#323232 border-radius:0px 0px 0px 0px;'></div>
            <div style = 'position:absolute; height:100%; left:110px; width:100px; background-color:#24242; border-radius:0px 0px 0px 0px;'></div>
            <p style='color: white; position:absolute; top: 21px; left:25px;'><strong>Transportkosten:</strong> &nbsp&nbsp <strong>{slider_s2_transport} €/m</strong> </p>
            <div id = 'transportslider_kern' style="position: absolute; top: 15px; left: 240px; width:0px;">
                <Slider min={500} max={3000} color="white" bind:value={slider_s2_transport}/>
                <div style="position:absolute; top:0px; right:-73px;">
                    <div class="text-center">
                        <Button style='width:40px; height: 30px; font-size:20px; transform:scale(0.6); border:2px solid #fff;' on:click={() => (infoDialog_SL2 = true)}>info</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog class="pa-16 text-center" width='1200px' bind:active={infoDialog_SL1}>
        <p style='color:black; font-size:30px'><strong>Bestedingsruimte warmtebron</strong></p>
        <img style="z-index:90000;" src="img/bestedingsruimte_warmtenet.png" alt="icon" width="1100" height="630"/>
        <Button on:click={close_iD_SL1} text class="black-text" style='margin-top:30px;border:1px solid #333;'>OK</Button>
    </Dialog>
    <Dialog class="pa-16 text-center" width='800px' bind:active={infoDialog_SL2}>
        <p style='color:black'>This is Dialog 2</p>
        <div style="position:static; right:20px; height:20px; background-color:#333;"></div>
        <p style='color:black'>
            Content 
        </p>
        <Button on:click={close_iD_SL2} text class="black-text" style='margin-top:30px;border:1px solid #333;'>OK</Button>
    </Dialog>
</MaterialApp>
<!--
Bestand: gemeenteSelector.Svelte
Functie: Toont gemeenteselectiemenu bij binnenkomst en afhandeling gemeenteselectie.
Opmerkingen: -
Dependencies: d3.js, SvelteMaterialify
Auteur: Tijs Langeveld
-->
<script>
    import { MaterialApp } from "svelte-materialify";
    import Select from "svelte-select";
    import { onMount } from "svelte";
    import { store_selectie_gemeentenaam } from "./stores.js";

    let theme = "light";

    onMount(() => {
        d3.select('#OutputPanel').style('visibility','hidden')
        d3.select('#InputPanel').style('visibility','hidden')
        d3.select('#LegendaPanel').style('visibility','hidden')
        d3.selectAll('.leaflet-control').style("right", "5px");
        d3.selectAll('.leaflet-control-container').style('visibility','hidden');
    });

    let value = "";

    const items = [
        { label: "Aa en Hunze", value: "Aa en Hunze" },
        { label: "Aalsmeer", value: "Aalsmeer" },
        { label: "Aalten", value: "Aalten" },
        { label: "Achtkarspelen", value: "Achtkarspelen" },
        { label: "Alblasserdam", value: "Alblasserdam" },
        { label: "Albrandswaard", value: "Albrandswaard" },
        { label: "Alkmaar", value: "Alkmaar" },
        { label: "Almelo", value: "Almelo" },
        { label: "Almere", value: "Almere" },
        { label: "Alphen aan den Rijn", value: "Alphen aan den Rijn" },
        { label: "Alphen-Chaam", value: "Alphen-Chaam" },
        { label: "Altena", value: "Altena" },
        { label: "Ameland", value: "Ameland" },
        { label: "Amersfoort", value: "Amersfoort" },
        { label: "Amstelveen", value: "Amstelveen" },
        { label: "Amsterdam", value: "Amsterdam" },
        { label: "Apeldoorn", value: "Apeldoorn" },
        { label: "Appingedam", value: "Appingedam" },
        { label: "Arnhem", value: "Arnhem" },
        { label: "Assen", value: "Assen" },
        { label: "Asten", value: "Asten" },
        { label: "Baarle-Nassau", value: "Baarle-Nassau" },
        { label: "Baarn", value: "Baarn" },
        { label: "Barendrecht", value: "Barendrecht" },
        { label: "Barneveld", value: "Barneveld" },
        { label: "Beek", value: "Beek" },
        { label: "Beekdaelen", value: "Beekdaelen" },
        { label: "Beemster", value: "Beemster" },
        { label: "Beesel", value: "Beesel" },
        { label: "Berg en Dal", value: "Berg en Dal" },
        { label: "Bergeijk", value: "Bergeijk" },
        { label: "Bergen (L.)", value: "Bergen (L.)" },
        { label: "Bergen (NH.)", value: "Bergen (NH.)" },
        { label: "Bergen op Zoom", value: "Bergen op Zoom" },
        { label: "Berkelland", value: "Berkelland" },
        { label: "Bernheze", value: "Bernheze" },
        { label: "Best", value: "Best" },
        { label: "Beuningen", value: "Beuningen" },
        { label: "Beverwijk", value: "Beverwijk" },
        { label: "Bladel", value: "Bladel" },
        { label: "Blaricum", value: "Blaricum" },
        { label: "Bloemendaal", value: "Bloemendaal" },
        { label: "Bodegraven-Reeuwijk", value: "Bodegraven-Reeuwijk" },
        { label: "Boekel", value: "Boekel" },
        { label: "Borger-Odoorn", value: "Borger-Odoorn" },
        { label: "Borne", value: "Borne" },
        { label: "Borsele", value: "Borsele" },
        { label: "Boxmeer", value: "Boxmeer" },
        { label: "Boxtel", value: "Boxtel" },
        { label: "Breda", value: "Breda" },
        { label: "Brielle", value: "Brielle" },
        { label: "Bronckhorst", value: "Bronckhorst" },
        { label: "Brummen", value: "Brummen" },
        { label: "Brunssum", value: "Brunssum" },
        { label: "Bunnik", value: "Bunnik" },
        { label: "Bunschoten", value: "Bunschoten" },
        { label: "Buren", value: "Buren" },
        { label: "Capelle aan den IJssel", value: "Capelle aan den IJssel" },
        { label: "Castricum", value: "Castricum" },
        { label: "Coevorden", value: "Coevorden" },
        { label: "Cranendonck", value: "Cranendonck" },
        { label: "Cuijk", value: "Cuijk" },
        { label: "Culemborg", value: "Culemborg" },
        { label: "Dalfsen", value: "Dalfsen" },
        { label: "Dantumadiel", value: "Dantumadiel" },
        { label: "De Bilt", value: "De Bilt" },
        { label: "De Fryske Marren", value: "De Fryske Marren" },
        { label: "De Ronde Venen", value: "De Ronde Venen" },
        { label: "De Wolden", value: "De Wolden" },
        { label: "Delft", value: "Delft" },
        { label: "Delfzijl", value: "Delfzijl" },
        { label: "Den Helder", value: "Den Helder" },
        { label: "Deurne", value: "Deurne" },
        { label: "Deventer", value: "Deventer" },
        { label: "Diemen", value: "Diemen" },
        { label: "Dinkelland", value: "Dinkelland" },
        { label: "Doesburg", value: "Doesburg" },
        { label: "Doetinchem", value: "Doetinchem" },
        { label: "Dongen", value: "Dongen" },
        { label: "Dordrecht", value: "Dordrecht" },
        { label: "Drechterland", value: "Drechterland" },
        { label: "Drimmelen", value: "Drimmelen" },
        { label: "Dronten", value: "Dronten" },
        { label: "Druten", value: "Druten" },
        { label: "Duiven", value: "Duiven" },
        { label: "Echt-Susteren", value: "Echt-Susteren" },
        { label: "Edam-Volendam", value: "Edam-Volendam" },
        { label: "Ede", value: "Ede" },
        { label: "Eemnes", value: "Eemnes" },
        { label: "Eersel", value: "Eersel" },
        { label: "Eijsden-Margraten", value: "Eijsden-Margraten" },
        { label: "Eindhoven", value: "Eindhoven" },
        { label: "Elburg", value: "Elburg" },
        { label: "Emmen", value: "Emmen" },
        { label: "Enkhuizen", value: "Enkhuizen" },
        { label: "Enschede", value: "Enschede" },
        { label: "Epe", value: "Epe" },
        { label: "Ermelo", value: "Ermelo" },
        { label: "Etten-Leur", value: "Etten-Leur" },
        { label: "Geertruidenberg", value: "Geertruidenberg" },
        { label: "Geldrop-Mierlo", value: "Geldrop-Mierlo" },
        { label: "Gemert-Bakel", value: "Gemert-Bakel" },
        { label: "Gennep", value: "Gennep" },
        { label: "Gilze en Rijen", value: "Gilze en Rijen" },
        { label: "Goeree-Overflakkee", value: "Goeree-Overflakkee" },
        { label: "Goes", value: "Goes" },
        { label: "Goirle", value: "Goirle" },
        { label: "Gooise Meren", value: "Gooise Meren" },
        { label: "Gorinchem", value: "Gorinchem" },
        { label: "Gouda", value: "Gouda" },
        { label: "Grave", value: "Grave" },
        { label: "Groningen", value: "Groningen" },
        { label: "Gulpen-Wittem", value: "Gulpen-Wittem" },
        { label: "Haaksbergen", value: "Haaksbergen" },
        { label: "Haaren", value: "Haaren" },
        { label: "Haarlem", value: "Haarlem" },
        { label: "Haarlemmermeer", value: "Haarlemmermeer" },
        { label: "Halderberge", value: "Halderberge" },
        { label: "Hardenberg", value: "Hardenberg" },
        { label: "Harderwijk", value: "Harderwijk" },
        { label: "Hardinxveld-Giessendam", value: "Hardinxveld-Giessendam" },
        { label: "Harlingen", value: "Harlingen" },
        { label: "Hattem", value: "Hattem" },
        { label: "Heemskerk", value: "Heemskerk" },
        { label: "Heemstede", value: "Heemstede" },
        { label: "Heerde", value: "Heerde" },
        { label: "Heerenveen", value: "Heerenveen" },
        { label: "Heerhugowaard", value: "Heerhugowaard" },
        { label: "Heerlen", value: "Heerlen" },
        { label: "Heeze-Leende", value: "Heeze-Leende" },
        { label: "Heiloo", value: "Heiloo" },
        { label: "Hellendoorn", value: "Hellendoorn" },
        { label: "Hellevoetsluis", value: "Hellevoetsluis" },
        { label: "Helmond", value: "Helmond" },
        { label: "Hendrik-Ido-Ambacht", value: "Hendrik-Ido-Ambacht" },
        { label: "Hengelo", value: "Hengelo" },
        { label: "Het Hogeland", value: "Het Hogeland" },
        { label: "Heumen", value: "Heumen" },
        { label: "Heusden", value: "Heusden" },
        { label: "Hillegom", value: "Hillegom" },
        { label: "Hilvarenbeek", value: "Hilvarenbeek" },
        { label: "Hilversum", value: "Hilversum" },
        { label: "Hoeksche Waard", value: "Hoeksche Waard" },
        { label: "Hof van Twente", value: "Hof van Twente" },
        { label: "Hollands Kroon", value: "Hollands Kroon" },
        { label: "Hoogeveen", value: "Hoogeveen" },
        { label: "Hoorn", value: "Hoorn" },
        { label: "Horst aan de Maas", value: "Horst aan de Maas" },
        { label: "Houten", value: "Houten" },
        { label: "Huizen", value: "Huizen" },
        { label: "Hulst", value: "Hulst" },
        { label: "IJsselstein", value: "IJsselstein" },
        { label: "Kaag en Braassem", value: "Kaag en Braassem" },
        { label: "Kampen", value: "Kampen" },
        { label: "Kapelle", value: "Kapelle" },
        { label: "Katwijk", value: "Katwijk" },
        { label: "Kerkrade", value: "Kerkrade" },
        { label: "Koggenland", value: "Koggenland" },
        { label: "Krimpen aan den IJssel", value: "Krimpen aan den IJssel" },
        { label: "Krimpenerwaard", value: "Krimpenerwaard" },
        { label: "Laarbeek", value: "Laarbeek" },
        { label: "Landerd", value: "Landerd" },
        { label: "Landgraaf", value: "Landgraaf" },
        { label: "Landsmeer", value: "Landsmeer" },
        { label: "Langedijk", value: "Langedijk" },
        { label: "Lansingerland", value: "Lansingerland" },
        { label: "Laren", value: "Laren" },
        { label: "Leeuwarden", value: "Leeuwarden" },
        { label: "Leiden", value: "Leiden" },
        { label: "Leiderdorp", value: "Leiderdorp" },
        { label: "Leidschendam-Voorburg", value: "Leidschendam-Voorburg" },
        { label: "Lelystad", value: "Lelystad" },
        { label: "Leudal", value: "Leudal" },
        { label: "Leusden", value: "Leusden" },
        { label: "Lingewaard", value: "Lingewaard" },
        { label: "Lisse", value: "Lisse" },
        { label: "Lochem", value: "Lochem" },
        { label: "Loon op Zand", value: "Loon op Zand" },
        { label: "Lopik", value: "Lopik" },
        { label: "Loppersum", value: "Loppersum" },
        { label: "Losser", value: "Losser" },
        { label: "Maasdriel", value: "Maasdriel" },
        { label: "Maasgouw", value: "Maasgouw" },
        { label: "Maassluis", value: "Maassluis" },
        { label: "Maastricht", value: "Maastricht" },
        { label: "Medemblik", value: "Medemblik" },
        { label: "Meerssen", value: "Meerssen" },
        { label: "Meierijstad", value: "Meierijstad" },
        { label: "Meppel", value: "Meppel" },
        { label: "Middelburg", value: "Middelburg" },
        { label: "Midden-Delfland", value: "Midden-Delfland" },
        { label: "Midden-Drenthe", value: "Midden-Drenthe" },
        { label: "Midden-Groningen", value: "Midden-Groningen" },
        { label: "Mill en Sint Hubert", value: "Mill en Sint Hubert" },
        { label: "Moerdijk", value: "Moerdijk" },
        { label: "Molenlanden", value: "Molenlanden" },
        { label: "Montferland", value: "Montferland" },
        { label: "Montfoort", value: "Montfoort" },
        { label: "Mook en Middelaar", value: "Mook en Middelaar" },
        { label: "Neder-Betuwe", value: "Neder-Betuwe" },
        { label: "Nederweert", value: "Nederweert" },
        { label: "Nieuwegein", value: "Nieuwegein" },
        { label: "Nieuwkoop", value: "Nieuwkoop" },
        { label: "Nijkerk", value: "Nijkerk" },
        { label: "Nijmegen", value: "Nijmegen" },
        { label: "Nissewaard", value: "Nissewaard" },
        { label: "Noardeast-Fryslân", value: "Noardeast-Fryslân" },
        { label: "Noord-Beveland", value: "Noord-Beveland" },
        { label: "Noordenveld", value: "Noordenveld" },
        { label: "Noordoostpolder", value: "Noordoostpolder" },
        { label: "Noordwijk", value: "Noordwijk" },
        { label: "Nuenen Gerwen en Nederwetten", value: "Nuenen Gerwen en Nederwetten",},
        { label: "Nunspeet", value: "Nunspeet" },
        { label: "Oegstgeest", value: "Oegstgeest" },
        { label: "Oirschot", value: "Oirschot" },
        { label: "Oisterwijk", value: "Oisterwijk" },
        { label: "Oldambt", value: "Oldambt" },
        { label: "Oldebroek", value: "Oldebroek" },
        { label: "Oldenzaal", value: "Oldenzaal" },
        { label: "Olst-Wijhe", value: "Olst-Wijhe" },
        { label: "Ommen", value: "Ommen" },
        { label: "Oost Gelre", value: "Oost Gelre" },
        { label: "Oosterhout", value: "Oosterhout" },
        { label: "Ooststellingwerf", value: "Ooststellingwerf" },
        { label: "Oostzaan", value: "Oostzaan" },
        { label: "Opmeer", value: "Opmeer" },
        { label: "Opsterland", value: "Opsterland" },
        { label: "Oss", value: "Oss" },
        { label: "Oude IJsselstreek", value: "Oude IJsselstreek" },
        { label: "Ouder-Amstel", value: "Ouder-Amstel" },
        { label: "Oudewater", value: "Oudewater" },
        { label: "Overbetuwe", value: "Overbetuwe" },
        { label: "Papendrecht", value: "Papendrecht" },
        { label: "Peel en Maas", value: "Peel en Maas" },
        { label: "Pekela", value: "Pekela" },
        { label: "Pijnacker-Nootdorp", value: "Pijnacker-Nootdorp" },
        { label: "Purmerend", value: "Purmerend" },
        { label: "Putten", value: "Putten" },
        { label: "Raalte", value: "Raalte" },
        { label: "Reimerswaal", value: "Reimerswaal" },
        { label: "Renkum", value: "Renkum" },
        { label: "Renswoude", value: "Renswoude" },
        { label: "Reusel-De Mierden", value: "Reusel-De Mierden" },
        { label: "Rheden", value: "Rheden" },
        { label: "Rhenen", value: "Rhenen" },
        { label: "Ridderkerk", value: "Ridderkerk" },
        { label: "Rijssen-Holten", value: "Rijssen-Holten" },
        { label: "Rijswijk", value: "Rijswijk" },
        { label: "Roerdalen", value: "Roerdalen" },
        { label: "Roermond", value: "Roermond" },
        { label: "Roosendaal", value: "Roosendaal" },
        { label: "Rotterdam", value: "Rotterdam" },
        { label: "Rozendaal", value: "Rozendaal" },
        { label: "Rucphen", value: "Rucphen" },
        { label: "s-Gravenhage", value: "s-Gravenhage" },
        { label: "s-Hertogenbosch", value: "s-Hertogenbosch" },
        { label: "Schagen", value: "Schagen" },
        { label: "Scherpenzeel", value: "Scherpenzeel" },
        { label: "Schiedam", value: "Schiedam" },
        { label: "Schiermonnikoog", value: "Schiermonnikoog" },
        { label: "Schouwen-Duiveland", value: "Schouwen-Duiveland" },
        { label: "Simpelveld", value: "Simpelveld" },
        { label: "Sint Anthonis", value: "Sint Anthonis" },
        { label: "Sint-Michielsgestel", value: "Sint-Michielsgestel" },
        { label: "Sittard-Geleen", value: "Sittard-Geleen" },
        { label: "Sliedrecht", value: "Sliedrecht" },
        { label: "Sluis", value: "Sluis" },
        { label: "Smallingerland", value: "Smallingerland" },
        { label: "Soest", value: "Soest" },
        { label: "Someren", value: "Someren" },
        { label: "Son en Breugel", value: "Son en Breugel" },
        { label: "Stadskanaal", value: "Stadskanaal" },
        { label: "Staphorst", value: "Staphorst" },
        { label: "Stede Broec", value: "Stede Broec" },
        { label: "Steenbergen", value: "Steenbergen" },
        { label: "Steenwijkerland", value: "Steenwijkerland" },
        { label: "Stein", value: "Stein" },
        { label: "Stichtse Vecht", value: "Stichtse Vecht" },
        { label: "Súdwest-Fryslân", value: "Súdwest-Fryslân" },
        { label: "Terneuzen", value: "Terneuzen" },
        { label: "Terschelling", value: "Terschelling" },
        { label: "Texel", value: "Texel" },
        { label: "Teylingen", value: "Teylingen" },
        { label: "Tholen", value: "Tholen" },
        { label: "Tiel", value: "Tiel" },
        { label: "Tilburg", value: "Tilburg" },
        { label: "Tubbergen", value: "Tubbergen" },
        { label: "Twenterand", value: "Twenterand" },
        { label: "Tynaarlo", value: "Tynaarlo" },
        { label: "Tytsjerksteradiel", value: "Tytsjerksteradiel" },
        { label: "Uden", value: "Uden" },
        { label: "Uitgeest", value: "Uitgeest" },
        { label: "Uithoorn", value: "Uithoorn" },
        { label: "Urk", value: "Urk" },
        { label: "Utrecht", value: "Utrecht" },
        { label: "Utrechtse Heuvelrug", value: "Utrechtse Heuvelrug" },
        { label: "Vaals", value: "Vaals" },
        { label: "Valkenburg aan de Geul", value: "Valkenburg aan de Geul" },
        { label: "Valkenswaard", value: "Valkenswaard" },
        { label: "Veendam", value: "Veendam" },
        { label: "Veenendaal", value: "Veenendaal" },
        { label: "Veere", value: "Veere" },
        { label: "Veldhoven", value: "Veldhoven" },
        { label: "Velsen", value: "Velsen" },
        { label: "Venlo", value: "Venlo" },
        { label: "Venray", value: "Venray" },
        { label: "Vijfheerenlanden", value: "Vijfheerenlanden" },
        { label: "Vlaardingen", value: "Vlaardingen" },
        { label: "Vlieland", value: "Vlieland" },
        { label: "Vlissingen", value: "Vlissingen" },
        { label: "Voerendaal", value: "Voerendaal" },
        { label: "Voorschoten", value: "Voorschoten" },
        { label: "Voorst", value: "Voorst" },
        { label: "Vught", value: "Vught" },
        { label: "Waadhoeke", value: "Waadhoeke" },
        { label: "Waalre", value: "Waalre" },
        { label: "Waalwijk", value: "Waalwijk" },
        { label: "Waddinxveen", value: "Waddinxveen" },
        { label: "Wageningen", value: "Wageningen" },
        { label: "Wassenaar", value: "Wassenaar" },
        { label: "Waterland", value: "Waterland" },
        { label: "Weert", value: "Weert" },
        { label: "Weesp", value: "Weesp" },
        { label: "West Betuwe", value: "West Betuwe" },
        { label: "West Maas en Waal", value: "West Maas en Waal" },
        { label: "Westerkwartier", value: "Westerkwartier" },
        { label: "Westerveld", value: "Westerveld" },
        { label: "Westervoort", value: "Westervoort" },
        { label: "Westerwolde", value: "Westerwolde" },
        { label: "Westland", value: "Westland" },
        { label: "Weststellingwerf", value: "Weststellingwerf" },
        { label: "Westvoorne", value: "Westvoorne" },
        { label: "Wierden", value: "Wierden" },
        { label: "Wijchen", value: "Wijchen" },
        { label: "Wijdemeren", value: "Wijdemeren" },
        { label: "Wijk bij Duurstede", value: "Wijk bij Duurstede" },
        { label: "Winterswijk", value: "Winterswijk" },
        { label: "Woensdrecht", value: "Woensdrecht" },
        { label: "Woerden", value: "Woerden" },
        { label: "Wormerland", value: "Wormerland" },
        { label: "Woudenberg", value: "Woudenberg" },
        { label: "Zaanstad", value: "Zaanstad" },
        { label: "Zaltbommel", value: "Zaltbommel" },
        { label: "Zandvoort", value: "Zandvoort" },
        { label: "Zeewolde", value: "Zeewolde" },
        { label: "Zeist", value: "Zeist" },
        { label: "Zevenaar", value: "Zevenaar" },
        { label: "Zoetermeer", value: "Zoetermeer" },
        { label: "Zoeterwoude", value: "Zoeterwoude" },
        { label: "Zuidplas", value: "Zuidplas" },
        { label: "Zundert", value: "Zundert" },
        { label: "Zutphen", value: "Zutphen" },
        { label: "Zwartewaterland", value: "Zwartewaterland" },
        { label: "Zwijndrecht", value: "Zwijndrecht" },
        { label: "Zwolle", value: "Zwolle" },
    ];

    function handleSelect(event) {
        value = event.detail.value; // gemeentenaam  
        store_selectie_gemeentenaam.update((n) => value);
        
        if (value != "" && value != "Selecteer...") {
            d3.csv("csv/gemeenten_2020.csv").then(function (datagemeenten, error) {
                var selectie_gm_code;
                var i;
                for (i = 0; i < datagemeenten.length; i++) {
                    if (datagemeenten[i].gm_naam == value) {
                        selectie_gm_code = datagemeenten[i].gm_code;
                    }
                }
                
                start_analysis(selectie_gm_code);
                
                draw_contextlaag(); //achtergrondkaart met indicatie bebouwingsdichtheid op straatniveau
                
                d3.select("#welkomstScherm").remove();
                d3.select('#OutputPanel').style('visibility','visible')
                d3.select('#InputPanel').style('visibility','visible')
                d3.select('#LegendaPanel').style('visibility','visible')

                d3.selectAll('.leaflet-control-container').style('visibility','visible');
                d3.select("#InputPanel").transition().duration(1500).style('top','0px');

                d3.select('#mapcontext_radiobuttons').transition().duration(1500).style('left','3px')
                d3.select('#button_handleiding').transition().duration(1500).style('left','3px')
                d3.selectAll('.leaflet-control').transition().duration(1200).style("top", "85px");

                toggle_legenda(1);
                
                d3.select("#SliderPanel").transition().duration(1500).style('top','-80px');

            });
        }
    }
</script>

<div
  id="welkomstScherm"
  class="elevation-6"
  style="pointer-events:all;margin:auto; min-width: 700px; min-height: 300px; width:70%; max-height: 700px; max-width:300px; height:30%; margin-top:100px; align:middle; background-color:white;"
>
  <MaterialApp {theme}>
    <h1>Startanalyse Warmtenetverkenner</h1>
      <p class="float-left ml-16 mr-16 black-text" style="font-size: 20px; margin-bottom:40px">
        <strong>Met deze tool verken je onder welke condities een warmtenet lagere nationale kosten geeft in vergelijking tot all-electric.</strong>
      </p>
    <p class="ml-16 mr-16 black-text" style="font-size: 19px; margin-bottom:0px;"></p>

    <div class="themed">
      <Select
        class="float-left ma-16"
        {items}
        placeholder="Kies een gemeente"
        on:select={handleSelect}
      />
    </div>
    
    
  </MaterialApp>
</div>

<style>
  .themed {
    font-weight: 800;
    padding: 50px;
    --background: #1c313a;
    --listBackground: #1c313a;
    --border: 1px solid #1c313a;
    --placeholderColor: #fff;
    --itemColor: #fff;
    --inputColor: #fff;
    --itemHoverBG: #455a64;
  }
  h1 {
    font-size: 30px;
    font-weight: 800;
    margin-left: 64px;
  }
</style>

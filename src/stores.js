import { writable } from 'svelte/store';

//brondat
export const store_input_primarydataset_raw = writable(0);
export const store_input_primarydataset_processed = writable(0);

//visualisatiedatasets
export const store_visualisatiedataset_bubblechart = writable(0);
export const store_visualisatiedataset_racechart = writable(0);

//instellingen
export const store_instelling_kostenkentaltransportnet = writable(0);
export const store_instelling_gjtarief = writable(0);
export const store_instelling_lengtetransportleiding = writable(0);
export const store_instelling_mapcontextswitch = writable(0);
export const store_instelling_kleurselectieswitch = writable(0);

//selectieinfo
export const store_selectie_gemeentenaam = writable(0);
export const store_selectie_buurtcodes = writable(0);
export const store_selectie_buurtnamen = writable(0);
export const store_selectie_weq = writable(0);
export const store_selectie_co2reductie = writable(0)
export const store_selectie_woningen_bouwperiode = writable(0)
export const store_selectie_woningen_woningtype = writable(0);

//tussenresultaten
export const store_tussenresultaat_kapitaalslasten_transportnet = writable(0);
export const store_tussenresultaat_primarydataset_processed = writable(0);

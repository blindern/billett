# UKA på Blindern sitt billettsystem

**Dette er et uferdig prosjekt!**

UKA på Blinderns egenlagde billettsystem er i dag en integrert del av systemet
som kjører nettsidene til UKA. Dette systemet kan variere fra gang
til gang, og dette prosjektet har som mål å flytte billettsystemet
ut av det øvrige systemet for å gjøre det uavhengig, mer robust,
samt enklere å vedlikeholde og utvikle videre.


## Kort om systemet
* Betalingsløsning integrert mot DIBS
* Kjøp av ett-og-ett arrangement (ingen "handlekurv")
* Billetter printes ut selv, PDF tilsendes på e-post - kan også bruke mobil
* Strekkodescanner ved inngang for validering og registrering av billett
* Salg av løse billetter, f.eks. i billettskranke eller på stand


## Koden/systemet

I tillegg til å gjøre det enklere for oss selv vil vi prøve å publisere vårt
verktøy, slik at det kanskje kommer andre til nytte i sine prosjekter. Det er
ikke noe vi vektlegger, så dokumentasjon o.l. ment for andre enn oss selv
vil ikke være prioritert.


## Historie

Det ble tatt initiativ til å lage et eget billettsystem til UKA på Blindern 2011,
da vi ønsket en rimeligere og kulere løsning enn det som var alternativene. I slutten
av november/starten av desember 2010 begynte arbeidet med billettsystemet, og det ble
satt i drift tidlig januar 2011. Utviklet av webmaster for UKA på Blindern 2011 Henrik Steen.

Billettsystemet ble pusset litt på og gjenbrukt for UKA på Blindern 2013.

Per nå mangler billettsystemet en del gode verktøy, slik at mye må gjøres direkte i databasen.
Dette vil forhåpentligvis være mye bedre når vi går inn i UKA på Blindern 2015!


## Utvikling av det nye systemet
* Utvikles oppå rammeverket Laravel
* Utgangspunkt tas i det gamle systemet (som ikke er offentlig tilgjengelig)
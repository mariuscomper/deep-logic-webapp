/*
 * Journey and hub data for the Viking Journeys map.
 * Coordinates are approximate (historical sites, not modern addresses),
 * and a handful of dates are the traditional/legendary ones handed down
 * in sagas and chronicles rather than archaeologically fixed points —
 * those are flagged in their summary text.
 */
(function (global) {
    'use strict';

    // Permanent trading towns, shown as small hub markers regardless of the timeline.
    const HUBS = [
        { id: 'hedeby', title: 'Hedeby', coords: [54.50, 9.57], summary: 'The largest town in Viking Age Scandinavia, straddling the land route between the North Sea and the Baltic.' },
        { id: 'ribe', title: 'Ribe', coords: [55.33, 8.77], summary: "Denmark's oldest town, trading amber, glass and furs from around 700 onward." },
        { id: 'kaupang', title: 'Kaupang', coords: [59.05, 9.90], summary: 'A seasonal trading settlement on the Skagerrak coast of Norway, active in the 9th and 10th centuries.' },
        { id: 'birka', title: 'Birka', coords: [59.33, 17.54], summary: "Sweden's principal Viking Age trading centre, gateway to the routes east across the Baltic." }
    ];

    // category: 'raid' | 'trade' | 'exploration' | 'settlement'
    const JOURNEYS = [
        {
            id: 'lindisfarne', category: 'raid', title: 'Raid on Lindisfarne', years: [793, 793],
            path: [[55.67, -1.80]],
            summary: 'A sudden strike on this undefended Northumbrian monastery shocked Christian Europe and is conventionally taken as the opening event of the Viking Age.'
        },
        {
            id: 'great-heathen-army', category: 'raid', title: 'The Great Heathen Army in England', years: [865, 878],
            path: [[55.67, -1.80], [53.96, -1.08], [52.63, -1.13], [51.51, -0.13]],
            summary: 'A coalition of Danish warbands landed in East Anglia in 865, conquered Northumbria, East Anglia and Mercia, and captured York in 866, laying the ground for the Danelaw.'
        },
        {
            id: 'jorvik', category: 'settlement', title: 'Jorvik (York)', years: [866, 954],
            path: [[53.96, -1.08]],
            summary: 'Captured in 866, York became the capital of a Viking kingdom that lasted, with interruptions, until 954 — a thriving hub linking Scandinavia, Ireland and the Islamic world.'
        },
        {
            id: 'dublin', category: 'settlement', title: 'Founding of Dublin', years: [841, 1052],
            path: [[53.35, -6.26]],
            summary: 'Norse raiders established a fortified ship-camp (longphort) at the mouth of the Liffey in 841; it grew into a major Viking trading city and the busiest slave market in Western Europe.'
        },
        {
            id: 'siege-of-paris', category: 'raid', title: 'Sieges of Paris', years: [845, 886],
            path: [[49.44, 1.10], [48.86, 2.35]],
            summary: 'A Viking leader extorted a huge ransom from Paris in 845; a far larger fleet under Sigfred and Rollo besieged the city again in 885-886, holding out for over a year.'
        },
        {
            id: 'nantes', category: 'raid', title: 'Sack of Nantes', years: [843, 843],
            path: [[47.22, -1.55]],
            summary: 'One of the earliest major raids on the Frankish coast, striking on the feast of Saint John and killing the bishop before the altar.'
        },
        {
            id: 'normandy', category: 'settlement', title: 'Founding of Normandy', years: [911, 911],
            path: [[49.44, 1.10]],
            summary: 'By the Treaty of Saint-Clair-sur-Epte, King Charles the Simple granted land around Rouen to the Viking leader Rollo, founding the Duchy of Normandy.'
        },
        {
            id: 'mediterranean-expedition', category: 'raid', title: "Bjorn Ironside and Hastein's Mediterranean Raid", years: [859, 862],
            path: [[47.22, -1.55], [44.84, -0.58], [36.14, -5.35], [37.39, -5.99], [36.14, -5.35], [43.50, 4.50], [44.07, 9.97], [43.72, 10.40]],
            summary: 'A fleet of dozens of ships sailed from the Loire through Gibraltar, raided Seville, wintered in the Camargue, and struck towns in Italy — reputedly aiming for Rome but hitting Luna and Pisa instead.'
        },
        {
            id: 'seville-844', category: 'raid', title: 'First Raid on Seville', years: [844, 844],
            path: [[36.14, -5.35], [37.39, -5.99]],
            summary: 'A Viking fleet sailed up the Guadalquivir and sacked Seville, then held by the Emirate of Cordoba, before being driven off by an Umayyad counter-attack.'
        },
        {
            id: 'faroe-settlement', category: 'exploration', title: 'Settlement of the Faroe Islands', years: [825, 850],
            path: [[60.39, 5.32], [62.00, -6.80]],
            summary: 'Norse settlers, some arriving via the Norse-Gaelic world, established permanent farms on these remote North Atlantic islands in the early-to-mid ninth century.'
        },
        {
            id: 'iceland-settlement', category: 'exploration', title: 'Settlement of Iceland', years: [874, 874],
            path: [[62.00, -6.80], [64.13, -21.90]],
            summary: 'Tradition credits Ingolfr Arnarson with the first permanent settlement, at Reykjavik, in 874 — the traditional start of a wave of migration that populated the island within sixty years.'
        },
        {
            id: 'greenland-settlement', category: 'exploration', title: "Erik the Red's Greenland Colony", years: [985, 985],
            path: [[64.13, -21.90], [60.90, -45.60]],
            summary: "Exiled from Iceland, Erik the Red led a fleet of 25 ships to found two settlements on Greenland's southwest coast, which endured for roughly 450 years."
        },
        {
            id: 'vinland', category: 'exploration', title: 'Vinland: Leif Erikson Reaches North America', years: [1000, 1000],
            path: [[60.90, -45.60], [51.60, -55.50]],
            summary: "Around the year 1000, Leif Erikson led an expedition west from Greenland to a land he called Vinland; the archaeological site at L'Anse aux Meadows in Newfoundland is the only confirmed Norse settlement in North America."
        },
        {
            id: 'rurik-novgorod', category: 'settlement', title: 'Rurik and the Founding of Rus', years: [862, 862],
            path: [[60.00, 32.29], [58.52, 31.28]],
            summary: "According to the Russian Primary Chronicle, the Varangian chieftain Rurik was invited to rule at Staraya Ladoga in 862 before establishing his seat at Novgorod — the traditional founding moment of the Rus, a date the chronicle itself fixes retrospectively."
        },
        {
            id: 'oleg-kiev', category: 'settlement', title: 'Oleg Captures Kiev', years: [882, 882],
            path: [[58.52, 31.28], [54.78, 32.05], [50.45, 30.52]],
            summary: "Rurik's successor Oleg moved south along the Dnieper, seized Kiev from its Khazar-tributary rulers, and made it the capital of Kievan Rus."
        },
        {
            id: 'varangians-to-greeks', category: 'trade', title: 'The Route from the Varangians to the Greeks', years: [800, 1200],
            path: [[59.33, 17.54], [60.00, 32.29], [58.52, 31.28], [54.78, 32.05], [50.45, 30.52], [46.50, 31.80], [41.01, 28.98]],
            summary: 'A river-and-portage network linking the Baltic to the Black Sea via the Volkhov, Lovat and Dnieper rivers, carrying furs, amber, honey and slaves south in exchange for Byzantine silk, wine and silver.'
        },
        {
            id: 'rus-attacks-constantinople', category: 'raid', title: 'Rus Assaults on Constantinople', years: [860, 941],
            path: [[50.45, 30.52], [46.50, 31.80], [41.01, 28.98]],
            summary: 'Rus fleets attacked the Byzantine capital in 860, 907 and 941; the raids ended in treaties that opened lucrative trading rights for Rus merchants in the city.'
        },
        {
            id: 'varangian-guard', category: 'trade', title: 'The Varangian Guard', years: [988, 1204],
            path: [[41.01, 28.98]],
            summary: 'From 988, Scandinavian and Rus warriors served as the elite personal bodyguard of the Byzantine emperors — a prestigious posting that drew adventurers such as the future Norwegian king Harald Hardrada.'
        },
        {
            id: 'volga-route', category: 'trade', title: 'The Volga Trade Route to the Caliphate', years: [800, 1000],
            path: [[59.33, 17.54], [58.52, 31.28], [54.98, 49.16], [46.00, 48.00], [33.30, 44.40]],
            summary: 'Rus and Volga Bulgar merchants carried furs and slaves down the Volga to the Khazar capital Itil and on toward the Abbasid Caliphate, returning with such quantities of silver dirhams that tens of thousands still turn up in Scandinavian hoards.'
        },
        {
            id: 'ibn-fadlan', category: 'trade', title: 'Ibn Fadlan Meets the Rus', years: [922, 922],
            path: [[54.98, 49.16]],
            summary: 'The Abbasid envoy Ibn Fadlan encountered Rus merchants on the Volga at Bulgar and left the most detailed eyewitness account of Viking Age Scandinavians, including a description of a ship funeral.'
        }
    ];

    global.VIKING_DATA = { HUBS, JOURNEYS };
}(window));

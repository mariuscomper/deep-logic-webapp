/*
 * Facts and English copy for "Twenty things to take back in time"
 * (time-cargo.html). Romanian copy: time-cargo-data.ro.js, keyed by the same ids.
 *
 * Every object has four judgement scores (0-10) that combine into its Delta:
 *   need   - how big and how old is the problem it attacks?
 *   copy   - once you are gone, can the era keep making or doing it itself?
 *   trust  - will people try it without punishing you for it?
 *   ripple - how much does it unlock beyond the first use?
 *
 * Delta (0-100) = 10 x (0.30 need + 0.25 copy + 0.20 trust + 0.25 ripple),
 * scored at the object's best landing window. Landing elsewhere multiplies the
 * score by FALLOFF[distance in windows], unless the object carries a
 * hand-written override in `alt`.
 *
 * The scores were fixed before any rater saw the objects (see RATERS). They are
 * judgements with reasons, not measurements. Where a figure is traditional or
 * disputed the text says so. Tokens such as {copy} in a verdict are replaced
 * with that object's own score when the page renders.
 */
(function (global) {
    'use strict';

    const WEIGHTS = { need: 0.30, copy: 0.25, trust: 0.20, ripple: 0.25 };
    const FALLOFF = [1, 0.55, 0.32, 0.18, 0.12];

    const DIMS = [
        { key: 'need' }, { key: 'copy' }, { key: 'trust' }, { key: 'ripple' }
    ];

    const ERAS = [
        { id: 'w1', idx: 0, year: -9500, short: '9500 BCE' },
        { id: 'w2', idx: 1, year: -100, short: '330 BCE–180' },
        { id: 'w3', idx: 2, year: 900, short: '500–1100' },
        { id: 'w4', idx: 3, year: 1250, short: '1100–1347' },
        { id: 'w5', idx: 4, year: 1420, short: '1347–1500' },
        { id: 'w6', idx: 5, year: 1620, short: '1500–1700' },
        { id: 'w7', idx: 6, year: 1745, short: '1700–89' },
        { id: 'w8', idx: 7, year: 1815, short: '1789–1850' },
        { id: 'w9', idx: 8, year: 1880, short: '1850–1914' }
    ];

    // Dated landmarks the time tunnel passes. Each year is one the text states.
    const LANDMARKS = [
        { year: 2014, en: 'The Foldscope is described' },
        { year: 1982, en: 'Neodymium magnets are made' },
        { year: 1953, en: 'WD-40 is formulated' },
        { year: 1897, en: 'Ross traces malaria through the mosquito' },
        { year: 1867, en: 'Lister’s antiseptic surgery' },
        { year: 1859, en: 'The first oil well in Pennsylvania' },
        { year: 1854, en: 'Broad Street, Soho' },
        { year: 1846, en: 'Ether shown in public in Boston' },
        { year: 1831, en: 'Cholera reaches Britain' },
        { year: 1812, en: 'Borodino' },
        { year: 1761, en: 'Harrison’s H4 at sea' },
        { year: 1751, en: 'The Encyclopédie begins' },
        { year: 1707, en: 'The Scilly naval disaster' },
        { year: 1665, en: 'The Great Plague of London' },
        { year: 1614, en: 'Napier publishes logarithms' },
        { year: 1600, en: 'Gilbert’s De Magnete' },
        { year: 1498, en: 'Da Gama reaches India' },
        { year: 1450, en: 'Gutenberg’s press in Mainz' },
        { year: 1347, en: 'The Black Death reaches Europe' },
        { year: 1315, en: 'The Great Famine begins' },
        { year: 1286, en: 'Spectacles appear in Tuscany' },
        { year: 1025, en: 'Ibn Sina completes the Canon' },
        { year: -323, en: 'Alexander dies in Babylon' },
        { year: -9500, en: 'Farming is about to begin' }
    ];

    // Order in which the objects are laid out before the ranking is shown.
    // It is fixed, and unrelated to the ranking.
    const MANIFEST_ORDER = ['lighters', 'ors', 'wd40', 'glasses', 'gold', 'potato', 'manual', 'magnets', 'ether', 'compass', 'stamps', 'antibiotics', 'ereader', 'vitc', 'watch', 'foldscope', 'coffee', 'chlorine', 'bednet', 'sliderule'];

    const ITEMS = [
        {
            id: 'potato', emoji: '🥔', dims: { need: 10, copy: 10, trust: 6, ripple: 9 }, sweet: 'w4',
            name: 'Ten sprouting potatoes', sub: 'A mix of colours and varieties · about 1 kg',
            tagline: 'The most boring thing in your kitchen.',
            briefing: 'Not a gadget but a small living factory. Potatoes were bred in the Andes and were unknown to the Old World until the 1500s. They thrive in cool, wet summers and poor soil, and in 18th-century English farm data gave about three times the calories per acre that wheat, barley or oats did.',
            hint: 'Look for a world one bad summer from starvation.',
            tags: ['Copies itself'],
            best: {
                year: 1314, place: 'A village near Ypres, Flanders',
                beats: [
                    ['Arrival', 'Spring 1314. A growing population is pressing on every marginal field, and the harvest has no margin. Nobody here knows that the rain starts next year.'],
                    ['The move', 'You don’t preach. You borrow a patch of poor, wet ground, plant your tubers, and wait. By autumn you dig up many times what you planted, from soil that would barely grow oats. You keep the best back and give seed away. A grower may also value a crop that stays underground, out of sight of soldiers and tax collectors.'],
                    ['The ripple', 'In 1315 the rains come and don’t stop. Wheat and barley rot in the fields, and the Great Famine lasts until the 1317 harvest, among the worst in European history. Potatoes like cool, wet summers. In real history the crop reaches Europe only in the 1570s, by way of the Canaries and Spain. A study by Nunn and Qian credits it, once adopted, with up to a quarter of Old World population and urban growth from 1700 to 1900; a critical review would accept one-sixth to one-quarter.'],
                    ['The catch', 'Monoculture. In the 1840s much of Ireland relied heavily on one variety, the Lumper, blight struck, and about a million people died. That is why you brought many varieties, not one. Green skin and sprouts are toxic, so you must teach what is safe. And a stranger handing out earth-apples in a famine will be called many things.']
                ]
            },
            early: 'Potatoes need fields, people and enough hunger to try something new. Before cities and open-field farming there is little pressure and few fields: one lucky village eats well, and that is all that changes.',
            late: 'The crop is on its way regardless. It reaches Europe in the 1570s and takes generations to win over farmers. You can speed up acceptance by decades at best; the great head start is gone.',
            verdict: 'It tops my ranking because it is the only pick that scores {need} on Need and {copy} on Copy: you give away ten tubers and the era makes a million. Hunger is the oldest problem there is, and the fix hides underground and feeds itself. Its weak point is Trust ({trust}): you must persuade the hungry, and monoculture is a trap of its own making.',
            sources: [
                { label: 'Nunn and Qian, The Potato’s Contribution to Population and Urbanization (2011)', url: 'https://nathannunn.sites.olt.ubc.ca/files/2022/07/nathannunn-the-potatos-contribution.pdf' },
                { label: 'Villalobos and Sevilla, Potatoes: a critical review', url: 'https://forum.effectivealtruism.org/posts/iZrrWGvx2s2uPtica/potatoes-a-critical-review' },
                { label: 'The Great Famine of 1315–1317', url: 'https://en.wikipedia.org/wiki/Great_Famine_of_1315%E2%80%931317' },
                { label: 'How the potato reached Europe, by way of the Canaries (EAPR)', url: 'https://www.eapr.net/node/609' }
            ]
        },
        {
            id: 'ors', emoji: '🧂', dims: { need: 9, copy: 10, trust: 8, ripple: 7 }, sweet: 'w8',
            name: 'Oral rehydration salts', sub: 'Ten sachets · about 205 g',
            tagline: 'A pinch of salt, a pinch of sugar.',
            briefing: 'In 1978 The Lancet called it “potentially the most important medical advance this century”. Cholera and other diarrhoeal diseases kill by draining the body of water and salts within hours. Glucose helps the gut absorb sodium, and water follows the sodium, so a small dose of sugar and salt in water goes where plain water cannot. You can mix the effect in a kitchen.',
            hint: 'Find the first great waterborne panic, before anyone knew what caused it.',
            tags: ['Copies itself', 'Best per gram'],
            best: {
                year: 1831, place: 'Sunderland, England',
                beats: [
                    ['Arrival', 'October 1831, the docks of Sunderland. Cholera has reached Britain, and a keelman has just died a few days after falling ill, blue and shrunken. The doctors bleed, purge and prescribe calomel, which drains patients who are already draining.'],
                    ['The move', 'You dissolve a sachet in a litre of boiled water and show a nurse how to give it to the next patient, a sip at a time. Then you teach the home version everyone can copy: roughly six level teaspoons of sugar and half a teaspoon of salt in a litre of clean water (the Rehydration Project’s home version; official amounts have varied). Nothing to buy, no needle, no permission.'],
                    ['The ripple', 'Severe cholera can kill up to half its victims in an unprepared community; with fluids given early the death rate falls to about one in a hundred or less. Tens of thousands die in Britain in 1831–32 (about 32,000 by some counts; the registered figure for England and Wales is lower). The next year Thomas Latta in Leith gives intravenous salt water to dying patients, with some recoveries, and his method is not widely taken up; he dies in 1833. Yours is the version that needs no surgeon and no authority, only a mother with a spoon.'],
                    ['The catch', 'Nobody can explain why it works. The water-borne cause is argued from 1849 and made persuasive only in 1854; the bacterium is isolated by Koch in 1883–84. You will win on results and lose the argument. Professional caution and mixed results slowed Latta’s method; here the people who matter are the nurses, sailors and mothers who simply do it.']
                ]
            },
            early: 'Without the pandemic, a sachet of salts is a curiosity. Diarrhoeal disease is everywhere but unnamed and unremarkable, and you save the people around you, and no one else.',
            late: 'Cholera still stalks cities in the 1850s and 1860s, so you still save lives. But Latta’s drip (1832), John Snow’s map (1854) and the sewer builders are already in the picture; you arrive after the panic that changes minds.',
            verdict: 'The best gram-for-gram pick on the list: the sachets are only proof, and the real payload is a recipe a child can follow. It scores {copy} on Copy and {trust} on Trust because the effect shows within hours. It loses to the potato only because hunger is a bigger and older enemy than one pandemic. The raters scored its Ripple lower than I did.',
            sources: [
                { label: 'The Lancet 1978 editorial, quoted by rehydrate.org', url: 'https://rehydrate.org/professional/index.html' },
                { label: 'WHO on cholera case-fatality rates (Health Policy Watch)', url: 'https://healthpolicy-watch.news/who-warns-of-the-unacceptable-death-toll-in-global-cholera-outbreaks/' },
                { label: 'Newcastle University cholera archive: the spread of the 1831 outbreak', url: 'https://cholera.ncl.ac.uk/the-spread' },
                { label: 'Hektoen International: Thomas Latta in Leith', url: 'https://hekint.org/leith-in-the-time-of-cholera-the-story-of-thomas-latta/' }
            ]
        },
        {
            id: 'stamps', emoji: '🔤', dims: { need: 7, copy: 9, trust: 8, ripple: 10 }, sweet: 'w4',
            name: 'A child’s alphabet stamp set', sub: '26 letters and a pigment ink pad · 200 g',
            tagline: 'A toy, until you realise what it is.',
            briefing: 'Press a letter, lift it, press another. Rearrange and print again. Movable type is just this, done in metal, and Europe waited until about 1450 to do it, though it had paper, presses, ink, an alphabet and plenty of metalworkers cutting punches for coins.',
            hint: 'Where were there readers, paper, and a demand nobody had solved yet?',
            tags: ['Idea in a box'],
            best: {
                year: 1285, place: 'Bologna, Italy',
                beats: [
                    ['Arrival', 'Bologna, 1285. The university copies its textbooks by renting out approved texts in loose sections (peciae) so that many students can copy them by hand at once. Paper, made in the mills at Fabriano, is cheap enough to fill the shops. The demand is here. What is missing is the idea.'],
                    ['The move', 'You show a goldsmith the set. He already cuts steel punches for coin dies and seals. In a week he strikes a letter into a soft matrix and casts it in a lead-tin alloy (Gutenberg’s later added antimony); in a month, a page. You pass on one thing Gutenberg’s printers later relied on: an oil-based ink, because watery ink beads up on metal.'],
                    ['The ripple', 'A printed page costs a fraction of a copied one, and every copy is identical, which means tables, maps and diagrams stop degrading each time they are transcribed. The real start, around 1450, was followed by millions of books across Europe by 1500 (estimates range from about eight million to more than twenty million). You have moved the clock back about 165 years. Dante, then twenty, is a generation away from writing the Divine Comedy.'],
                    ['The catch', 'Guilds of scribes, universities and the Church all had a stake in controlling copying, and printing spreads propaganda as fast as scripture; the Reformation was largely printed. And in real history, the sack of Mainz in 1462 is traditionally said to have scattered the printers, though historians doubt how much and printing had already begun to spread. Diffusion can be slow without a shock.']
                ]
            },
            early: 'Before paper, a large book costs a herd’s worth of skins, and before the rise of towns and universities there are few readers. Movable type on parchment is a gimmick nobody can afford to run.',
            late: 'Gutenberg is about to do it, or already has (about 1450). You would arrive as a footnote, and the stamps would make a good gift for a printer’s apprentice.',
            verdict: 'It takes the top Ripple score ({ripple}) because cheap, identical text compounds everything else on this list. It is replicable by any goldsmith (Copy {copy}) and a child can explain it (Trust {trust}). It does not top the ranking because books are not bread: the need is real but not life and death.',
            sources: [
                { label: 'Princeton: Beyond Mainz, the spread of printing shops', url: 'https://dpul.princeton.edu/gutenberg/feature/beyond-mainz-the-diaspora-of-printing-shops' },
                { label: 'CERL: print runs of the incunable period', url: 'https://www.cerl.org/_media/resources/links_to_other_resources/printruns_intro.pdf' },
                { label: 'Buringh and van Zanden, Charting the “Rise of the West” (2009)', url: 'https://ideas.repec.org/a/cup/jechis/v69y2009i02p409-445_00.html' },
                { label: 'The pecia system of university copying', url: 'https://en.wikipedia.org/wiki/Pecia' }
            ]
        },
        {
            id: 'sliderule', emoji: '📏', dims: { need: 8, copy: 9, trust: 6, ripple: 9 }, sweet: 'w6',
            name: 'An aluminium slide rule', sub: '30 cm · 120 g',
            tagline: 'The computer that never needs charging.',
            briefing: 'Two sliding scales that add lengths to multiply numbers: logarithms made physical. Before 1614 nobody had published them, and astronomers, navigators and gunners spent years of their lives on multiplication.',
            hint: 'Find the genius who was drowning in arithmetic.',
            tags: ['Idea in a box'],
            best: {
                year: 1600, place: 'Bohemia',
                beats: [
                    ['Arrival', 'Bohemia, 1600. Tycho Brahe holds more than twenty years of the best naked-eye observations ever made, and Johannes Kepler has just arrived to make sense of them. Each planetary orbit means thousands of long multiplications and divisions, all done by hand.'],
                    ['The move', 'Kepler is a magnificent geometer who hates drudgery. You show him the rule, which a carpenter could copy from boxwood in a few days, and give him the idea behind it: multiplication becomes addition. John Napier will publish logarithms in 1614; you have saved him fourteen years.'],
                    ['The ripple', 'Kepler’s Mars work, which took years of arithmetic and appeared in 1609, might have run faster. But the Rudolphine Tables (1627, using logarithms) were slowed more by money, war and a dispute with Tycho’s heirs than by arithmetic, so the gain is smaller than it looks. Navigators and gunners get accurate tables a generation sooner.'],
                    ['The catch', 'A slide rule gives about three significant figures: fine for engineering, not for astronomy tables, which need logarithms to seven or more digits computed by hand over years. The rule is the demonstration; the real gift is the idea. And logarithms arrive anyway in 1614, so you buy fourteen years, not a century. A solar calculator would be more magical and far less useful: nobody could copy it.']
                ]
            },
            early: 'A log scale means nothing to a world that hasn’t learned decimal fractions (Simon Stevin published them in 1585) and for which arithmetic is not yet the bottleneck of anything. You are showing a puzzle to people with no use for the answer.',
            late: 'Napier has published (1614), Gunter has made the scale (1620) and Oughtred makes it slide about 1622. You would be showing off an aluminium one, and little else.',
            verdict: 'The purest “idea in a box”: a carpenter can copy it (Copy {copy}) and it needs no power. I gave it Need {need} and Ripple {ripple} on the grounds that calculation throttled the Scientific Revolution. All three raters disagreed sharply, scoring its Need at 3 or 4, and the Rudolphine Tables were delayed by money and war as much as by arithmetic. Of all my scores, these are the ones I trust least.',
            sources: [
                { label: 'Oughtred and the slide rule (St Andrews)', url: 'https://mathshistory.st-andrews.ac.uk/SH/oughtred_sh.pdf' },
                { label: 'The Rudolphine Tables', url: 'https://en.wikipedia.org/wiki/Rudolphine_Tables' },
                { label: 'Tycho Brahe and Kepler (Linda Hall Library)', url: 'https://www.lindahall.org/about/news/scientist-of-the-day/tycho-brahe-2/' },
                { label: 'John Napier', url: 'https://en.wikipedia.org/wiki/John_Napier' }
            ]
        },
        {
            id: 'glasses', emoji: '👓', dims: { need: 7, copy: 7, trust: 9, ripple: 9 }, sweet: 'w2',
            name: 'A dozen reading glasses', sub: '+1.0 to +3.5 · 250 g',
            tagline: 'Cheap, ugly, and about 1,500 years early.',
            briefing: 'Around age forty or forty-five, the eye’s lens stiffens and close focus is lost. For most of history that ended reading and fine craft just when people were most skilled. Spectacles appeared in Tuscany, probably in the late 1280s, though convex lenses had existed for well over a thousand years before.',
            hint: 'Where were the most readers, scholars and glassmakers in one place?',
            tags: ['Idea in a box', 'Instant demo'],
            best: {
                year: -240, place: 'Alexandria, Egypt',
                beats: [
                    ['Arrival', 'Alexandria, about 240 BCE. The Library and its Mouseion gather the largest community of scholars in the world; Eratosthenes, soon to measure the circumference of the Earth, is the chief librarian. Many of the senior scholars are past forty, and the writing is small on papyrus rolls.'],
                    ['The move', 'You hand out the glasses and watch faces change. Then you show a glassworker how a clear bead or a ground rock-crystal disc does the same thing. Polished rock-crystal pieces existed (the Nimrud crystal, from the eighth century BCE, was long thought a lens but may be an inlay), and Seneca will note three centuries later that letters look bigger through a glass globe of water. You show a simple wire frame that rests on the nose.'],
                    ['The ripple', 'A longer working life for every scribe, engraver, weaver and instrument-maker past forty, in a world where experience took decades to build. And a trade in lens-grinding that would otherwise start in the 1280s. The telescope appears in the Netherlands in 1608 and the compound microscope soon after (traditionally about 1590, though that date is doubtful); with a lens-making craft in place for over a thousand years, optical science could start far earlier.'],
                    ['The catch', 'Everything depends on the glass. Hellenistic glass was usually tinted and bubbly; truly clear glass came in Roman times and became standard with Venetian cristallo about 1450. The first copies will be weak and cloudy, and you are betting on rock crystal and patience. A longer working life is also not the same thing as a scientific revolution.']
                ]
            },
            early: 'Before the Hellenistic world there are too few literate scholars to miss close reading, and too little glass-working skill to copy lenses. The glasses stay a curiosity, and when they break the gift is gone.',
            late: 'By the 1290s spectacles are appearing in Italy, and within a generation they are widely sold. After that, you are just one more man with a tray of lenses.',
            alt: {
                w3: { mult: 0.7, text: 'Baghdad and Cairo, around 1000. Ibn al-Haytham is working on his Book of Optics (older accounts date it to 1011–21, recent scholarship to 1028–38), the best treatment of how light bends in glass, and the glassmakers are skilled. Spectacles still aren’t made, so you bring them close to three centuries early. That is a real head start, but the Alexandrian scholars you most wanted to help are a thousand years gone.' }
            },
            verdict: 'Trust {trust}: nobody argues with being able to read again, which is the best instant demonstration on the list. Ripple {ripple} comes from lenses compounding into the microscope and telescope. It sits below the potato and the salts because a longer career is a gentler problem than famine or cholera, and the glass of the era limits the copies.',
            sources: [
                { label: 'The Nimrud lens (British Museum)', url: 'https://www.britishmuseum.org/collection/object/W_-90959' },
                { label: 'Medieval eyeglasses: wearable technology of the thirteenth century', url: 'https://www.medievalists.net/2016/03/medieval-eyeglasses-wearable-technology-of-the-thirteenth-century/' },
                { label: 'Cristallo, the clear Venetian glass', url: 'https://en.wikipedia.org/wiki/Cristallo' },
                { label: 'Rome’s finest glass (Smithsonian)', url: 'https://www.smithsonianmag.com/smart-news/romes-finest-glass-was-made-egypt-180975482/' }
            ]
        },
        {
            id: 'vitc', emoji: '🍋', dims: { need: 9, copy: 7, trust: 7, ripple: 7 }, sweet: 'w5',
            name: 'Vitamin C tablets', sub: '100 × 1,000 mg · 150 g',
            tagline: 'The pill that wasn’t there.',
            briefing: 'For about three centuries of ocean travel, a mysterious disease is estimated to have killed around two million sailors, more than storms and shipwreck combined. Gums swelled, old wounds reopened, men grew weak and died. The cause was the lack of vitamin C: about 10 mg a day prevents it, so a single 1,000 mg tablet is a hundred days’ worth.',
            hint: 'Who went months without fresh food?',
            tags: ['Knowledge matters more than pills'],
            best: {
                year: 1498, place: 'The Indian Ocean, aboard Vasco da Gama’s fleet',
                beats: [
                    ['Arrival', 'August 1498, leaving Calicut for home. Ahead lie about four months of calms and no landfall (sources give 100 to 132 days), and the men’s gums are already starting to swell. The fleet left Lisbon the year before with about 170 men (sources vary); only 54 or 55 will see Portugal again, and scurvy will take many of those who die.'],
                    ['The move', 'The arithmetic is humbling. 100 tablets is 100 g, and 170 men at the 10 mg-a-day minimum for a crossing of up to 132 days would need more than double that. So the bottle is a rescue kit: you give the sickest thirty to a hundred times the minimum (300 to 1,000 mg a day) and watch gums firm within days. Then you teach the lesson that costs nothing: fresh fruit, citrus above all, and greens, at every landfall.'],
                    ['The ripple', 'A visible recovery is the best argument there is. Portugal runs the longest, deadliest sea route on Earth and has a state apparatus to enforce a rule. Instead of waiting for James Lind’s trial in 1747 and the Royal Navy’s lemon-juice ration in 1795, the knowledge goes into every later voyage: Magellan in 1519 (roughly 240 to 270 men set out in five ships; one ship and 18 men completed the circuit) and Anson in 1740 (roughly 1,300 of about 1,900 dead, mostly of scurvy).'],
                    ['The catch', 'The cure had been found and lost before. In the winter of 1535–36 Jacques Cartier’s crew were healed by a tea of conifer bark and needles, probably white cedar, and the knowledge decayed anyway. Knowledge in a bottle fades unless an institution keeps it, and a bottle of tablets runs out in a week.']
                ]
            },
            early: 'Before long ocean voyages, scurvy is a seasonal misery, not a mass killer of sailors: coasts and landfalls supply fresh food. Your bottle cures a handful of cases and no more.',
            late: 'By the 1790s the Royal Navy issues lemon juice, and Cook’s voyages (1768–1779) have already shown the value of fresh food. Your pills are a convenience.',
            verdict: 'The need is spectacular (Need {need}: perhaps millions of sailors dead) and visible recovery gives it good Trust ({trust}). But the bottle itself runs out in days, so what saves anyone is the lesson. The raters scored its Need and Ripple lower than I did, reasoning that lemons are easy once someone tells you.',
            sources: [
                { label: 'University of Washington on the 10 mg figure and the 1944 scurvy trial', url: 'https://www.washington.edu/news/2021/08/16/new-analysis-of-landmark-scurvy-study-leads-to-update-on-vitamin-c-needs/' },
                { label: 'Anson’s voyage (Linda Hall Library)', url: 'https://voyages.lindahall.org/anson.shtml' },
                { label: 'Scurvy (The Canadian Encyclopedia), on Cartier and annedda', url: 'https://thecanadianencyclopedia.ca/en/article/scurvy' },
                { label: 'Lind and the cure for scurvy', url: 'https://www.ebsco.com/research-starters/history/lind-discovers-cure-scurvy' }
            ]
        },
        {
            id: 'manual', emoji: '📖', dims: { need: 8, copy: 8, trust: 5, ripple: 8 }, sweet: 'w6',
            name: 'A rebuild-the-world paperback', sub: 'Something like Lewis Dartnell’s The Knowledge · 1 kg',
            tagline: 'Paper. No battery. Written for exactly this.',
            briefing: 'Not an encyclopedia but a guide to restarting civilisation: how to purify water, grow food, make soap and glass, work metals, make penicillin, communicate, and much more. A different book, Where There Is No Doctor, is written for people with no doctor nearby.',
            hint: 'Where would readers of modern English exist, with workshops and a way to share?',
            tags: ['Beats the e-reader'],
            best: {
                year: 1665, place: 'London, England',
                beats: [
                    ['Arrival', 'London, spring 1665. The Royal Society is five years old and has just begun the Philosophical Transactions. Boyle, Hooke and Wren are at work. The plague is spreading and will scatter the Society, and Newton will go home to Woolsthorpe when it closes Cambridge. The Great Plague will kill perhaps a fifth of the city.'],
                    ['The move', 'You don’t hand it to a genius; you let it be copied. Hooke reads the chapters on glass, optics and clocks, Boyle the chemistry of gases, and Henry Oldenburg, the Society’s secretary, writes to half of Europe. You are lending a map of the order of discovery: which dead ends to skip, and what each step needs next.'],
                    ['The ripple', 'The Society has the minds, the instruments and a way to publish. What it lacks is a map of the road, and a book that explains what fire and rust are, says fever is carried by something small and shows how to build a steam engine turns decades of experiments into years. Plausible gains are decades, perhaps a century, on sanitation, industrial chemistry and steam.'],
                    ['The catch', 'A manual assumes you know what is missing, and practical know-how still needs workshops, tolerances and metals the age can’t yet make. And being found with a book that describes the future is dangerous: the writ for burning heretics is not abolished until 1677, and a witchcraft statute is on the books. Nobody fully trusts the stranger with the book.']
                ]
            },
            early: 'In a world without readers of English, or any reader who can follow the diagrams, the manual is a stack of strange pages. Even translated, it has no audience: no institution to read, test and pass it on.',
            late: 'By the 1800s science produces more than any single book can hold, and the book’s head start has been eaten. You are a curiosity, not a catalyst.',
            verdict: 'It beats the e-reader on almost every axis. Ten people can read it at once, nothing needs charging, and the chapters were chosen for people with no factories. Trust ({trust}) holds it back: an English paperback from the future is a dangerous thing to carry through the 1660s.',
            sources: [
                { label: 'The Great Plague of London (Britannica)', url: 'https://britannica.com/print/article/243560' },
                { label: 'De heretico comburendo, the heresy-burning law', url: 'https://en.wikipedia.org/wiki/De_heretico_comburendo' },
                { label: 'The Knowledge: How to Rebuild Our World from Scratch (publisher summary)', url: 'https://publishersweekly.com/9781594205231' }
            ]
        },
        {
            id: 'ether', emoji: '🧪', dims: { need: 8, copy: 8, trust: 7, ripple: 6 }, sweet: 'w8',
            name: 'A vial of ether', sub: '100 ml and a cloth · 150 g',
            tagline: 'Painless surgery, thirty-four years early.',
            briefing: 'Before 1846, surgeons relied on speed, strong assistants and strong drink. Ether had been made since about 1540 and its sleep-inducing effect noticed again and again. Nobody demonstrated it for surgery in public until 1846. The barrier wasn’t chemistry; it was imagination.',
            hint: 'Where was speed the only anaesthetic, and who had the prestige to spread a lesson?',
            tags: ['Idea in a bottle'],
            best: {
                year: 1812, place: 'Borodino, Russia',
                beats: [
                    ['Arrival', '7 September 1812, the field after Borodino. Dominique Larrey, Napoleon’s chief surgeon, who invented the “flying ambulance” to carry the wounded off the field, is working through the night. Later biographies say he performed some two hundred amputations in twenty-four hours. The figure is traditional rather than documented, but nobody doubts the pace.'],
                    ['The move', 'You show him the vial, soak a cloth, and let a wounded soldier breathe. Larrey is an empiricist with huge authority: he is credited with noticing that cold numbs pain, from operating in the freezing Eylau campaign of 1807 and again in the retreat. His writings are widely read among army surgeons.'],
                    ['The ripple', 'Anaesthesia lets surgery slow down and be careful, ends the screaming and the shock deaths from pain, and makes elective operations thinkable. Humphry Davy had suggested nitrous oxide for surgery in 1800, and the idea could take hold in the decades the real world lost.'],
                    ['The catch', 'A twist: in real history, after 1846, ether gave surgeons the nerve to attempt bigger operations, and until Lister’s antiseptic method (1867) infections are often said to have climbed. Painless surgery came first; safe surgery came later. Ether is also flammable and its vapour heavy, and dosing it without training can kill. You bring the idea, not a supply.']
                ]
            },
            early: 'There is no securely documented ether before about 1540, and no tradition of organised army surgeons exists to spread the lesson. You help one patient, and a sceptical village remembers it as sorcery.',
            late: 'In October 1846 the Boston dentist William Morton demonstrates ether in public, and the news crosses the Atlantic within weeks. You would have to be in the room that day to matter.',
            verdict: 'Need {need}: every operation in history had a screaming patient. Copy {copy}: distil alcohol with an acid; apothecaries could do it. Ripple is only {ripple} because painless surgery without clean surgery produced a nasty interlude. The raters rated it more highly than I did, and all three would land it earlier.',
            sources: [
                { label: 'Timeline of anaesthesia (History of Anaesthesia Society)', url: 'https://histansoc.org.uk/resources/timeline' },
                { label: 'Crawford Long, who used ether privately in 1842', url: 'https://en.wikipedia.org/wiki/Crawford_Long' },
                { label: 'Dominique-Jean Larrey (Life in the Fast Lane)', url: 'https://litfl.com/dominique-jean-larrey/' },
                { label: 'From barbers and butchers to modern surgeons (Science History Institute)', url: 'https://www.sciencehistory.org/distillations/from-barbers-and-butchers-to-modern-surgeons' }
            ]
        },
        {
            id: 'chlorine', emoji: '💧', dims: { need: 7, copy: 8, trust: 6, ripple: 7 }, sweet: 'w9',
            name: 'Water-purification tablets', sub: '100 chlorine tablets · 60 g',
            tagline: 'The pump handle, in your pocket.',
            briefing: 'One chlorine-releasing tablet disinfects a litre or more of water in about half an hour. In 1854 most doctors still blamed “miasma”, bad air. John Snow had argued since 1849 that water carried cholera, but he had not persuaded the profession.',
            hint: 'Find the outbreak that made a doctor draw a map.',
            tags: ['Proof, not just a cure'],
            best: {
                year: 1854, place: 'Broad Street, Soho, London',
                beats: [
                    ['Arrival', '3 September 1854. Since the night of 31 August, popular accounts count 127 residents of Broad Street dead (registrar figures for the first days are lower). Within ten days Snow counts upwards of 500 fatal attacks, and totals run from about 420 to 700, with 616 the usual figure. Medical opinion says miasma. A local doctor called John Snow suspects the water from the Broad Street pump.'],
                    ['The move', 'You treat the pump’s water, and the cases among those who drink it stop. It is a controlled experiment of the kind Snow can only argue for. Snow needed the Board of Guardians to remove the pump handle on 8 September; your tablets give him evidence they cannot dismiss.'],
                    ['The ripple', 'One of the first emergency chlorinations of a public supply was at Maidstone in 1897, and the first continuous one in the United States at Jersey City in 1908; cholera and typhoid killed in cities everywhere until then. If “an invisible poison in water” is accepted in 1854 rather than the 1880s, sewers (Bazalgette’s London system began in 1859) and treatment are built for the right reason, thirty years sooner.'],
                    ['The catch', 'One outbreak, one pump. Snow’s argument still faces a profession wedded to miasma until Koch’s work in 1883–84, and for some time after, and the Soho outbreak was already waning when the handle came off, so your gain is persuasion, not the lives of that street. Your hundred tablets run out. The delta is in the speed of belief.']
                ]
            },
            early: 'Before cholera reaches Europe in the 1830s, there is no public demand for an invisible, waterborne cause. The tablets purify your own water, and nobody else’s.',
            late: 'After 1883 Koch has identified the cholera bacterium, and chlorination appears at the end of the 1890s. The proof you bring has already been won in the laboratory.',
            verdict: 'A rare case where the object is evidence rather than medicine. Trust is only {trust} because the miasma theory was deeply entrenched; Need {need} and Copy {copy}, since chloride of lime was already a common industrial chemical by 1854. It is a speed-up of an inevitable discovery, which is why it is a solid pick rather than a great one. The raters would land it a window earlier than I did.',
            sources: [
                { label: 'John Snow’s Broad Street data (Michigan State University)', url: 'https://johnsnow.matrix.msu.edu/work.php/id=15-78-82/' },
                { label: 'The Broad Street outbreak (UCLA Department of Epidemiology)', url: 'https://epi-snow.ph.ucla.edu/Stream2_BSPoutbreak_d.html' },
                { label: 'John L. Leal and the first continuous chlorination', url: 'https://en.wikipedia.org/wiki/John_L._Leal' },
                { label: 'Vibrio cholerae and Koch’s identification', url: 'https://en.wikipedia.org/wiki/Vibrio_cholerae' }
            ]
        },
        {
            id: 'compass', emoji: '🧭', dims: { need: 6, copy: 9, trust: 6, ripple: 7 }, sweet: 'w2',
            name: 'A baseplate compass', sub: '40 g',
            tagline: 'A needle that always points at the same thing.',
            briefing: 'Magnetised needles floated on water are described in China by 1088 and used at sea by about 1111–17; Europe has them by about 1190. Later Roman writers such as Vegetius call the Mediterranean “closed” from 11 November to 10 March, citing bad weather.',
            hint: 'Whose supply chain closed every winter?',
            tags: ['Idea in a box'],
            best: {
                year: -30, place: 'Puteoli, on the Bay of Naples',
                beats: [
                    ['Arrival', 'Puteoli, 30 BCE, where the Alexandria grain ships unload before the grain goes on to Rome. Octavian has just taken Egypt, whose granaries will feed Rome for roughly a third of the year (Josephus’s later figure). The ships sail from Alexandria in the good months; later writers will call the sea closed in winter, and whether or not that is a rule, winter overcast makes every voyage a gamble.'],
                    ['The move', 'You show a shipowner the needle in a bowl of water, and how to magnetise a plain needle by stroking it with a lodestone. Roman writers like Lucretius already knew that lodestones attract iron. He gets the point in an afternoon.'],
                    ['The ripple', 'Year-round shipping, fewer wrecks and faster trade. The winter closure that froze Mediterranean commerce for months loosens. Rome already has the world’s largest network of ports and roads, so the effect compounds on an empire at its most connected. You have given sailors a direction about twelve centuries before Europe adopted it.'],
                    ['The catch', 'A compass tells you the way, not where you are. You still need latitude, charts and a ship built for winter gales, and magnetic declination wanders. You’ve widened the sailing window, not abolished the risk.']
                ]
            },
            early: 'Phoenician and Greek captains already range far by coast and star, and before large-scale sea trade, direction isn’t the bottleneck. It gives a modest edge to a few voyages.',
            late: 'By about 1190 Europe has the compass, and it is widespread in Mediterranean shipping by 1300. The idea may already have travelled from China.',
            verdict: 'Copy {copy}: a needle and a lodestone. But Need is only {need} because the Mediterranean worked tolerably without it for centuries, and a compass doesn’t tell you where you are. A good pick, a minor revolution, and the cheapest item on the list to lose.',
            sources: [
                { label: 'History of the compass', url: 'https://en.wikipedia.org/wiki/History_of_the_compass' },
                { label: 'Winter shipping in the Roman world (Roman Ports)', url: 'https://romanports.org/en/articles/human-interest/156-winter-shipping.html' },
                { label: 'Josephus, Jewish War 2.386, on Egypt feeding Rome', url: 'https://lexundria.com/j_bj/2.386/' }
            ]
        },
        {
            id: 'foldscope', emoji: '🔬', dims: { need: 7, copy: 4, trust: 7, ripple: 9 }, sweet: 'w3',
            name: 'A Foldscope', sub: 'A paper microscope · about 8 g',
            tagline: 'A laboratory you can fold into your pocket.',
            briefing: 'Described by a Stanford lab in 2014: a printed sheet of paper folded into a working microscope around a tiny ball lens. In its standard form it magnifies about 140 times and resolves about 2 micrometres, and it costs under a dollar in parts at scale, excluding assembly. Higher-power lenses in the original paper go much further.',
            hint: 'Who was already suspecting the invisible, and could read what they saw?',
            tags: ['Idea in a box'],
            best: {
                year: 1020, place: 'Persia, in the circle of Ibn Sina',
                beats: [
                    ['Arrival', 'Persia, about 1020. Ibn Sina (Avicenna), physician and philosopher, is writing the Canon of Medicine, which will teach doctors for six hundred years. He argues that some illnesses, tuberculosis among them, pass between people, and that water and soil can carry disease. In Cairo, Ibn al-Haytham is at work on the Book of Optics (older accounts date it to 1011–21, recent scholarship to 1028–38), the best account of light, vision and refraction on Earth.'],
                    ['The move', 'You let him look. A drop of pond water becomes a crowd of moving specks; Leeuwenhoek will describe such “little animals” in 1676 (they were later called animalcules). Ibn Sina has a theory ready for what he is seeing, and a reputation across the eastern Islamic world.'],
                    ['The ripple', 'Science at the moment is theory-rich and instrument-poor, and a microscope tips the balance towards observation, six hundred years early. The best case is something like a germ theory argued seriously in the eleventh century, and a lens-making trade serving it, in a civilisation with a hospital system to test it.'],
                    ['The catch', 'A Foldscope’s resolution is at the edge of seeing bacteria: you would see protozoa and blood cells clearly, and bacteria only as faint specks. Seeing is not understanding; Leeuwenhoek saw what were probably bacteria in 1676 and it took two centuries to link them to disease. And you have exactly one, and it’s made of paper.']
                ]
            },
            early: 'Before lens-literate cultures, nobody can interpret what the “little animals” mean. You amaze a village, and a month later the paper has rotted.',
            late: 'Compound microscopes appear in the Netherlands around 1600 (the traditional attribution to the Janssens is uncertain) and Hooke’s Micrographia follows in 1665. The shock has already happened, and a paper one is a pocket convenience.',
            verdict: 'The most interesting “could have changed everything” item, with a catch built in: Copy is only {copy} because nobody can grind a ball lens from your paper and there is only one of it. Ripple {ripple}: a tool for seeing the invisible changes how every later problem is attacked. Its chain from seeing to curing is long, and all three raters would land it later than I did.',
            sources: [
                { label: 'Foldscope user guide', url: 'https://foldscope.com/pages/user-guide-foldscope-2-0-explorer-kit' },
                { label: 'Cybulski, Clements and Prakash, Foldscope (PLOS ONE, 2014)', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098781' },
                { label: 'Leeuwenhoek’s letter of 1676 (Royal Society)', url: 'https://makingscience.royalsociety.org/items/el_l1_22' },
                { label: 'Ibn al-Haytham: an introduction (Muslim Heritage), on the dating of the Optics', url: 'https://muslimheritage.com/nader-el-bizri-ibn-al-haytham-an-introduction/' }
            ]
        },
        {
            id: 'bednet', emoji: '🦟', dims: { need: 7, copy: 7, trust: 4, ripple: 6 }, sweet: 'w2',
            name: 'An insecticide-treated bed net', sub: '300 g',
            tagline: 'Rome already had mosquito nets. It didn’t know why they mattered.',
            briefing: 'Malaria has been one of history’s great killers. The link with mosquitoes was worked out only in 1897–98 (Ross’s bird-malaria work in India, Grassi’s human experiments in Italy), and the disease’s name is Italian: mal aria, “bad air”. Nets are old technology; knowing what they are for is the new part.',
            hint: 'Find the empire whose heartland was a malarial marsh.',
            tags: ['Knowledge in cloth'],
            best: {
                year: 110, place: 'The Pontine Marshes, south of Rome',
                beats: [
                    ['Arrival', 'Latium, around 110 CE. Rome brings water in on ten aqueducts, builds sewers and drains marshes, and still the fever returns each summer in the Pontine Marshes and the Campagna. Most Romans blame bad air, though a few farming writers, Varro among them, already distrust the marshes’ tiny creatures. Romans do sleep under gauze canopies (the Greek word is kōnōpeion, Latin conopeum) borrowed from Egypt.'],
                    ['The move', 'You show them the whole life of the mosquito: the wrigglers in standing water, the bite, the fever. You also show them a natural insecticide, the flowers of the Dalmatian chrysanthemum, which grows within the empire though nobody there is known to have used it against insects. Roman linen and engineers do the rest. The Romans love a drainage project, and they have already tried the marshes more than once.'],
                    ['The ripple', 'Drain the breeding water, net the beds. The Campagna becomes habitable many centuries before Mussolini’s drainage of the 1930s, and malaria’s long shadow over Italian history (armies, popes, Dante, who is traditionally thought to have died of malaria in 1321) lifts. A healthier core is a more stable empire.'],
                    ['The catch', 'Roman scepticism. You are claiming that tiny insects, not bad air, cause fever, and without a microscope you cannot show the parasite. You can show the effect, but only after a season, and the Antonine and Cyprianic plagues were not malaria, so no net would touch them.']
                ]
            },
            early: 'In a world of mobile hunter-gatherers, malaria is a smaller burden: it grew with farming and settled villages beside standing water. The need is still there, but there are few to protect.',
            late: 'By 1897–98 Ross and Grassi have worked out the mosquito’s part, and by the early 1900s drainage and nets are public policy (the Panama Canal was built with mosquito control). You are no longer ahead of anyone.',
            verdict: 'Great Need and a decent Copy ({copy}: linen, flowers and drains), but Trust is the lowest of the top twelve at {trust}: “a tiny insect gave you fever” is a hard claim to make in 110 CE. It illustrates a general rule on this list: an object that carries a hard-to-believe idea is worth less than one that proves itself.',
            sources: [
                { label: 'Frontinus and the Roman aqueducts', url: 'https://en.wikipedia.org/wiki/Frontinus' },
                { label: 'Lewis and Short: conopeum', url: 'https://www.alatius.com/ls/index.php?l=conopeum' },
                { label: 'Roman fever: understanding malaria in the ancient Roman world (Medical Journal of Australia)', url: 'https://www.mja.com.au/journal/2016/205/11/roman-fever-observations-understanding-malaria-ancient-roman-world' },
                { label: 'The Pontine Marshes', url: 'https://en.wikipedia.org/wiki/Pontine_Marshes' }
            ]
        },
        {
            id: 'watch', emoji: '⌚', dims: { need: 7, copy: 2, trust: 7, ripple: 8 }, sweet: 'w7',
            name: 'A Casio F-91W', sub: 'A £15 digital watch · 21 g',
            tagline: 'Cheaper than lunch. Good enough for the Longitude Prize.',
            briefing: 'Accurate to about 30 seconds a month, with a battery that lasts years. The Royal Navy of 1707 could not work out its longitude: to know how far east or west you are, you need to know the time at your home port. A £15 digital watch is exactly that.',
            hint: 'Find the year the Navy learned what bad longitude costs.',
            tags: ['Single copy'],
            best: {
                year: 1707, place: 'HMS Association, off the Isles of Scilly',
                beats: [
                    ['Arrival', 'October 1707, aboard Admiral Sir Cloudesley Shovell’s flagship, returning from Toulon. Days of cloud and rough weather have blotted out the sun. The pilots disagree about where the fleet is, and Shovell goes with the majority. On the night of the 22nd they are about to run onto the rocks off the Isles of Scilly.'],
                    ['The move', 'Your watch shows Greenwich time (effectively UTC). At noon you take the sun’s height and note the watch: every four minutes of difference between local noon and Greenwich noon is one degree of longitude. The fleet is much nearer the Scillies than the pilots think, and the turn they are planning is straight at the rocks.'],
                    ['The ripple', 'Four ships and somewhere between 1,400 and 2,000 men (counts vary) are saved, in one of the worst disasters in Royal Navy history. And you know what happened next: Parliament passed the Longitude Act in 1714, offering up to £20,000 for a method accurate to half a degree, roughly 3 seconds a day over a six-week voyage (lesser sums for lesser accuracy). Harrison’s H4 was ready by about 1760 and proved itself on a sea trial in 1761–62. The target specification arrives more than fifty years early.'],
                    ['The catch', 'You have one watch, and it can’t be copied: a quartz oscillator is more than two centuries beyond the metalworkers of 1707. The Admiralty would want a method others could reproduce, not a miracle, and Harrison still has to build his clocks. You save a fleet and a few decades, not the whole age.']
                ]
            },
            early: 'Before the age of long ocean crossings, longitude isn’t a life-or-death problem. A coastal pilot’s eyes and a lead line beat any watch.',
            late: 'After Harrison’s H4 and the chronometers of Arnold and Earnshaw (patents of 1782–83), chronometers reach the Navy in the 1790s and 1800s, though still at a high price. Your watch is a gadget with a backlight.',
            verdict: 'A single, perfect rescue with a limited ripple: Copy {copy} sinks it, since a quartz watch can’t be manufactured in the 1700s. Trust {trust} because a very accurate clock is easy to demonstrate. Fantastic for the crew of the Association, modest for history, and the raters scored its Ripple lower than I did.',
            sources: [
                { label: 'The Longitude rewards', url: 'https://en.wikipedia.org/wiki/Longitude_rewards' },
                { label: 'Board of Longitude', url: 'https://en.wikipedia.org/wiki/Board_of_Longitude' },
                { label: 'Scilly naval disaster of 1707', url: 'https://en.wikipedia.org/wiki/Scilly_naval_disaster_of_1707' },
                { label: 'Casio F-91W', url: 'https://en.wikipedia.org/wiki/Casio_F-91W' }
            ]
        },
        {
            id: 'ereader', emoji: '📱', dims: { need: 9, copy: 2, trust: 5, ripple: 7 }, sweet: 'w7',
            name: 'A solar e-reader with offline Wikipedia', sub: '250 g plus a panel · about 100 GB',
            tagline: 'The one everyone picks first.',
            briefing: 'All of human knowledge in your hands: the obvious choice, and the one most likely to disappoint. Information is not power unless someone can use it, in a language they can read, with the materials to act on it.',
            hint: 'Where do people want a universal encyclopaedia, and have the workshops to act on it?',
            tags: ['Overrated', 'Bandwidth-limited'],
            best: {
                year: 1750, place: 'Paris, France',
                beats: [
                    ['Arrival', 'Paris, 1750. Denis Diderot and Jean d’Alembert have just issued the prospectus for the Encyclopédie (the first volume follows in 1751), a project to gather the knowledge scattered across the earth. Their problem is collecting, checking, and getting past the censors.'],
                    ['The move', 'You show Diderot the screen. The book he is trying to write has been assembled. The trouble is the interface, which is you. Reading French you can translate by hand at a few pages an hour. The Encyclopédie took about twenty-one years, more than 130 named contributors and roughly 21 million words; English Wikipedia is roughly two hundred times larger.'],
                    ['The ripple', 'A well-chosen few hundred entries (germ theory, thermodynamics, electromagnetism, organic chemistry, antibiotics) hand-copied by you and distributed through Diderot’s network could put the Enlightenment on fast-forward by perhaps a decade or two. Your bandwidth and the battery’s life are the ceiling.'],
                    ['The catch', 'Knowledge is not capability. Most of Wikipedia presupposes materials, machine tools and pure reagents that don’t exist. And a glowing slab is an object the censors will want: the Encyclopédie’s first two volumes were suppressed in 1752 and the whole work was condemned by the Pope in 1759. The slab could be confiscated, and then it is gone.']
                ]
            },
            early: 'Before about 1500, nobody can read modern English, nobody uses decimal fractions, and the groundwork of shared science doesn’t exist. A glowing slab is a mystery nobody can use.',
            late: 'By the nineteenth century science moves faster than any one person could transcribe, and the e-reader is a very expensive library card.',
            verdict: 'Everyone’s first instinct, and the lesson of the list: it has a high Need score ({need}, because it contains everything) and one of the lowest Copy scores ({copy}, because you are the only reader and the battery will die). The paperback beats it on every axis except size. Every rater named it the most overrated object.',
            sources: [
                { label: 'ARTFL Encyclopédie project (University of Chicago)', url: 'https://encyclopedie.uchicago.edu/' },
                { label: 'Encyclopédie', url: 'https://en.wikipedia.org/wiki/Encyclop%C3%A9die' },
                { label: 'The size of Wikipedia, by the numbers (The Signpost)', url: 'https://signpost.news/2021-12-28/By_the_numbers' },
                { label: 'Kiwix, the offline reader', url: 'https://en.wikipedia.org/wiki/Kiwix' }
            ]
        },
        {
            id: 'wd40', emoji: '🛢️', dims: { need: 5, copy: 3, trust: 9, ripple: 4 }, sweet: 'w9',
            name: 'WD-40', sub: 'One 400 ml can · 350 g',
            tagline: 'You’ve used it. You’ve never wondered what it is.',
            briefing: 'Water Displacement, 40th attempt: the company says the name comes from a chemist’s lab book. It was developed in 1953 in a small San Diego lab to protect the skin of the Atlas missile from rust. It creeps into tiny gaps, pushes out water, frees seized parts and leaves a thin protective film. The exact proportions are secret, but the safety data sheet lists mostly aliphatic hydrocarbons and a petroleum base oil, with carbon dioxide as the propellant.',
            hint: 'Find the age that had a lot of rust and the first cheap petroleum.',
            tags: ['Best first five minutes', 'Single copy'],
            best: {
                year: 1862, place: 'The oil region of Pennsylvania',
                beats: [
                    ['Arrival', '1862, three years after Drake drilled the first oil well near Titusville. Refiners boil crude oil to make kerosene for lamps, and the lightest fraction, naphtha, is a dangerous embarrassment that is often burned off or dumped. Meanwhile every railway shop, mill and gun is seizing up with rust and gummy tallow; the lubricants on offer are still mostly animal and vegetable oils, with petroleum ones only just appearing.'],
                    ['The move', 'You don’t sell a can; you stage a show. A rusted bolt on a locomotive that three men couldn’t shift turns in seconds. Then you tell the refiners the thing no one knows: blend the waste with a heavier lubricating oil and sell it as a penetrating, water-driving product. The aerosol can is decades away (the Norwegian Erik Rotheim filed for the principle in the 1920s, with a US patent granted in 1931), but the idea of the mix doesn’t need pressure.'],
                    ['The ripple', 'A decade or two sooner for penetrating oils, and less downtime for railways and mills. This is a win in maintenance, not in invention, and you shouldn’t pretend otherwise. But the demonstration buys you something the others can’t: instant credibility with every engineer in the room, in the time it takes to spray a bolt. No other object on this list has more trust per gram.'],
                    ['The catch', 'You can’t copy the can: the pressurised aerosol and its valve belong to the twentieth century. The can covers about one locomotive’s worth of seized parts, and the contents are very flammable (lighting the spray makes a short blowtorch; don’t). And 3-in-One oil is only thirty-odd years away: you are early to a market that was about to appear on its own.']
                ]
            },
            early: 'Before petroleum refining (kerosene arrives in the 1850s), nobody can make anything like it. The can frees a lock or two in a kingdom’s worth of rust and is then empty.',
            late: 'After 1894 you can buy 3-in-One oil, and after 1958 you can buy WD-40. The can is a convenience, not a miracle.',
            alt: {
                w8: { mult: 0.62, text: 'The steam age is just beginning and rust is everywhere, but refined petroleum is decades away for most of this window: engineers lubricate with whale oil, lard and tallow. You earn real goodwill from the first railway mechanics by unsticking a locomotive, and the can runs out within the month.' }
            },
            verdict: 'The honest verdict: a wonderful supporting character and a poor lead. Trust {trust} is the joint-highest on my list: nothing wins a room faster than a seized bolt turning in seconds. But the contents can’t be reproduced (Copy {copy}) and the benefit is maintenance, not invention (Ripple {ripple}). The blind raters were harsher than I was: their average put it last.',
            sources: [
                { label: 'WD-40 Company history', url: 'https://wd40company.com/our-company/our-history/' },
                { label: 'WD-40 safety data sheet (aerosol)', url: 'https://files.wd40.com/pdf/WD-40+Aerosol+CAN+GHS+SDS+(Button+Top)+(11-21-19).pdf' },
                { label: 'Early petroleum refining (Penn State)', url: 'https://courses.ems.psu.edu/fsc432/book/export/html/755' },
                { label: 'Erik Rotheim and the aerosol', url: 'https://en.wikipedia.org/wiki/Erik_Rotheim' }
            ]
        },
        {
            id: 'antibiotics', emoji: '💊', dims: { need: 8, copy: 1, trust: 6, ripple: 3 }, sweet: 'w2',
            name: 'A broad-spectrum antibiotic course', sub: 'One ten-day course · 20 g',
            tagline: 'A life. Maybe a king’s.',
            briefing: 'One course cures many bacterial infections that killed kings and commoners alike for all of history: wound infections, pneumonia, typhoid. It is the miracle people expect to bring, and it saves exactly one person.',
            hint: 'If you could save one person in history, whose death changed the most?',
            tags: ['Highest variance'],
            best: {
                year: -323, place: 'Babylon',
                beats: [
                    ['Arrival', 'Babylon, June 323 BCE. Alexander the Great, 32, has been feverish for ten days or more after a banquet. The cause of his death is still debated (typhoid, malaria, West Nile virus and pancreatitis are all argued over), and the doctors can do little.'],
                    ['The move', 'You can’t diagnose him, and you don’t need to. You get past the bodyguards, persuade his physicians and give him a broad-spectrum course. If the infection is bacterial, a typhoid-like illness is just the kind of thing it cures.'],
                    ['The ripple', 'An empire stretching from Greece to India, with no capable adult heir (a half-brother judged unfit, and Roxana pregnant), keeps its ruler for perhaps twenty or thirty more years. The Wars of the Diadochi (conventionally 323–281 BCE) may not happen, or happen later, and plans reported in the ancient sources, an Arabian campaign among them, go ahead. The size of the change is enormous; whether it is good is not for anyone to say. He was also a conqueror whose campaigns cost a great many lives.'],
                    ['The catch', 'One course, one patient, a contested diagnosis. If he had malaria or West Nile, you’ve saved nothing. Antibiotics don’t scale: you can’t make more, and no one else can. This is the highest-variance pick on the list, and the only one where you cannot be sure the outcome is an improvement.']
                ]
            },
            early: 'In a world of bands and campfires, one infection is one friend. You save the person beside you, which matters entirely to them, and doesn’t show up in history.',
            late: 'Pick any moment from 500 to 1900: Mozart at 35, Keats at 25, Chopin at 39. Each is one life, and you can’t make a second course. For some of them (Keats, and probably Chopin, who are usually said to have died of tuberculosis) a ten-day course would not have been enough.',
            verdict: 'High Need ({need}), almost no Copy ({copy}) and little Ripple ({ripple}): a single dose can’t become a system. It lands low for the same reason the e-reader does: miracle objects that can’t be copied are impressive, not transformative. All three raters would have landed it in the Victorian age rather than in Babylon.',
            sources: [
                { label: 'Marr and Calisher, Alexander the Great and West Nile virus (CDC)', url: 'https://stacks.cdc.gov/view/cdc/14327/cdc_14327_DS1.pdf' },
                { label: 'Death of Alexander the Great', url: 'https://en.wikipedia.org/wiki/Death_of_Alexander_the_Great' },
                { label: 'Wars of the Diadochi', url: 'https://en.wikipedia.org/wiki/Wars_of_the_Diadochi' },
                { label: 'Roxana (Britannica)', url: 'https://www.britannica.com/biography/Roxana' }
            ]
        },
        {
            id: 'coffee', emoji: '☕', dims: { need: 3, copy: 3, trust: 6, ripple: 5 }, sweet: 'w5',
            name: 'A kilo of green coffee beans', sub: '1 kg and a hand grinder',
            tagline: 'Was the Enlightenment a caffeine side-effect?',
            briefing: 'Medieval and early-modern Europe drank a lot of weak beer and watered wine, and the popular story says water was too dangerous to drink (historians doubt this). Coffee and tea arrived in the seventeenth century, swapping alcohol for caffeine. Writers such as Tom Standage argue this helped power the age of reason, a thesis that is contested. The coffeehouses were nicknamed “penny universities”, a traditional label, and Lloyd’s of London began in one.',
            hint: 'The plant can’t grow in Europe. Where did the trade routes meet?',
            tags: ['Speculative'],
            best: {
                year: 1480, place: 'Venice',
                beats: [
                    ['Arrival', 'Venice, 1480, the hub of European trade with the Mamluk Sultanate of Egypt. Sufis in Yemen have been drinking coffee for a few decades, and the wider Islamic world is only beginning to hear of it; Europe has not. In Venice, as across Europe, the day’s drink is wine or small beer.'],
                    ['The move', 'You roast a handful on a merchant’s fire and grind it by hand. A bitter, hot drink that makes a man alert by evening. The merchants have the capital and the ships; you tell them where the plant grows.'],
                    ['The ripple', 'Coffeehouses appear about 165 to 170 years early (London’s first, in 1652, is well documented; the usual date for Venice is 1645). The sober, caffeinated clerk is a plausible engine of the Enlightenment, and news, insurance and science all lived in the café. This is the theory; it’s fashionable and contested.'],
                    ['The catch', 'The weakest causal chain here. Coffee is a tropical plant, so you can’t grow it in Europe; the whole thing depends on a long trade chain and on a weakly evidenced theory. And one kilo lasts a few weeks. You would be a trendsetter, not a revolution.']
                ]
            },
            early: 'There is no reliable record of anyone drinking coffee before the 1400s. A kilo of beans in ancient Greece is a bitter mystery, and you are the only person who knows to roast them.',
            late: 'By the 1650s London has its first coffeehouse, and the café culture that later writers tie to the Enlightenment is taking shape. You are late to the party.',
            verdict: 'The fun one, scored without sentiment: low Need ({need}), a plant that can’t be grown at home (Copy {copy}), and a theory about the Enlightenment that historians dispute. Trust {trust} because a good drink sells itself. It is on the list because it is the strangest plausible lever, not because it is a good one.',
            sources: [
                { label: 'The lost world of the London coffeehouse (Public Domain Review)', url: 'https://publicdomainreview.org/essay/the-lost-world-of-the-london-coffeehouse/' },
                { label: 'Cowan, The Social Life of Coffee (Yale University Press)', url: 'https://www.jstor.org/stable/j.ctt1npc0p' },
                { label: 'The coffee route from Yemen to London (Muslim Heritage)', url: 'https://muslimheritage.com/coffee-route-yemen-london/' },
                { label: 'Dispelling some myths: dirty water and beer (Tastes of History)', url: 'https://www.tastesofhistory.co.uk/post/dispelling-some-myths-dirty-water-drink-beer' }
            ]
        },
        {
            id: 'magnets', emoji: '🧲', dims: { need: 3, copy: 2, trust: 8, ripple: 4 }, sweet: 'w6',
            name: 'Neodymium magnets', sub: 'Six N52 discs · 100 g',
            tagline: 'The party trick that beat the philosopher.',
            briefing: 'Neodymium magnets, invented independently by General Motors and Sumitomo in 1982, are the strongest commercially available permanent magnets: a coin-sized one will lift many kilos. In 1600 the strongest magnet anyone had was a lump of naturally magnetised lodestone.',
            hint: 'Find the man who wrote the book on magnets.',
            tags: ['Wow factor'],
            best: {
                year: 1600, place: 'London, England',
                beats: [
                    ['Arrival', 'England, 1600. William Gilbert, a leading London physician and soon to be physician to Queen Elizabeth, has just published De Magnete, which argues that the Earth itself is a giant magnet. His experiments use lodestones shaped into balls (terrellae).'],
                    ['The move', 'You give him six discs that grip far harder than any lodestone. He can build a better terrella, test how the needle dips, and see what heat does to magnetism, with far cleaner results.'],
                    ['The ripple', 'A better magnet makes better experiments, and the principle that the Earth is magnetic is firmed up. But electromagnetism needs a current source (Volta’s battery, 1800), so you speed up a science whose next step is two centuries away. Delightful; limited.'],
                    ['The catch', 'Neodymium magnets are brittle, corrode in damp air unless coated, can’t be copied (rare-earth refining only begins around 1800, and neodymium itself was separated from didymium only in 1885), and can pinch fingers badly. And in 1600 a magnet that grips iron through a table is a miracle that could get you accused of sorcery.']
                ]
            },
            early: 'Before magnetism is understood as a force, a super-magnet is taken for sorcery, and nobody has the context to be impressed in a useful way.',
            late: 'After the electromagnets of the 1820s and 1830s (Sturgeon, Henry), a permanent magnet is no longer the strongest thing on the bench, and yours is a very strong toy.',
            verdict: 'Sells itself in a minute (Trust {trust}) and nothing else. Copy {copy}: it needs rare-earth refining, two centuries after the era. Ripple {ripple}: the science that matters is gated by something else, a current source. Everything about it is dazzling and shallow.',
            sources: [
                { label: 'The men who made the magnet that made the modern world (IEEE Spectrum)', url: 'https://spectrum.ieee.org/the-men-who-made-the-magnet-that-made-the-modern-world' },
                { label: 'Masato Sagawa (Honda Foundation)', url: 'https://www.hondafoundation.jp/commemoration/index_en/285/year:2023' },
                { label: 'S. P. Thompson, Gilbert of Colchester (Project Gutenberg)', url: 'https://www.gutenberg.org/ebooks/45893' },
                { label: 'Gilbert’s De Magnete (NASA)', url: 'https://pwg.gsfc.nasa.gov/earthmag/demagrev.htm' }
            ]
        },
        {
            id: 'gold', emoji: '🪙', dims: { need: 4, copy: 1, trust: 7, ripple: 3 }, sweet: 'w5',
            name: 'A kilo of gold', sub: 'One bar',
            tagline: 'The oldest cheat code.',
            briefing: 'Gold is the only item here that works in every century. It is also the only one whose power depends entirely on who holds it, and money cannot buy what does not exist yet. Carrying a fortune into a world without police is how time travellers end up in ditches.',
            hint: 'Where did a great invention stall for lack of money?',
            tags: ['The obvious one'],
            best: {
                year: 1450, place: 'Mainz, Germany',
                beats: [
                    ['Arrival', 'Mainz, 1450. Johannes Gutenberg has a press, a punch-cutter’s skill and an idea, and no money. He gets 800 guilders from the financier Johann Fust in 1450 and another 800 in 1452. In 1455 Fust sues, wins, and takes the type and at least some of the equipment.'],
                    ['The move', 'A kilo of gold covers roughly half of that first sum. You quietly lend it to Gutenberg without interest, or go into partnership with him, and his press survives the lawsuit.'],
                    ['The ripple', 'Gutenberg is spared ruin and prints with more freedom. But printing may well have happened anyway, and it spread in part because Mainz was sacked in 1462 and its printers scattered; by 1500, roughly 250 towns had presses (counts range from about 200 to 282). The real beneficiary is one man.'],
                    ['The catch', 'Gold’s value depends on era and danger: arriving with a kilo is arriving with a considerable fortune, which attracts murder and the attention of the Archbishop’s men. And the most important lesson: money cannot buy what doesn’t exist yet.']
                ]
            },
            early: 'In 9500 BCE gold is a shiny stone. In the ancient world, wealth is plentiful and capital is rarely the bottleneck; you would be rich in a world where being rich fixes little.',
            late: 'From the 1500s American silver, and some gold, floods Europe and inflation shrinks your kilo. By 1900 it buys a year or two of a labourer’s wages.',
            verdict: 'A wish, not a plan. Gold works in every century and changes nothing in any of them: Trust {trust}, Copy {copy}. Capital is rarely the bottleneck of history; belief, skill and readiness are. It ranks near the bottom because the money has no idea what to buy.',
            sources: [
                { label: 'Johann Fust (Britannica)', url: 'https://www.britannica.com/biography/Johann-Fust' },
                { label: 'The Helmasperger notarial instrument (Britannica)', url: 'https://www.britannica.com/topic/Helmaspergersches-Notariatsinstrument' },
                { label: 'The Rhenish gulden', url: 'https://en.wikipedia.org/wiki/Rhenish_gulden' },
                { label: '282 cities with presses by 1500 (History of Information)', url: 'https://historyofinformation.com/detail.php?id=27' }
            ]
        },
        {
            id: 'lighters', emoji: '🔥', dims: { need: 3, copy: 1, trust: 8, ripple: 1 }, sweet: 'w8',
            name: 'A box of BIC lighters', sub: 'Fifty lighters · 1 kg',
            tagline: 'Fire in a flick. Every film’s first pick.',
            briefing: 'Each disposable lighter lights thousands of times, by the maker’s claim. Humans have made fire for hundreds of thousands of years. The question is whether one more way of doing it matters.',
            hint: 'Where is fire hardest to make, and does it matter?',
            tags: ['The obvious one'],
            best: {
                year: 1812, place: 'The Smolensk road, Russia',
                beats: [
                    ['Arrival', 'November 1812, the Grande Armée’s retreat from Moscow. Temperatures fall well below freezing (around −15 °C by 9 November, colder later). Men die of cold, hunger, disease and Cossack attacks, and wet wood, snow and numb fingers make lighting a camp-fire with flint and steel a slow, desperate task.'],
                    ['The move', 'You give lighters to squad leaders. A fire in a flick: the same fuel, lit in seconds instead of minutes.'],
                    ['The ripple', 'A few more bivouac fires get lit in time, and a few thousand more men survive a night. It is a gift, and it is also tiny against the scale: an army of about 100,000 to 115,000 when it left Moscow loses most of its men. Warmth was never mainly a lighting problem. It was food, shelter and boots.'],
                    ['The catch', 'BIC says its lighters use isobutane, which boils at about −12 °C, so in deep cold they struggle to light unless you warm them in a pocket. The gift is most unreliable at the exact moment it is needed. The lighters also run out, and they cannot be copied.']
                ]
            },
            early: 'Fire is not scarce in any century: every household can make it, and in the earliest eras the people who matter are masters of it. You would be a person with a trick, and perhaps a person who gets burned.',
            late: 'After John Walker’s friction match (1826) and the safety match (1850s), matches spread through the nineteenth century; the disposable lighter itself is a twentieth-century product. The novelty is gone and so is the edge.',
            verdict: 'The film-prop pick: low Need ({need}, since people have always made fire), Copy {copy}, Ripple {ripple}. It scores {trust} on Trust only because a flame from nothing is theatre. The last place isn’t an insult but a lesson: the first thing you think of is the thing the era already has.',
            sources: [
                { label: 'John Walker and the friction match: a timeline (Phillumeny)', url: 'https://phillumeny.com/johnwalker/on-line-exhibit-timeline/' },
                { label: '1812: the bitter end (HistoryNet)', url: 'https://historynet.com/1812-bitter-end/' },
                { label: 'Napoleon’s Russian campaign: the retreat (Fondation Napoléon)', url: 'https://www.napoleon.org/en/history-of-the-two-empires/timelines/napoleons-russian-campaign-the-retreat/' },
                { label: 'The Battle of Berezina', url: 'https://en.wikipedia.org/wiki/Battle_of_Berezina' }
            ]
        }
    ];

    // Hand-picked headline badges for the ranking page. `note` may use {tokens}.
    const AWARDS = [
        { icon: '🌱', itemId: 'potato', en: ['Does the most while you sleep', 'Copy {copy}: ten tubers become a million.'] },
        { icon: '⚖️', itemId: 'ors', en: ['Best gram for gram', 'About 20 g of salts to a litre, then a recipe anyone can follow.'] },
        { icon: '📚', itemId: 'stamps', en: ['Biggest ripple', 'The highest Ripple on the list: {ripple}.'] },
        { icon: '⏱️', itemId: 'wd40', en: ['Best first five minutes', 'Trust {trust}: a seized bolt turns and a room believes you.'] },
        { icon: '📉', itemId: 'ereader', en: ['Most overrated', 'Every blind rater named it. Its Copy is {copy}.'] },
        { icon: '🎲', itemId: 'antibiotics', en: ['Highest variance', 'One life, and you can’t see which way it cuts.'] }
    ];

    // Three independent raters (separate model contexts that were given only a
    // neutral one-line description of each object, the nine landing windows and
    // the four dimension definitions, and were told not to read any files). Their
    // raw answers, unedited. Stances differ on purpose: A neutral, B a sceptical
    // economic historian, C a historian of science and medicine.
    const RATERS = [
        { id: 'A', stance: 'neutral', scores: {
            potato: { window: 'w4', need: 8, copy: 9, trust: 5, ripple: 7 },
            ors: { window: 'w8', need: 9, copy: 8, trust: 6, ripple: 3 },
            stamps: { window: 'w4', need: 7, copy: 7, trust: 6, ripple: 9 },
            sliderule: { window: 'w6', need: 4, copy: 6, trust: 6, ripple: 5 },
            glasses: { window: 'w2', need: 7, copy: 4, trust: 9, ripple: 6 },
            vitc: { window: 'w5', need: 6, copy: 5, trust: 6, ripple: 4 },
            manual: { window: 'w6', need: 8, copy: 7, trust: 4, ripple: 9 },
            ether: { window: 'w6', need: 8, copy: 8, trust: 8, ripple: 7 },
            chlorine: { window: 'w8', need: 8, copy: 6, trust: 4, ripple: 6 },
            compass: { window: 'w2', need: 5, copy: 7, trust: 7, ripple: 6 },
            foldscope: { window: 'w5', need: 7, copy: 5, trust: 5, ripple: 9 },
            bednet: { window: 'w2', need: 8, copy: 4, trust: 6, ripple: 3 },
            watch: { window: 'w7', need: 6, copy: 1, trust: 7, ripple: 3 },
            ereader: { window: 'w7', need: 7, copy: 3, trust: 4, ripple: 8 },
            wd40: { window: 'w9', need: 2, copy: 1, trust: 6, ripple: 1 },
            antibiotics: { window: 'w9', need: 8, copy: 1, trust: 8, ripple: 4 },
            coffee: { window: 'w4', need: 1, copy: 3, trust: 6, ripple: 3 },
            magnets: { window: 'w7', need: 2, copy: 1, trust: 7, ripple: 4 },
            gold: { window: 'w5', need: 2, copy: 0, trust: 10, ripple: 3 },
            lighters: { window: 'w2', need: 2, copy: 0, trust: 9, ripple: 1 }
        } },
        { id: 'B', stance: 'sceptical economic historian', scores: {
            potato: { window: 'w4', need: 9, copy: 9, trust: 5, ripple: 8 },
            ors: { window: 'w8', need: 9, copy: 9, trust: 7, ripple: 5 },
            stamps: { window: 'w4', need: 7, copy: 8, trust: 5, ripple: 9 },
            sliderule: { window: 'w6', need: 3, copy: 5, trust: 5, ripple: 4 },
            glasses: { window: 'w2', need: 6, copy: 5, trust: 9, ripple: 6 },
            vitc: { window: 'w5', need: 5, copy: 8, trust: 7, ripple: 4 },
            manual: { window: 'w6', need: 8, copy: 8, trust: 4, ripple: 8 },
            ether: { window: 'w7', need: 7, copy: 8, trust: 8, ripple: 6 },
            chlorine: { window: 'w8', need: 9, copy: 6, trust: 4, ripple: 7 },
            compass: { window: 'w2', need: 4, copy: 9, trust: 7, ripple: 5 },
            foldscope: { window: 'w5', need: 5, copy: 5, trust: 7, ripple: 6 },
            bednet: { window: 'w2', need: 8, copy: 7, trust: 5, ripple: 5 },
            watch: { window: 'w7', need: 4, copy: 1, trust: 4, ripple: 2 },
            ereader: { window: 'w7', need: 6, copy: 2, trust: 5, ripple: 6 },
            wd40: { window: 'w9', need: 2, copy: 3, trust: 8, ripple: 1 },
            antibiotics: { window: 'w9', need: 7, copy: 1, trust: 8, ripple: 3 },
            coffee: { window: 'w3', need: 2, copy: 4, trust: 7, ripple: 3 },
            magnets: { window: 'w7', need: 2, copy: 0, trust: 6, ripple: 4 },
            gold: { window: 'w5', need: 1, copy: 0, trust: 10, ripple: 2 },
            lighters: { window: 'w2', need: 2, copy: 1, trust: 9, ripple: 1 }
        } },
        { id: 'C', stance: 'historian of science and medicine', scores: {
            potato: { window: 'w4', need: 8, copy: 9, trust: 4, ripple: 7 },
            ors: { window: 'w8', need: 9, copy: 7, trust: 6, ripple: 4 },
            stamps: { window: 'w3', need: 7, copy: 6, trust: 5, ripple: 9 },
            sliderule: { window: 'w6', need: 3, copy: 4, trust: 5, ripple: 5 },
            glasses: { window: 'w2', need: 6, copy: 5, trust: 9, ripple: 7 },
            vitc: { window: 'w5', need: 6, copy: 5, trust: 7, ripple: 3 },
            manual: { window: 'w6', need: 8, copy: 6, trust: 4, ripple: 9 },
            ether: { window: 'w4', need: 7, copy: 7, trust: 7, ripple: 6 },
            chlorine: { window: 'w8', need: 8, copy: 3, trust: 5, ripple: 5 },
            compass: { window: 'w2', need: 5, copy: 8, trust: 7, ripple: 6 },
            foldscope: { window: 'w4', need: 7, copy: 4, trust: 6, ripple: 9 },
            bednet: { window: 'w2', need: 8, copy: 5, trust: 4, ripple: 4 },
            watch: { window: 'w7', need: 6, copy: 1, trust: 6, ripple: 3 },
            ereader: { window: 'w6', need: 8, copy: 2, trust: 4, ripple: 8 },
            wd40: { window: 'w9', need: 2, copy: 0, trust: 5, ripple: 1 },
            antibiotics: { window: 'w9', need: 8, copy: 1, trust: 8, ripple: 4 },
            coffee: { window: 'w3', need: 1, copy: 3, trust: 7, ripple: 3 },
            magnets: { window: 'w7', need: 3, copy: 1, trust: 7, ripple: 6 },
            gold: { window: 'w5', need: 2, copy: 0, trust: 10, ripple: 3 },
            lighters: { window: 'w2', need: 1, copy: 0, trust: 9, ripple: 1 }
        } }
    ];

    const SENS = { draws: 5000, seed: 40 };

    global.TIME_CARGO = { WEIGHTS, FALLOFF, DIMS, ERAS, ITEMS, AWARDS, RATERS, LANDMARKS, MANIFEST_ORDER, SENS, copy: {} };
}(typeof window !== 'undefined' ? window : globalThis));

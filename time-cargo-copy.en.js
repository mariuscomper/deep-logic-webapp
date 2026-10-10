/*
 * English interface copy for time-cargo.html. Strings with {tokens} are filled
 * from the model at render time, so no figure about the ranking is typed here.
 */
(function (global) {
    'use strict';
    const T = global.TIME_CARGO;

    T.copy.en = {
        lang: 'en',
        locale: 'en-GB',
        brand: 'What to take back',
        title: 'What to take back in time: 20 objects and the era where each does the most good',
        ogLine: '{n} objects · {m} eras · the ranking tested against {r} raters',
        ogAlt: 'A grid of twenty objects by nine eras, each cell coloured by how much good that landing does.',
        description: 'Take one object back in time and pick where it lands: WD-40, potatoes, a slide rule, reading glasses and 16 more, ranked on need, copyability, trust and ripple, then re-scored by three blind raters.',
        kicker: 'A thought experiment · 9500 BCE to 1914',
        h1: 'Twenty things to take back in time, and the era where each does the most good',
        deck: 'You can carry one object through time. Choose it, choose the era where it lands, and see how much good it does there. Then see how I ranked all twenty, and where three raters who never saw my scores disagreed with me.',
        ctaChoose: 'Choose what to carry',
        ctaRank: 'Read the ranking first',
        nav: { choose: 'Choose', ranking: 'Ranking', method: 'Method' },
        navAria: 'Sections',
        themeToLight: 'Switch to the light theme',
        themeToDark: 'Switch to the dark theme',
        langAria: 'Language',
        toTop: 'Top',
        toTopLabel: 'Back to the top',
        skip: 'Skip to the content',
        suggest: { for: 'ro', text: 'Această pagină există și în română.', open: 'Deschide în română', dismiss: 'Închide' },

        dims: {
            need: ['Need', 'How big and how old is the problem?'],
            copy: ['Copy', 'Can the era keep going without you?'],
            trust: ['Trust', 'Will people try it rather than punish you?'],
            ripple: ['Ripple', 'What does it unlock beyond the first use?']
        },

        eras: {
            w1: { name: 'Before the farms', span: 'about 9500 BCE', place: 'The Fertile Crescent', crisis: 'Hunter-gatherers are a few generations from inventing farming. Nothing is written, nothing is stored, nobody has a king.' },
            w2: { name: 'The Classical world', span: '330 BCE – 180 CE', place: 'Alexandria, Babylon, Rome', crisis: 'Glass, concrete, roads and law. But no spectacles, no germ theory, and winter closes the sea.' },
            w3: { name: 'Caliphates and castles', span: '500 – 1100', place: 'Baghdad, Córdoba, Persia, the Frankish lands', crisis: 'Paper has just arrived from China. Baghdad translates the world; Europe loses its roads. Scholars with few instruments.' },
            w4: { name: 'The High Middle Ages', span: '1100 – 1347', place: 'Paris, Bologna, Flanders, Florence', crisis: 'Universities, cathedrals, crowded cities, and a food supply with no margin for a bad summer.' },
            w5: { name: 'Plague and Renaissance', span: '1347 – 1500', place: 'Venice, Mainz, Lisbon', crisis: 'A third or more of Europe buried, then rebuilt. Presses, Atlantic ships, banking houses, and nobody knows what scurvy is.' },
            w6: { name: 'The Scientific Revolution', span: '1500 – 1700', place: 'Prague, London, Padua', crisis: 'Kepler, Galileo, Newton, the Royal Society. Genius held back by arithmetic and by instruments.' },
            w7: { name: 'Enlightenment and sail', span: '1700 – 1789', place: 'Paris, London, the Western Approaches', crisis: 'Encyclopaedias and empires. Whole fleets are lost to bad charts and worse clocks.' },
            w8: { name: 'Revolutions and Napoleon', span: '1789 – 1850', place: 'Europe, battlefields, new industrial towns', crisis: 'Steam, cholera, and surgery done in seconds, fully awake. Cities outgrow their sewers.' },
            w9: { name: 'The Victorian machine age', span: '1850 – 1914', place: 'Britain, the oil regions, the railways', crisis: 'Railways, kerosene, rust everywhere, and germ theory fighting for acceptance against “bad air”.' }
        },

        terrain: {
            title: 'Delta by object and era',
            aria: 'Heat map of {n} objects against {m} eras. Each cell is the Delta, from 0 to 100, of landing that object in that era. A row gets its name when you land that object.',
            ariaAll: 'Heat map of {n} objects against {m} eras. Each cell is the Delta, from 0 to 100, of landing that object in that era.',
            low: 'little good',
            high: 'a lot of good',
            statusStart: 'Rows are objects, columns are eras, and brighter means more good. A row is named when you land it.',
            status: '{n} of {total} landings explored',
            statusAll: 'All {total} landings shown',
            tipHidden: '{item} · {era}: not explored yet',
            tipUnknownRow: '{era}: this object stays unnamed until you land it',
            tipShown: '{item} · {era}: Delta {delta}',
            clear: '↺ Clear my landings'
        },

        choose: {
            h: 'Choose the one object you carry',
            p: 'Twenty objects, each small enough for a bag. You get one. Pick the one you think would change the most, then decide where in history to land it. Each landing is scored from 0 to 100; I call the score Delta.',
            delta: 'Delta {n}',
            doneAria: 'You have landed this object. Best Delta so far: {n}.'
        },

        brief: {
            back: '← Other objects',
            hintBtn: 'Need a hint?',
            eraH: 'Where in history does it land?',
            eraP: 'Nine windows of history, each with its own problem. The score depends on how well the object fits the problem.',
            go: 'Land here →',
            visited: 'Landed: Delta {n}'
        },

        warp: {
            label: 'Travelling through time',
            sub: 'Travelling to {place}',
            skip: 'Skip'
        },

        journey: {
            next: 'Continue',
            rest: 'Show the rest',
            leadNear: 'Close, but not the best landing.',
            leadMid: 'Off by an age.',
            leadFar: 'Wrong world.',
            tooEarly: 'You land too early.',
            tooLate: 'You land too late.',
            bestLand: 'This is the best landing for this object.',
            seeScore: 'See your score'
        },

        result: {
            of: 'out of {best} at this object’s best landing',
            verdict: { best: 'The best landing', near: 'A near miss', off: 'The wrong century', lost: 'The wrong world' },
            meterKey: 'The black line marks the best landing: {era}, {year}.',
            bestWas: 'The best landing for this object is {era}: {place}, {year}.',
            barsH: 'This object in every era',
            barsNote: 'Each bar is the Delta of landing in that window. Yours is outlined.',
            again: 'Try another era with this object',
            other: 'Choose another object',
            seeRank: 'See the full ranking',
            passH: 'Your boarding pass',
            shareLabel: 'Send it',
            whatsapp: 'Share on WhatsApp',
            facebook: 'Share on Facebook',
            x: 'Share on X',
            copy: 'Copy the link',
            save: 'Save the card as an image',
            nativeShare: 'Share the card',
            copied: 'Link copied.',
            saved: 'Card saved.',
            shareFailed: 'The card could not be shared, so the link was copied instead.',
            shareText: 'I took {item} back to {era} ({year}) and scored {n} out of 100. Where would you land it?'
        },

        pass: {
            head: 'BOARDING PASS · BACK IN TIME',
            carrying: 'CARRYING',
            landed: 'LANDED',
            delta: 'DELTA',
            best: 'Best possible: {n}',
            by: 'This object, by era'
        },

        ranking: {
            h: 'How I ranked all twenty',
            lockP: 'The ranking shows the best landing for every object, which gives away the answers. You can read it now, or after your first landing.',
            lockBtn: 'Show it anyway',
            findingH: 'What the ranking shows',
            f1: 'The objects that do the most good are the ones an era can copy, not the ones that impress it. Ordering the twenty by Copy alone reproduces the full ranking at ρ = {copyPull}. Ordering by Trust alone, which measures how fast people believe you, does not (ρ = {trustPull}).',
            f2: 'Three blind raters scored the same objects. Their rankings agree with mine at ρ = {rhoMin} to {rhoMax}. On their scores too, Copy tracks the ranking best (ρ = {panelCopy} on their average), and Trust moves against it (ρ = {panelTrust}).',
            f3: 'We agree on the ends: {topShared} are in both top threes, and the two lists share {bottomShared} of their bottom five. We differ most on {gaps}.',
            awardsH: 'Six superlatives',
            scorerLabel: 'Whose scores?',
            scorers: { mine: 'Mine', panel: 'Blind raters', all: 'All four' },
            scorerNote: {
                mine: 'My scores, written before the raters saw anything.',
                panel: 'The average of the three blind raters.',
                all: 'The average of my scores and the three raters’ scores, each counting once.'
            },
            rank: 'Rank',
            deltaLab: 'Delta',
            bestLanding: 'Best landing',
            dimsH: 'Scores',
            dimsNote: 'The bar is my score; the black line is the raters’ average.',
            whyH: 'Why it ranks here',
            panelH: 'What the raters said',
            panelRank: 'Rank on the raters’ average: {rank} of {total}.',
            panelWindows: 'Landing windows they chose: {w}.',
            flagRank: 'The raters and I are {n} places apart.',
            flagWindow: 'All three raters would land it in “{era}”, where I chose “{mine}”.',
            sourcesH: 'Sources',
            yours: 'You landed this object in {era}: Delta {n}.'
        },

        method: {
            h: 'How it was scored, and how far off it may be',
            deltaH: 'What Delta is',
            m1: 'Delta is a score from 0 to 100 for how much good an object does at its best landing. It combines four scores from 0 to 10, which I wrote: Need ({wNeed}%), Copy ({wCopy}%), Trust ({wTrust}%) and Ripple ({wRipple}%). I chose the weights too.',
            m2: 'Landing in another window multiplies the score by {f1} one window away, {f2} two away, {f3} three away and {f4} four or more away. Nine windows is coarse, so a few objects carry a hand-written exception where the neighbouring window is nearly as good.',
            t1H: 'Test 1: do the weights decide the result?',
            t1: 'I drew {draws} random sets of weights, each dimension anywhere from none of the total to all of it, and re-ranked the twenty objects every time. {first} comes first in {firstPct}% of draws. {robust} stay in the top five in at least {robustPct}% of draws. The middle of the list is soft: {soft}.',
            t1Cols: ['Object', 'Median rank', '5th to 95th percentile', 'In the top five'],
            t2H: 'Test 2: would someone else score them the same way?',
            t2: 'Three blind raters received a one-line description of each object, the nine landing windows and the four definitions, and nothing else. They scored all twenty and chose a landing window for each. I did not change any of my scores afterwards, so the gap between us stays visible.',
            t2Cols: ['Rater', 'Rank agreement with mine (ρ)', 'Average gap per score', 'Same window as mine'],
            t2Panel: 'Averaging the three raters gives a ranking that agrees with mine at ρ = {rhoPanel}. The largest gaps between my scores and theirs:',
            t2GapCols: ['Object', 'Score', 'Mine', 'Raters’ average'],
            limitsH: 'Limits',
            limits: 'The raters are language models, not a panel of historians, and they agree with each other (ρ = {rrMin} to {rrMax}) more than with me, so their agreement is a consistency check and not independent proof. The scores describe counterfactual history, which no data can settle. The rank correlation uses all twenty objects, so one or two moves change it a little.',
            failedH: 'What did not show up',
            failed: 'Two things I expected to find did not appear. Going further back does not help: across the twenty objects, the year of the best landing and the Delta are unrelated (ρ = {rhoYear}). And the objects that win a room fastest do not do the most good: Trust has almost no relation to Delta on my scores (ρ = {trustPull}) and a negative one on every rater’s.',
            dimCols: ['Dimension', 'Alone, versus the full ranking: mine', 'Raters’ average'],
            dimCaption: 'Rank correlation of each score, taken alone, with the full ranking.'
        },

        footer: {
            note: 'Dates and figures come from the sources linked under each object. The scores are judgements, and the page shows how they held up.',
            back: '← Back to the essay',
            licence: 'Released under the MIT licence.'
        },

        short: {
            potato: 'the potatoes', ors: 'the rehydration salts', stamps: 'the stamp set', sliderule: 'the slide rule',
            glasses: 'the reading glasses', vitc: 'vitamin C', manual: 'the paperback', ether: 'ether',
            chlorine: 'the water tablets', compass: 'the compass', foldscope: 'the Foldscope', bednet: 'the bed net',
            watch: 'the watch', ereader: 'the e-reader', wd40: 'WD-40', antibiotics: 'the antibiotics',
            coffee: 'the coffee beans', magnets: 'the magnets', gold: 'the gold', lighters: 'the lighters'
        },

        list: { and: ' and ', comma: ', ' }
    };
}(typeof window !== 'undefined' ? window : globalThis));

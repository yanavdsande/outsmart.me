// Shared word lists and scrambles for the anagram games.
//
// Each word has ONE fixed scramble, so every participant sees exactly the same
// problems. The scrambles were made once with scramble() below: random, but
// keeping no pair of letters that are neighbours in the word (in either order),
// or at most 1 pair where that is impossible (doctor, coffee, volleyball).
// The 5-letter scrambles also avoid the original list's fixed letter order.

// 5-letter words with their scrambles, in order from easier to harder
// (target % of people solving)
const WORDS_5 = [
  ['world', 'LWRDO'], ['wound', 'UWDON'], ['child', 'DHLCI'], ['count', 'TUCNO'], ['fight', 'FGTIH'],  // 100%
  ['brick', 'IKRCB'], ['trick', 'RCTKI'], ['light', 'ITGLH'], ['plant', 'LNPAT'], ['drink', 'NRKID'],  // 95%
  ['black', 'ABCLK'], ['truck', 'TCRKU'], ['clown', 'WLNCO'], ['house', 'UHSOE'], ['glory', 'GOYLR'],  // 90%
  ['front', 'OFTRN'], ['lunch', 'CLNHU'], ['group', 'OPRUG'], ['mouth', 'TOHUM'], ['crush', 'HRSCU'],  // 85%
  ['watch', 'AHTWC'], ['honey', 'OEHNY'], ['month', 'OTMHN'], ['thumb', 'BUTMH'], ['chair', 'CIHRA'],  // 80%
  ['fancy', 'CAYFN'], ['pitch', 'THICP'], ['thief', 'ETIFH'], ['crowd', 'DOCWR'], ['judge', 'UGJDE'],  // 75%
  ['grave', 'AGVRE'], ['doubt', 'DUTOB'], ['graph', 'PRHAG'], ['guard', 'RUDGA'], ['panic', 'CAIPN'],  // 70%
  ['fault', 'ALFTU'], ['style', 'SLTEY'], ['grief', 'IGFRE'], ['blade', 'LEABD'], ['cabin', 'NBCIA'],  // 65%
  ['logic', 'IOCGL'], ['blaze', 'LZBEA'], ['flame', 'AFMLE'], ['fruit', 'UFIRT'], ['mercy', 'MRYEC'],  // 60%
  ['virus', 'RSIUV'], ['index', 'XNEID'], ['knife', 'NFKIE'], ['album', 'UABML'], ['ankle', 'LNEAK'],  // 50%
];

// Longer words for "Anagrams letter amount". Common, concrete words, picked to
// avoid ones whose letters also spell another everyday word (e.g. silver/sliver).
// These have no difficulty norms; replace them with normed lists if you have them.
const LONGER_WORDS = {
  6: [
    ['pencil', 'ELNIPC'], ['rocket', 'ERCTKO'], ['window', 'IONWDW'], ['bridge', 'GIEBDR'],
    ['jungle', 'GEJNLU'], ['monkey', 'NMYKOE'], ['rabbit', 'AIRBTB'], ['summer', 'MRMSEU'],
    ['ticket', 'TTCEIK'], ['turkey', 'TERYKU'], ['wallet', 'LWEATL'], ['winter', 'RWTIEN'],
    ['yellow', 'EOYLWL'], ['doctor', 'CDTROO'], ['basket', 'ESTBKA'], ['candle', 'CDEALN'],
    ['pocket', 'KPCEOT'], ['butter', 'UEBTRT'], ['coffee', 'EOECFF'], ['kitten', 'TNIEKT'],
  ],
  7: [
    ['blanket', 'BENLKTA'], ['chicken', 'HKINCCE'], ['diamond', 'ODMINAD'], ['dolphin', 'NOHLIDP'],
    ['freedom', 'DFEMROE'], ['giraffe', 'FREIFGA'], ['harvest', 'SAVTRHE'], ['library', 'IYBALRR'],
    ['morning', 'NMNOIRG'], ['penguin', 'UNNPIGE'], ['picture', 'CEUPTRI'], ['pumpkin', 'UKNMIPP'],
    ['rainbow', 'BIOANRW'], ['village', 'GLVLEIA'], ['weather', 'EETRHWA'], ['cabbage', 'AAEBGCB'],
    ['cartoon', 'CTNROAO'], ['bicycle', 'YEILBCC'], ['balloon', 'OAOBLNL'], ['fortune', 'ONTEFUR'],
  ],
  8: [
    ['elephant', 'HENEAPTL'], ['mountain', 'UAMITONN'], ['hospital', 'OPHAISTL'], ['umbrella', 'MLULRAEB'],
    ['sandwich', 'NSWCDHIA'], ['keyboard', 'ODEABRKY'], ['dinosaur', 'ORDAISNU'], ['festival', 'VSLIFTAE'],
    ['squirrel', 'SEIQRURL'], ['airplane', 'AAERLIPN'], ['birthday', 'YRHABDTI'], ['building', 'IIBDGULN'],
    ['calendar', 'AANCRLDE'], ['children', 'CNHLEDIR'], ['computer', 'PECTROUM'], ['painting', 'IIGPNNAT'],
    ['shoulder', 'RUHLOESD'], ['treasure', 'UETARRSE'], ['vacation', 'NIAAOVCT'], ['football', 'FATLOLBO'],
  ],
  9: [
    ['chocolate', 'OOTCAHECL'], ['adventure', 'TAVUEEDNR'], ['butterfly', 'FYULTRTBE'], ['telephone', 'PNLTOEEEH'],
    ['president', 'IPEETSNDR'], ['newspaper', 'EESAWNPRP'], ['crocodile', 'OEIOLCCDR'], ['dangerous', 'AGRUDNOES'],
    ['furniture', 'UUNETRRFI'], ['important', 'MNPRIAOTT'], ['beautiful', 'LTAFBUUIE'], ['signature', 'UNITEAGSR'],
    ['astronaut', 'RSUOAATNT'], ['breakfast', 'ARABEFTKS'], ['celebrate', 'EEAERCTLB'], ['hamburger', 'AEHUGBRMR'],
    ['carpenter', 'AEECNRRTP'], ['pineapple', 'PEPEIALNP'], ['vegetable', 'EEEBTVGLA'], ['wonderful', 'EFLNRUWDO'],
  ],
  10: [
    ['strawberry', 'RSRBAYTEWR'], ['motorcycle', 'RLOCTMECOY'], ['basketball', 'LBBSTAKLEA'], ['restaurant', 'UEAASNRRTT'],
    ['playground', 'UGNOARPYDL'], ['helicopter', 'RLTHPIEOEC'], ['friendship', 'HFISINPRDE'], ['lighthouse', 'SHHLOEIUGT'],
    ['television', 'IEEITNSVOL'], ['photograph', 'RHATHGPPOO'], ['skateboard', 'EODAASTBRK'], ['toothbrush', 'TSOHOHRTBU'],
    ['chimpanzee', 'AIEPNMCEHZ'], ['microphone', 'OMHIPNREOC'], ['dictionary', 'DAIRNTOCYI'], ['volleyball', 'LLBOEAYLVL'],
    ['binoculars', 'AIUSLCROBN'], ['watermelon', 'MWNEALRTOE'], ['trampoline', 'TEMONALPIR'], ['university', 'IUIRTNESYV'],
  ],
};

// Count the neighbouring letters in a scramble that are also neighbours in
// the word (in either order), e.g. "OW" or "WO" for WORLD.
function keptPairs(scrambled, word) {
  const pairs = new Set();
  for (let i = 0; i < word.length - 1; i++) {
    pairs.add(word[i] + word[i + 1]);
    pairs.add(word[i + 1] + word[i]);
  }
  let kept = 0;
  for (let i = 0; i < scrambled.length - 1; i++) {
    if (pairs.has(scrambled[i] + scrambled[i + 1])) kept++;
  }
  return kept;
}

function shuffle(letters) {
  const result = letters.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A random scramble with no letter pairs kept from the word. Only when that is
// impossible (e.g. some words with repeated letters) is one kept pair allowed.
// Not used while the game runs: it's here to make scrambles for new words,
// e.g. type scramble('garden') in the browser console, then add the result above.
function scramble(word) {
  word = word.toUpperCase();
  let best = null;
  let bestKept = Infinity;
  for (let tries = 0; tries < 5000 && bestKept > 0; tries++) {
    const candidate = shuffle(word.split('')).join('');
    if (candidate === word) continue;
    const kept = keptPairs(candidate, word);
    if (kept < bestKept) {
      best = candidate;
      bestKept = kept;
    }
  }
  return best;
}

// One problem for the word game engine, from a [word, scramble] pair
function anagramProblem([word, scrambled]) {
  return { lines: [scrambled], answers: [word] };
}

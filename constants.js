
let postfixRegex = /www([0-9]+)\.hattrick\.org/g;

function getServerPostfix() {

  let postfixMatch = postfixRegex.exec( window.location.href );
  var postfix = undefined;
  if ( postfixMatch ) {
    postfix = postfixMatch[1];
  }

  return postfix;
}

SERVER_POSTFIX = getServerPostfix();
SERVER = 'https://www'.concat(SERVER_POSTFIX, '.hattrick.org');




var skillsView = {
  playmaking: ['age', 'playmaking', 'passing', 'defending', 'winger'],
  defending : ['age', 'defending', 'passing', 'playmaking', 'winger'],
};


let playerProperties = {
  'experience' : {
    regex: /Has ([a-z\s]+) experience/g,
    skill: false,
    numeric: false
  },
  'stamina'    : {
    regex: /Stamina:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'playmaking' : {
    regex: /Playmaking:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'winger'     : {
    regex: /Winger:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'scoring'    : {
    regex: /Scoring:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'keeper'     : {
    regex: /Keeper:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'passing'    : {
    regex: /Passing:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'defending'  : {
    regex: /Defending:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'set pieces' : {
    regex: /Set pieces:\s*([a-z\s]+\s)/g,
    skill: true,
    numeric: false
  },
  'specialty'  : {
    regex: /Specialty:\s*([a-zA-Z\s]+\s)/g,
    skill: false,
    numeric: false
  },
  'price'      : {
    regex: /([0-9\s]+)\sRupees/g,
    numeric: true,
    skill: false,
    modifier: ( value ) => {
      return value * 0.025; // Rupees to euro
    }
  },
  'tsi'        : {
    regex: /TSI:\s+([0-9\s]+)/g,
    skill: false,
    numeric: true
  }
};

let propertiesValues = {
  // skills
  'divine'            : 20,
  'utopian'           : 19,
  'magical'           : 18,
  'mythical'          : 17,
  'extra-terrestrial' : 16,
  'titanic'           : 15,
  'supernatural'      : 14,
  'world class'       : 13,
  'magnificent'       : 12,
  'brilliant'         : 11,
  'outstanding'       : 10,
  'formidable'        : 9,
  'excellent'         : 8,
  'solid'             : 7,
  'passable'          : 6,
  'inadequate'        : 5,
  'weak'              : 0,
  'poor'              : 0,
  'wretched'          : 0,
  'disastrous'        : 0,
  'non-existent'      : 0,
  // specialties
  'Technical'     : 5,
  'Quick'         : 4,
  'Head'          : 3,
  'Powerful'      : 2,
  'Unpredictable' : 1,
  'Regainer'      : 0
};

let playerIdRegex = /playerId=([0-9]+)/g;
let playerAgeRegex = /Age:\s+([0-9]{2}) years \(([0-9]{1,3}) days?\)/g;
let deadlineRegex = /Deadline:\s+([0-9]{2})-([0-9]{2})-([0-9]{4}) ([0-9]{2})\.([0-9]{2})/g;

var transferResultPage = /hattrick\.org\/World\/Transfers\/TransfersSearchResult\.aspx/g;

let hattrickDaysInYear = 112; // hattrick year in days



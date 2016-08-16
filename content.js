console.error('test content.js');

// CONSTANTS
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

let playerProperties = {
  'experience' : {
    regex: /Has ([a-z\s]+) experience/g,
    numeric: false
  },
  'stamina'    : {
    regex: /Stamina:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'playmaking' : {
    regex: /Playmaking:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'winger'     : {
    regex: /Winger:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'scoring'    : {
    regex: /Scoring:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'keeper'     : {
    regex: /Keeper:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'passing'    : {
    regex: /Passing:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'defending'  : {
    regex: /Defending:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'set pieces' : {
    regex: /Set pieces:\s*([a-z\s]+\s)/g,
    numeric: false
  },
  'specialty'  : {
    regex: /Specialty:\s*([a-zA-Z\s]+\s)/g,
    numeric: false
  },
  'price'      : {
    regex: /([0-9\s]+)\sRupees/g,
    numeric: true
  },
  'tsi'        : {
    regex: /TSI:\s+([0-9\s]+)/g,
    numeric: true
  }
};
let playerIdRegex = /playerId=([0-9]+)/g;
let playerAgeRegex = /Age:\s+([0-9]{2}) years \(([0-9]{2}) days\)/g;
let deadlineRegex = /Deadline:\s+([0-9]{2})-([0-9]{2})-([0-9]{4}) ([0-9]{2})\.([0-9]{2})/g;

var transferSearchPage = /hattrick\.org\/World\/Transfers\/$/g
var transferResultPage = /hattrick\.org\/World\/Transfers\/TransfersSearchResult\.aspx/g;

let hattrickDaysInYear = 112; // hattrick year in days

// FUNCTIONS

function execRegex ( regex, text ){
  let result = regex.exec( text);
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  regex.exec( text );
  return result;
}

function getPlayerId( transferPlayerInfo ) {

  let playerIdMatch = execRegex( playerIdRegex, transferPlayerInfo.outerHTML );
  var playerid = undefined;
  if ( playerIdMatch ) {
    playerid = playerIdMatch[1];
  }

  return playerid;
}

function getPlayerAge( transferPlayerInfo ) {

  let ageMatch = execRegex( playerAgeRegex, transferPlayerInfo.outerText );
  var age = undefined;
  if ( ageMatch ) {
    age = +(Number(ageMatch[1]) + Number(ageMatch[2])/hattrickDaysInYear).toFixed(2);
  }

  return age;
}

function getDeadline( transferPlayerInfo ) {

  let deadlineMatch = execRegex( deadlineRegex, transferPlayerInfo.outerText );
  var deadline = undefined;
  if ( deadlineMatch ) {
    deadline = new Date (deadlineMatch[3].concat('-', deadlineMatch[2], '-', deadlineMatch[1], 'T',
                         deadlineMatch[4], ':', deadlineMatch[5], ':00'));
  }

  return deadline;
}

function getPlayerInfo( transferPlayerInfo ) {
  let playerProps = {};

  for (var property in playerProperties) {
    let matchingRegex = execRegex( playerProperties[property].regex, transferPlayerInfo.outerText );
    if ( matchingRegex ) {
      if ( playerProperties[property].numeric ) {
        value = Number(matchingRegex[1].replace(/\s/g, ''));
      } else {
        value = matchingRegex[1].replace(/^\s/g, '').replace(/\s$/g, '');
        if ( value in propertiesValues ) {
          value = propertiesValues[value];
        } else {
          console.warn('value', value,'could not be translated into numeric, saving raw');
        }
      }
      playerProps[property] = value;
      //console.error(property, matchingRegex[1]);
    } else {
      //console.error('missing', property);
    }
  }

  return playerProps;
}

function setIndexFromValue( elementId, value, valueMapping ) {
  let element = document.getElementById( elementId );
  let optionsArray = Array.from(element.options);
  let index = optionsArray.findIndex( ( option ) => {
    if ( valueMapping ) {
      console.error('translating value', option.text.toLowerCase(), valueMapping[option.text.toLowerCase()], value);
      return valueMapping[option.text.toLowerCase()] === value;
    } else if ( isNaN(option.text) ) {
      console.error('lowercasing value', option.text.toLowerCase(), value);
      return option.text.toLowerCase() === value;
    } else {
      console.error('value', Number(option.text), value);
      return Number(option.text) === value;
    }
  });
  element.selectedIndex = index;
}

// MAIN

if ( transferSearchPage.exec(window.location.href) ) {
  var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

  // get requested searches
  searchesDb.allDocs({include_docs: true, limit: 1}).then( (searches) => {
    if ( searches.rows.length > 0 ) {
      let search = searches.rows[0].doc;
      console.error('doing search', search);
      searchesDb.remove( search._id, search._rev );

      delete search._id;
      delete search._rev;

      setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMin', search.age.min);
      setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMax', search.age.max);

      let counter = 1;
      for ( property in search )  {
        if (property !== 'age') {
          console.error('setting', property, search[property]);
          setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter), property);
          console.error('setting min', property, search[property]);
          setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Min'), search[property].min, propertiesValues);
          console.error('setting max', property, search[property]);
          setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Max'), search[property].max, propertiesValues);
        }
      }
      document.getElementById('ctl00_ctl00_CPContent_CPMain_butSearch').click();
    } else {
      console.error('no search to perform');
    }

  });

} else if ( transferResultPage.exec(window.location.href) ) {

  var db = new PouchDB('http://localhost:5984/hattrick');

  console.error('gathering player info');

  var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
  var playerList = [];

  for ( index in transferPlayerInfoList ) {
    let transferPlayerInfo = transferPlayerInfoList[index];
    // console.error(transferPlayerInfo.outerText);

    let player = {
      //'age'     : getPlayerAge( transferPlayerInfo ),
      '_id': getPlayerId( transferPlayerInfo ),
      'age': getPlayerAge( transferPlayerInfo ),
      'deadline': getDeadline( transferPlayerInfo ),
      'finalPrice': undefined
    };

    if ( player.deadline ) {
      Object.assign(player, getPlayerInfo( transferPlayerInfo ));

      playerList.push(player);

    }
  }

  console.error(playerList);
  db.bulkDocs(playerList).then( () => {
    nextPageLink = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucPager2_next');
    if ( nextPageLink && !nextPageLink.hasAttribute('disabled') ) {
      nextPageLink.click();
    } else {
      transferSearchLink = document.getElementById('ctl00_ctl00_CPContent_ucSubMenu_A4');
      if ( transferSearchLink ) {
        //transferSearchLink.click();
      }
    }
  });

  // EXAMPLE QUERY

  // var passingFunction = function(doc) {
  //   emit(doc.passing);
  // }

  // db.query(passingFunction, {
  //   startkey     : 5,
  //   endkey       : 7,
  //   limit        : 5,
  //   include_docs : true
  // }).then(function (result) {
  //   console.error('QUERY_RESULT:', result);
  // }).catch(function (err) {
  //   console.error('EERRRER:', err);
  // });

}


/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
  console.error('listener called');
  //sendResponse(document.getElementById('firstHeading').innerHTML);

  // sendResponse(player);
});

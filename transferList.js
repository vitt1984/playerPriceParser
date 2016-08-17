// CONSTANTS

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
    numeric: true,
    modifier: ( value ) => {
      return value * 0.25; // Rupees to euro
    }
  },
  'tsi'        : {
    regex: /TSI:\s+([0-9\s]+)/g,
    numeric: true
  }
};
let playerIdRegex = /playerId=([0-9]+)/g;
let playerAgeRegex = /Age:\s+([0-9]{2}) years \(([0-9]{2}) days\)/g;
let deadlineRegex = /Deadline:\s+([0-9]{2})-([0-9]{2})-([0-9]{4}) ([0-9]{2})\.([0-9]{2})/g;

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
      if ( playerProperties[property].modifier ) {
        value = playerProperties[property].modifier( value );
      }
      playerProps[property] = value;
      //console.error(property, matchingRegex[1]);
    } else {
      //console.error('missing', property);
    }
  }

  return playerProps;
}

// MAIN

// first check for players to add final price

if ( transferResultPage.exec(window.location.href) ) {

  console.error('test transferList.js');

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
        transferSearchLink.click();
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


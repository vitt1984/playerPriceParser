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
  'weak'              : 4,
  'poor'              : 3,
  'wretched'          : 2,
  'disastrous'        : 1,
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
let deadlineRegex = /Deadline:\s+([0-9]{2})-([0-9]{2})-([0-9]{4}) ([0-9]{2})\.([0-9]{2})/g;

var transferResultPage = /hattrick\.org\/World\/Transfers\/TransfersSearchResult\.aspx/g;

// FUNCTIONS

function getPlayerId( transferPlayerInfo ) {

  let playerIdMatch = playerIdRegex.exec( transferPlayerInfo.outerHTML );
  var playerid = undefined;
  if ( playerIdMatch ) {
    playerid = Number( playerIdMatch[1] );
  }
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  playerIdRegex.exec( transferPlayerInfo.outerHTML );

  return playerid;
}

function getDeadline( transferPlayerInfo ) {

  let deadlineMatch = deadlineRegex.exec( transferPlayerInfo.outerText );
  var deadline = undefined;
  if ( deadlineMatch ) {
    deadline = new Date (deadlineMatch[3].concat('-', deadlineMatch[2], '-', deadlineMatch[1], 'T',
                         deadlineMatch[4], ':', deadlineMatch[5], ':00'));
  }
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  deadlineRegex.exec( transferPlayerInfo.outerText );

  return deadline;
}

function getPlayerInfo( transferPlayerInfo ) {
  let playerProps = {};

  for (var property in playerProperties) {
    let matchingRegex = playerProperties[property].regex.exec( transferPlayerInfo.outerText );
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
    // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
    // due to a bug, we call the regex a second time
    playerProperties[property].regex.exec( transferPlayerInfo.outerText );
  }

  return playerProps;
}

function prepareDb( db ) {

  if (!db.objectStoreNames.contains('players')) {
    db.createObjectStore('players', { keyPath: 'playerId' });
  }
}

function addPlayerToDb( player, store ) {
  var checkKeyRequest = store.get(player['playerId']);

  checkKeyRequest.onsuccess = (e) => {

    if ( !e.srcElement.result ) {
      var request = store.add(player);

      request.onerror = function(e) {
        console.log('Error when adding player to db', e.target.error, player);
        //some type of error handler
      };
    } else {
      console.log('not adding existing player');
    }
  };

  checkKeyRequest.onerror = (e) => {
    console.log('Error when checking player in DB', e.target.error, player);
  };
}

// MAIN

var openRequest = indexedDB.open('hattrickDb',5);

openRequest.onerror = function(e) {
  console.error('Error', e);
};

openRequest.onupgradeneeded = function(e) {
  var db = e.target.result;

  prepareDb ( db );
};

openRequest.onsuccess = function(e) {
  console.log('Success!');
  var db = e.target.result;

  var transaction = db.transaction(['players'],'readwrite');
  var store = transaction.objectStore('players');

  if ( transferResultPage.exec(window.location.href) ) {
    console.error('gathering player info');

    var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
    var playerList = [];

    for ( index in transferPlayerInfoList ) {
      let transferPlayerInfo = transferPlayerInfoList[index];
      // console.error(transferPlayerInfo.outerText);

      let player = {
        'playerId': getPlayerId( transferPlayerInfo ),
        'deadline': getDeadline( transferPlayerInfo ),
        'finalPrice': undefined
      };

      if ( player.deadline ) {
        Object.assign(player, getPlayerInfo( transferPlayerInfo ));

        addPlayerToDb( player, store );

        playerList.push(player);
      }
    }

    console.error(playerList);
    console.error('transaction', transaction);

    transaction.oncomplete = () => {
      nextPageLink = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucPager2_next');
      if ( nextPageLink && !nextPageLink.hasAttribute('disabled') ) {
        nextPageLink.click();
      }
    };

  }

};


/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
  console.error('listener called');
  //sendResponse(document.getElementById('firstHeading').innerHTML);

  // sendResponse(player);
});

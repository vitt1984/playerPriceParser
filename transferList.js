// CONSTANTS

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
let playerIdRegex = /playerId=([0-9]+)/g;
let playerAgeRegex = /Age:\s+([0-9]{2}) years \(([0-9]{1,3}) days?\)/g;
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

function getPlayerId( source ) {

  let playerIdMatch = execRegex( playerIdRegex, source );
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
    age = Number(ageMatch[1]);
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

var skillsView = {
  playmaking: ['age', 'playmaking', 'passing', 'defending', 'winger'],
  defending : ['age', 'defending', 'passing', 'playmaking', 'winger'],
};

function getSkillsKey( player ) {
  var sortedSkills = [];
  for (property in player) {
    if ( playerProperties[property] !== undefined && playerProperties[property].skill ) {
      sortedSkills.push({ skill: property, value: player[property] });
    }
  }

  sortedSkills.sort( ( firstSkill, secondSkill ) => {
    return Number(firstSkill.value) < Number(secondSkill.value);
  });

  var keys = [];

  for (var index in sortedSkills) {
    var skill = sortedSkills[index].skill;
    var keySkills = skillsView[skill];
    if (keySkills !== undefined) {
      for (var index in keySkills) {
        var key = keySkills[index];
        keys.push(key);
      }
      return keys;
    }
  }
  return undefined;
}

// MAIN

// first check for players to add final price

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');
stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'TRANSFER_CHECK' && transferResultPage.exec(window.location.href) ) {

    console.error('test transferList.js');

    var playersDb = new PouchDB('http://localhost:5984/hattrick');

    console.error('gathering player info');

    var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
    var playerList = [];

    var promises = [];

    for ( index in transferPlayerInfoList ) {
      let transferPlayerInfo = transferPlayerInfoList[index];
      // console.error(transferPlayerInfo.outerText);

      let player = {
        //'age'     : getPlayerAge( transferPlayerInfo ),
        '_id': getPlayerId( transferPlayerInfo.outerHTML ),
        'age': getPlayerAge( transferPlayerInfo ),
        'deadline': getDeadline( transferPlayerInfo ),
        'finalPrice': undefined
      };

      if ( player.deadline ) {
        Object.assign(player, getPlayerInfo( transferPlayerInfo ));

        var varSkills = getSkillsKey(player);
        console.error('varSkills', varSkills);
        var varSkillsKey = varSkills.map( (key) => {
          return player[key];
        });
        console.error('varSkillsKey', varSkillsKey);

        let promise = playersDb.query('skillsView/'.concat(varSkills[1]), {
          key: varSkillsKey, group: true
        }).then(function (result) {
          if ( result.rows.length > 0 ) {
            let averagePrice = result.rows[0].value.sum / result.rows[0].value.count;
            player['priceForProfit2days'] = averagePrice * 0.85 - 100000;
            player['priceForProfit5days'] = averagePrice * 0.86 - 100000;
            player['priceExamplesCount'] = result.rows[0].value.count;
          } else {
            console.error('could not determine best price');
          }
          console.error('result', result);
          playerList.push(player);
        }).catch(function (err) {
          console.error('EERRRER:', err);
        });

        promises.push(promise);


      }
    }

    Promise.all( promises ).then( () => {
      playersDb.bulkDocs(playerList).then( () => {
        nextPageLink = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucPager2_next');
        if ( nextPageLink && !nextPageLink.hasAttribute('disabled') ) {
          delayedNavigation( () => { nextPageLink.click(); });
        } else {
          transferSearchLink = document.getElementById('ctl00_ctl00_CPContent_ucSubMenu_A4');
          if ( transferSearchLink ) {
            delayedNavigation( () => { transferSearchLink.click(); });
          }
        }
      });
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
}).catch( () => {
  console.warn('state is not set');
});

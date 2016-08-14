console.error('test content.js');

// CONSTANTS

let propertiesToRegex = {
  'price'      : /([0-9\s]+)\sRupees/g,
  'tsi'        : /TSI:\s+([0-9\s]+)/g,
  'experience' : /([a-z\s]+) in esperienza/g,
  'stamina'    : /Resistenza:\s*([a-z\s]+\s)/g,
  'playmaking' : /Regia:\s*([a-z\s]+\s)/g,
  'winger'     : /Cross:\s*([a-z\s]+\s)/g,
  'scoring'    : /Attacco:\s*([a-z\s]+\s)/g,
  'keeper'     : /Parate:\s*([a-z\s]+\s)/g,
  'passing'    : /Passaggi:\s*([a-z\s]+\s)/g,
  'defending'  : /Difesa:\s*([a-z\s]+\s)/g,
  'specialty'  : /Specialità:\s*([a-zA-Z\s]+\s)/g,
  'set pieces' : /Calci Piazzati:\s*([a-z\s]+\s)/g
};
let playerIdRegex = /playerId=([0-9]+)/g;
let expiryRegex = /Scadenza:\s+([0-9]{2}-[0-9]{2}-[0-9]{4} [0-9]{2}\.[0-9]{2})/g;

var transferResultPage = /hattrick\.org\/World\/Transfers\/TransfersSearchResult\.aspx/g;

// FUNCTIONS

function getPlayerId( transferPlayerInfo ) {

  let playerIdMatch = playerIdRegex.exec( transferPlayerInfo.outerHTML );
  var playerid = undefined;
  if ( playerIdMatch ) {
    playerid = playerIdMatch[1];
  }
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  playerIdRegex.exec( transferPlayerInfo.outerHTML );

  return playerid;
}

function getExpiryDate( transferPlayerInfo ) {

  let expiryMatch = expiryRegex.exec( transferPlayerInfo.outerText );
  var expiry = undefined;
  if ( expiryMatch ) {
    expiry = expiryMatch[1];
  }
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  expiryRegex.exec( transferPlayerInfo.outerText );

  return expiry;
}

function getPlayerProperties ( transferPlayerInfo ) {
  let playerProps = {};

  for (var property in propertiesToRegex) {
    let matchingRegex = propertiesToRegex[property].exec( transferPlayerInfo.outerText );
    if ( matchingRegex ) {
      playerProps[property] = matchingRegex[1].replace(/\s/g, '');
      //console.error(property, matchingRegex[1]);
    } else {
      //console.error('missing', property);
    }
    // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
    // due to a bug, we call the regex a second time
    propertiesToRegex[property].exec( transferPlayerInfo.outerText );
  }

  return playerProps;
}

// MAIN

if ( transferResultPage.exec(window.location.href) ) {
  console.error('gathering player info');

  var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
  var playerList = [];

  for ( index in transferPlayerInfoList ) {
    let transferPlayerInfo = transferPlayerInfoList[index];
    // console.error(transferPlayerInfo.outerText);

    let player = {
      'player': getPlayerId( transferPlayerInfo ),
      'expiry': getExpiryDate( transferPlayerInfo )
    };

    Object.assign(player, getPlayerProperties( transferPlayerInfo ));

    playerList.push(player);
  }

  console.error(playerList);

  nextPageLink = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucPager2_next');
  if ( nextPageLink && !nextPageLink.hasAttribute('disabled') ) {
    //nextPageLink.click();
  }

}



/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
  console.error('listener called');
  //sendResponse(document.getElementById("firstHeading").innerHTML);

  // sendResponse(player);
});

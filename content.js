console.error('test content.js');

transferResultPage = /hattrick\.org\/World\/Transfers\/TransfersSearchResult\.aspx/g;

if ( transferResultPage.exec(window.location.href) ) {
  console.error('gathering player info');

  var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
  var playerList = [];

  let propertiesToRegex = {
    'tsi'        : /TSI:\s+([0-9\s]+)/g,
    'experience' : /([a-z\s]+) in esperienza/g,
    'stamina'    : /Resistenza:\s*([a-z\s]+\s)/g,
    'playmaking' : /Regia:\s*([a-z\s]+\s)/g,
    'winger'     : /Cross:\s*([a-z\s]+\s)/g,
    'scoring'    : /Attacco:\s*([a-z\s]+\s)/g,
    'keeper'     : /Parate:\s*([a-z\s]+\s)/g,
    'passing'    : /Passaggi:\s*([a-z\s]+\s)/g,
    'defending'  : /Difesa:\s*([a-z\s]+\s)/g,
    'set pieces' : /Calci Piazzati:\s*([a-z\s]+\s)/g,
  };

  for ( index in transferPlayerInfoList ) {
    let transferPlayerInfo = transferPlayerInfoList[index];
    // console.error(transferPlayerInfo.outerText);
    let player = {};

    for (var property in propertiesToRegex) {
      console.error('checking on', transferPlayerInfo.outerText);
      let matchingRegex = propertiesToRegex[property].exec( transferPlayerInfo.outerText );
      if ( matchingRegex !== null ) {
        player[property] = matchingRegex[1].replace(/\s/g, '');
        //console.error(property, matchingRegex[1]);
      } else {
        //console.error(property, matchingRegex);
      }
      // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
      // due to a bug, we call the regex a second time
      propertiesToRegex[property].exec( transferPlayerInfo.outerText );
    }

    playerList.push(player);
    console.error(player);
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

console.error('test content.js')

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
  console.error('listener called');
  //sendResponse(document.getElementById("firstHeading").innerHTML);

  test = document.getElementsByClassName('transferPlayerInfo')

  let propertiesToRegex = {
    'tsi': /TSI:\s+([0-9\s]+)/g,
    'exp': /([a-zA-Z\s]+) in esperienza/g
  }

  let player = {}

  for (var property in propertiesToRegex) {
    console.error(property, propertiesToRegex[property])
    let matchingRegex = propertiesToRegex[property].exec( test[0].outerText );
    console.error(matchingRegex)
    if ( matchingRegex !== null ) {
      player[property] = matchingRegex[1].replace(/\s/g, '')
    } 
  }
  console.error(player)

  sendResponse(player);
});
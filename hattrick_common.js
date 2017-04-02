

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

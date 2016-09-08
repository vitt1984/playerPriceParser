
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

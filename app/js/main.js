$(document).ready(function() {
  'use-strict';
  if ('testing' === 'testing') {
    // Note: Cannot have console log in tests
    // or Karma will return an error
    // console.log("testing");
  }
});

function add(int1, int2) {
  'use-strict';
  return int1 + int2;
}


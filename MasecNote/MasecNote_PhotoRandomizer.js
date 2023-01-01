/*

  Last Edit: 2022/12/31
  v1.0.2022.12.31

*/

var getVal = (id) => document.getElementById(id).value;
var getElem = (id) => document.getElementById(id);
var getEs_C = (classname) => document.getElementsByClassName(classname);
var qSA = (q) => document.querySelectorAll(q);

page_reload();
function page_reload() {
  let li = [
    [ 'img/HOME/01.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/02.png', 'img/masec_note_black.png' ],
    [ 'img/HOME/03.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/04.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/05.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/06.png', 'img/masec_note_black.png' ],
    [ 'img/HOME/07.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/08.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/09.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/10.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/11.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/12.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/13.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/14.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/15.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/16.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/17.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/18.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/19.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/20.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/21.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/22.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/23.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/24.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/25.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/26.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/27.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/28.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/29.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/30.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/31.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/32.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/33.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/34.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/35.png', 'img/masec_note_white.png' ],
    [ 'img/HOME/36.png', 'img/masec_note_white.png' ],
  ];
  let idx = Math.floor(Math.random()*35);
  getEs_C('homeLogo')[0].setAttribute('src', li[idx][1]);
  getEs_C('homePic')[0].setAttribute('src', li[idx][0]);
}

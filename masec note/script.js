/* Last Edit: 2022/08/26 */

var getVal = (id) => document.getElementById(id).value;
var getElem = (id) => document.getElementById(id);
var getEs_C = (classname) => document.getElementsByClassName(classname);
var qSA = (q) => document.querySelectorAll(q);

window_load(); //読み込み時の表示
window.onresize = window_load; //ウィンドウサイズ変更時に更新
function window_load() {
  if (window.innerWidth > window.innerHeight+100) {  //pc
    qSA("#whole")[0].style.display = "flex";
    qSA("#main")[0].style.width = "60vw";
    qSA("#main")[0].style.marginLeft = "4em";
    qSA("#sidebar")[0].style.margin = "0em 2em 0em 0em";
    qSA("#sidebar")[0].style.maxWidth = "275px";
    qSA("#sidebar")[0].style.display = "inline-block";
  } else {  //phone
    qSA("#whole")[0].style.display = "inline";
    qSA("#main")[0].style.width = "90%";
    qSA("#main")[0].style.margin = "0em 0em 0em 1em";
    qSA("#sidebar")[0].style.margin = "0em 1em";
    qSA("#sidebar")[0].style.maxWidth = "80%";
    qSA("#sidebar")[0].style.display = "flex";
  }
}

page_reload();
function page_reload() {
  for(let i of qSA(".copyBoard")) {
    let r = i.parentNode.textContent
      .replace(/~#[a-z]/g, "")
      .replace(/~#[A-Z]\([^\)]+\)/g, "")
      .replace(/[a-zA-Z]#~/g, "")
      .replace(/コピー/, "");
    let s = [];
    for(let j of stringArray(r)) {
      if(!j.startsWith('"')) s.push(j.replace(/\%/g, " "));
      else s.push(j);
    }
    i.textContent = s.join('');
  }
  for(let i of getEs_C("masecjson")) {
    let t = i.innerHTML;
    let li = cut(t, t.match(/<button.+?>/).index, t.match(/<\/textarea>/).index + 10);
    i.innerHTML = li[1] + deco(hl(stringArray(li[2])));
  }
}

// '{ "a": 1 }' -> [ '{ ', '"a"', ': 1 }' ]
function stringArray(s) {
  let li = s.split('');
  let lastNum = 0;
  let r = [];
  let isInside = false;
  let isInLineComment = false;
  let isInBlockComment = false
  for(let i=0; i<li.length; i++ ) {
    // String Unit
    if(li[i] == '"' && li[i-1] != '\\' && !isInLineComment && !isInBlockComment) {
      let ii;
      if(isInside) ii = 1;
      else ii = 0;
      r.push(li.slice(lastNum, i + ii).join(''));
      lastNum = i + ii;
      isInside = !isInside;
    // Line Comment Unit
    } else if(li[i] == '/' && li[i+1] == '/' && !isInLineComment && !isInside && !isInBlockComment) {
      r.push(li.slice(lastNum, i).join(''));
      lastNum = i;
      isInLineComment = !isInLineComment;
    // End of Line Comment Unit
    } else if(li[i] == '\n' && isInLineComment && !isInside && !isInBlockComment) {
      r.push(li.slice(lastNum, i).join(''));
      lastNum = i;
      isInLineComment = !isInLineComment;
    // Block Comment Unit
    } else if(li[i] == '/' && li[i+1] == '*' && !isInBlockComment && !isInside && !isInLineComment) {
      r.push(li.slice(lastNum, i).join(''));
      lastNum = i;
      isInBlockComment = !isInBlockComment;
    // End of Block Comment Unit
    } else if(li[i] == '*' && li[i+1] == '/' && isInBlockComment && !isInside && !isInLineComment) {
      r.push(li.slice(lastNum, i+2).join(''));
      lastNum = i + 2;
      isInBlockComment = !isInBlockComment;
    }
  }
  if(lastNum != li.length) r.push(li.slice(lastNum, li.length).join(''));
  return r;
}

function hl(li) {
  let r = [];
  for(let i=0; i<li.length; i++) {
    // is_string
    if(li[i].startsWith('"')) {
      if(li[i+1].startsWith(':')) {
        r.push('<span class="hljs-attr">' + li[i] + '</span>');
      } else {
        r.push('<span class="hljs-string">' + li[i] + '</span>');
      }
    // is_comment
    } else if(li[i].startsWith('//') || li[i].startsWith('/*')) {
        r.push('<span class="hljs-comment">' + li[i] + '</span>');
    } else {  // !is_string && !is_comment
      let p = li[i].replace(/\%/g, "");
      p = p.replace(
        /(true|false)/g, '<span class="hljs-keyword">$1</span>'
      );
      p = p.replace(
        /((?<!\([^\)]*)\-?\d+(\.\d+(e[\+\-]?\d+)?)?(?!\).*))/g,
        '<span class="hljs-number">$1</span>'
      );

      r.push(p);
    }
  }
  return r.join('');
}

function deco(s) {
  let r = s
  
  r = r.replace(
    /~#M\(([\da-f]+)\)(<span class="hljs\-[a-z]+">)?([^<>]+?)(<\/span>)?M#~/g,
    '<span style="background: #$1;">$3</span>'
  );

  r = r.replace(
    /~#C\(([\da-f]+)\)(<span class="hljs\-[a-z]+">)?([^<>]+?)(<\/span>)?C#~/g,
    '<span style="color: #$1;">$3</span>'
  );

  r = r.replace(
    /~#([a-z])/g, '<div class="demoMark_$1">'
  );

  r = r.replace(
    /([a-z])#~/g, '</div>'
  );
  return r;
}

// cut('012345', 2, 4) -> [ '01', '234', '5' ]
function cut(s, a, b) {
  let ss = s.substr( 1-(s.length-b) );
  if(s.length-b == 1) ss = '';
  return [ s.substr(0, a), s.substr(a, b-a+1), ss ];
}

function copyToClipboard(id) {

  let name = id.split(":")[0];
  let type = id.split(":")[1];

  if(type == "div") {
    var copyTarget = getElem(name);
    copyTarget.select();
    document.execCommand("Copy");
  } else if(type == "code") {
    var range = document.createRange();
    range.selectNode(getElem(name));
	  var selection = document.getSelection();
	  selection.removeAllRanges();
	  selection.addRange(range);
    document.execCommand('copy');
    document.getSelection().removeAllRanges();
  }

}
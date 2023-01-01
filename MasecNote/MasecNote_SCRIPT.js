/*

  Last Edit: 2022/11/26
  v1.1.2022.11.26

*/

var getVal = (id) => document.getElementById(id).value;
var getElem = (id) => document.getElementById(id);
var getEs_C = (classname) => document.getElementsByClassName(classname);
var qSA = (q) => document.querySelectorAll(q);

window_load(); //読み込み時の表示
window.onresize = window_load; //ウィンドウサイズ変更時に更新
function window_load() {
  try {
    qSA(".pic-margin")[0].style.height = `${window.innerWidth * 986/1920 -20}px`;
    getEs_C('homeLogo')[0].style.top = `${(window.innerWidth * 986/1920 / 2 - window.innerWidth * 0.6 * 256 / 1360 / 2)}px`;
    // body.width * 986/1920 /2 - body.width * 75% * 256/1360 /2
    // ∵ pic: 986x1920, logo: 256x1360
  } catch(e) {}
  try {
    if (window.innerWidth > 960) {  // pc
      qSA(".left")[0].style.width = "calc(67.5% - 0em)";
      qSA(".right")[0].style.width = "calc(25.5% - 0em)";
      qSA(".main")[0].style.display = "flex";
      qSA(".left")[0].style.display = "inline-block";
      qSA(".right")[0].style.display = "inline-block";
    } else {  // phone
      qSA(".left")[0].style.width = "calc(100% - 0em)";
      qSA(".right")[0].style.width = "calc(100% - 0em)";
      qSA(".main")[0].style.display = "block";
      qSA(".left")[0].style.display = "block";
      qSA(".right")[0].style.display = "block";
    }
  } catch(e) {}
}

page_reload();
function page_reload() {
  try {
    if (window.innerWidth > 960) {  // pc
      getElem("mokuzi-button").checked = true;
    }
  } catch(e) {}

  for(let i=0; i<getEs_C("jsonDiv").length; i++) {
    let r = getEs_C("json")[i].textContent
      .replace(/~#[a-z]/g, "")
      .replace(/~#[A-Z]\([^\)]+\)/g, "")
      .replace(/[a-zA-Z]#~/g, "");
    let s = [];
    for(let j of stringArray(r)) {
      if(!j.startsWith('"')) s.push(j.replace(/\%/g, " "));
      else s.push(j);
    }
    getEs_C("copyBoard")[i].textContent = s.join('');
  }
  for(let i of getEs_C("json")) {
    i.innerHTML = deco(hl(stringArray(i.innerHTML)));
  }
  for(let i of getEs_C("lang")) {
    i.innerHTML = deco(langHL(i.innerHTML));
  }
  for(let i of getEs_C("molang")) {
    i.innerHTML = deco(molangHL(i.innerHTML));
  }
  /*
  for(let i of getEs_C("func")) {
    i.innerHTML = deco(funcHL(i.innerHTML));
  }
  */
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
      let isAttr;
      try {
        isAttr = li[i+1].startsWith(':');
      } catch(e) {
        isAttr = false;
      }
      if(isAttr) {
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

function langHL(s) {
  let r = s.replace(
    /(.+)=([^ \n\t]+)/g,
    '<span class="hljs-attr">$1</span>=<span class="hljs-string">$2</span>'
  );

  r = r.replace(
    /(?<!~)#(?!~)(.+)/g,
    '<span class="hljs-comment">#$1</span>'
  );

  return r;
}

function molangHL(s) {

  let cols = {
    'var': '#1b00c9',
    math: '#00b7ad',
    q: '#ff5900',
    str: '#e70000',
    kw: '#aa00e2',
    num: '#0a0'
  }

  // num
  let r = s.replace(
    /(\-?\d+(.\d+)?)/g,
    `<span style="color: ${cols.num}">$1</span>`
  );

  // var
  r = r.replace(
    /(v(ariable)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${cols.var}">$1</span>`
  );
  // temp
  r = r.replace(
    /(t(emp)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${cols.var}">$1</span>`
  );
  // context
  r = r.replace(
    /(c(ontext)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${cols.var}">$1</span>`
  );

  // math
  r = r.replace(
    /(math\.[a-zA-Z0-9_]+)/g,
    `<span style="color: ${cols.math}">$1</span>`
  );

  // query
  r = r.replace(
    /(q(uery)?\.[a-zA-Z0-9_]+)/g,
    `<span style="color: ${cols.q}">$1</span>`
  );

  // string
  r = r.replace(
    /('.+?')/g,
    `<span style="color: ${cols.str}">$1</span>`
  );

  // keywords
  r = r.replace(
    /(return|for_each|loop|continue|break)/g,
    `<span style="color: ${cols.kw}">$1</span>`
  );

  return r;

}

/* function funcHL(s) {} */

function deco(s) {
  let li = [];
  let c = 0;

  for(let i=0; i<s.length-2; i++) {
    if(s[i] + s[i+1] + s[i+2] == '~#M'){
      if(i != 0) {
        li.push(s.slice(c, i));
        c = i;
      }
    } else if(s[i] + s[i+1] + s[i+2] == 'M#~') {
      li.push(s.slice(c, i+3).replace(/<span(.*?)>(.+?)<\/span>/g, '$2'));
      if(i != s.length-3) c = i+3;
    } else if(i == s.length-3) {
      li.push(s.slice(c, s.length))
    }
  }

  let r = li.join('');
  
  r = r.replace(
    /~#M\(([\da-f]+)\)(.*?)M#~/g,
    '<span style="background: #$1; color: #5f5e4e;">$2</span>'
  );

  r = r.replace(
    /~#C\(([\da-f]+)\)(<span class="hljs\-[a-z]+">)?([^<>]+?)(<\/span>)?C#~/g,
    '<span style="color: #$1;">$3</span>'
  );

  r = r.replace(/~#([a-z])/g, '<div class="demoMark_$1">');
  r = r.replace(/([a-z])#~/g, '</div>');

  r = r.replace(/~#D/g, '<span class="dots">');
  r = r.replace(/D#~/g, '</span>');

  r = r.replace(/~#S/g, '<s>');
  r = r.replace(/S#~/g, '</s>');
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
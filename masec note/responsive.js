/* Last Edit: 2022/06/19 */

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
    i.textContent = i.parentNode.textContent
      .replace(/~#[a-z]/g, "")
      .replace(/~#[A-Z]\([^\)]+\)/g, "")
      .replace(/[a-zA-Z]#~/g, "")
      .replace(/コピー/, "");
  }
  for(let i of getEs_C("masecjson")) {
    let t = i.innerHTML;
    let txtara = t.match(/\<button(.|\n)+\/textarea\>/g)[0];
    let t_ = t.replace(txtara, "");
    i.innerHTML = txtara + cv(hl(t_));
  }
}

function cv(t) {
  let rules = [
    [ /~#p((.|\n)*?)p#~/, "<div class=\"demoMark_p\">", "</div>" ],
    [ /~#o((.|\n)*?)o#~/, "<div class=\"demoMark_o\">", "</div>" ],
    [ /~#g((.|\n)*?)g#~/, "<div class=\"demoMark_g\">", "</div>" ],
    [ /~#b((.|\n)*?)b#~/, "<div class=\"demoMark_b\">", "</div>" ],
    [ /~#r((.|\n)*?)r#~/, "<div class=\"demoMark_r\">", "</div>" ]
  ];
  let res = t;
  for(let r of rules) {
    while(true) {
      let m = res.match(r[0]);
      if(m == null) break;
      let cont = m[1];
      let spl = cont.split("\n");
      let spc = spl[spl.length-1].match(/ +/);
      if(spc != null) {
        let l = [];
        for(let i of spl) l.push(i.replace(spc[0], ""));
        cont = l.join("\n");
      }
      res = res.replace(r[0], r[1] + cont + r[2]);
    }
  }
  let rules2 = [
    [ /~#M\(([\da-f]+)\)([^#~]*)M#~/g, "<span style=\"background-color: #$1;\">$2</span>" ],
    [ /~#C\(([\da-f]+)\)([^#~]*)C#~/g, "<span style=\"color: #$1;\">$2</span>" ]
  ];
  for(let r of rules2) {
    res = res.replace(r[0], r[1]);
  }
  return res;
}

function hl(t) {
  let t_ = t.replace(/(\-*(\d*\.{0,1}\d+e[\-\+]*\d+|\d*\.{0,1}\d+))/g, "~!(number)$1!~")
    .replace(/(true|false)/g, "~!(literal)$1!~");
  console.log(t_);
  
  let m = t_.match(/(?<!\\|\))\"([^,\n]+?)(?<!\\)\"(?!\!):/g);
  if(m!=null) for(let i of m) {
    let m_ = i.replace(/~\!\(.+?\)(.+?)\!~/g, "$1");
    t_ = t_.replace(i, "~!(attr)" + m_.slice(0, m_.length-1) + "!~:");
  }
  console.log(t_);

  let mm = t_.match(/(?<!\\|\))\"(?!\!)(.+?)(?<!\\)\"(?!\!)/g);
  if(mm!=null) for(let i of mm) {
    let mm_ = i.replace(/~\!\(.+?\)(.+?)\!~/g, "$1");
    t_ = t_.replace(/(?<!\\|\))\"(?!\!)(.+?)(?<!\\)\"(?!\!)/, "~!(string)" + mm_ + "!~");
  }
  console.log(t_);

  let mmm = t_.match(/(?<!\))\/{2}(.+)\n/g);
  if(mmm!=null) for(let i of mmm) {
    let mmm_ = i.replace(/~\!\(.+?\)(.+?)\!~/g, "$1");
    t_ = t_.replace(/(?<!\))\/{2}(.+)\n/, "~!(comment)" + mmm_.slice(0, mmm_.length-1) + "!~\n");
  }

  let res = t_.replace(/~\!\(([a-z]+)\)(.*?)\!~/g, '<span class="hljs-$1">$2</span>');
  console.log(t_);
  let n = res.match(/(~#[CM]\(.+\).+?[CM]#~)/g);
  if(n!=null) for(let i of n) {
    let n_ = i.replace(/<.+?>(.+?)<\/.+?>/g, "$1");
    res = res.replace(i, n_);
  }

  return res;
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

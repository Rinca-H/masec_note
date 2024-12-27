// #region 基本的な関数

/**
 * @param {string} id
 */
function getElem(id) {
  return document.getElementById(id);
}

/**
 * @param {string} query
 */
function qSA(query) {
  return document.querySelectorAll(query);
}

/**
 * @param {number} num
 */
function zeroPadding(num) {
  return ('00' + num).slice(num.toString().length);
}

// #endregion

/**
 * @param {string} elemId
 * @param {number} [offset=0]
 */
function jumpTo(elemId, offset=0) {
  const target = getElem(elemId);
  if(target) scrollBy(0, target.getBoundingClientRect().top - 16 + offset);
}

/**
 * @param {Element} elem
 */
function copyText_Old(elem) {
  const range = document.createRange();
  range.selectNode(elem);

  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand('copy');
  document.getSelection().removeAllRanges();
}

function onWindowLoad() {
  const windowWidth = window.innerWidth;
  const afterLayoutType = (windowWidth > 650)? 'PC' : 'MOBILE';

  if(afterLayoutType == layoutType) return;

  /** @type {HTMLElement} */
  const sidebarSwitchLabel = document.querySelector('label.sidebar_switch');

  switch(afterLayoutType) {
    case 'PC': {
      getElem('main').style.width = 'calc(70% - 2 * 32px)';
      getElem('side').style.width = '30%';
      getElem('sidebar_switch').classList.remove('for_mobile');
      sidebarSwitchLabel.style.display = 'none';

    } break;
    
    case 'MOBILE': {
      getElem('main').style.width = 'calc(100% - 2 * 32px)';
      getElem('side').style.width = 'max(350px, 30vw)';
      getElem('sidebar_switch').classList.add('for_mobile');
      sidebarSwitchLabel.style.display = 'unset';

    } break;
  }

  layoutType = afterLayoutType;
}

let layoutType = 'PC';
onWindowLoad();

// ウィンドウサイズ変更時に更新
window.onresize = onWindowLoad;

(function genIndexes() {
  let [secNo, subsecNo] = [0, 0];

  for(let secElem of qSA('div#main .sec, div#main .subsec')) {
    let id = `sec${zeroPadding(secNo)}`;
    let secType = 'sec';

    if(secElem.classList.contains('sec')) {
      secNo += 1;
      subsecNo = 0;
    } else {
      subsecNo += 1;
      id = `sec${zeroPadding(secNo)}sec${zeroPadding(subsecNo)}`;
      secType = 'subsec';
    }

    secElem.id = id;

    getElem('side').querySelector('div.contents').innerHTML
      += `<div class="${secType}" onclick="jumpTo('${id}', 0)">${secElem.textContent}</div>`;
  }
})();
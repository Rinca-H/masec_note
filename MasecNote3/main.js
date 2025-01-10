// #region 基本的な関数

/**
 * @param {...any} texts
 */
function log(...texts) {
  console.error(Array.from(texts, val => `${val}`).join(' '));
}

/**
 * @param {string} id
 */
function getVal(id) {
  return document.getElementById(id).value;
}

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

// #endregion

/**
 * @param {string} elemId
 * @param {string} fileName
 */
async function loadSideContent(elemId, fileName) {
  let response = await fetch(fileName);

  if(!response.ok) response = await fetch('../' + fileName);

  if(response.ok) {
    const content = await response.text();
    getElem(elemId).innerHTML = content.match(/<body>(.+)<\/body>/s)[1];

  } else {
    throw new Error(`ファイルの読み込みに失敗しました: ${fileName}`);

  }
  
}

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

  if(windowWidth > 650) { // PC画面

    getElem('root_box').style.display = 'flex';

    getElem('main_content').style.display = getElem('side_content').style.display = 'inline-block';
    getElem('main_content').style.margin = '24px 12px 24px 24px';
    getElem('main_content').style.minWidth = '1px';
    getElem('main_content').style.flex = 7;

    getElem('side_content').style.margin = '24px 24px 24px 12px';
    getElem('side_content').style.minWidth = '1px';
    getElem('side_content').style.flex = 3;

  } else { // スマホ画面

    getElem('root_box').style.display = 'unset';

    getElem('main_content').style.display = getElem('side_content').style.display = 'block';
    getElem('main_content').style.margin = '24px 24px 16px 24px';
    getElem('main_content').style.width = `${windowWidth - (24 + 12) - 2*32 - 16}px`; // 100% - margin - padding - scrollbar
    getElem('main_content').style.flex = getElem('side_content').style.flex = 'unset';

    getElem('side_content').style.margin = '16px 24px 24px 24px';
    getElem('side_content').style.width = `${windowWidth - 2*24 - 16}px`;

  }
}

/** ボーダーのHTML変換
 * @param {string} str
 */
function borderTrans(str) {
  let textLines = str.split('\n');
  let spaceNums = [];

  textLines = textLines.map(line => {

    if(spaceNums.length > 0) {

      const sum_of_spaces = spaceNums.reduce((sum, k) => sum + k);

      // 行頭のスペースを減らす
      line = line.replace(/^ +/,
        matchData => ' '.repeat(Math.max(0, matchData.length - sum_of_spaces))
      );

    }

    // ボーダー開始
    let matchResult;
    if(( matchResult = line.match(/( *)~#B\(([0-9a-f]+)\)/) )) {
      spaceNums.push(matchResult[1].length);
      line = line.replace(/~#B\(([0-9a-f]+)\)/, `<div style="border-color: #${matchResult[2]};" class="border">`);
    }

    // ボーダー終了
    if((matchResult = line.match(/B#~/))) {
      spaceNums.pop();
      line = line.replace(/B#~/, `</div>`);
    }

    return line;

  });

  return textLines.join('\n');

}

/** マーカーのHTML変換
 * @param {string} str
 */
function markerTrans(str) {

  const reg = flag => new RegExp('~#M\\(([0-9a-f]+)\\)(.+?)M#~', flag);

  return str.replace(reg('gs'), part => {
    const match = part.match(reg('s'));
    return `<span style="background-color: #${match[1]};">${match[2]}</span>`;

  });

}

// #region JSONハイライト
/** ストリング・コメント分解
 * @param {string} str
 */
function strComDecomp(str) {
  const charList = str.split('');
  /** @type {{part: string, type: 'str'|'comment'|'attr'|'other'}[]} */
  const result = [];

  let [isInStr, isInLineCom, isInBlockCom] = [false, false, false];
  let lastIndex = 0;

  for(let i=0; i<charList.length; i++) {
    if(charList[i] == '"' && charList[i - 1] != '\\' && !(isInLineCom || isInBlockCom)) { // ストリング

      let endIndex = isInStr? i + 1 : i;
      result.push({part: charList.slice(lastIndex, endIndex).join(''), type: isInStr? 'str' : 'other'});
      isInStr = !isInStr;
      lastIndex = endIndex;

    } else if((charList[i] == '/' && charList[i + 1] == '/') && !(isInStr || isInBlockCom || isInLineCom)) { // 行コメント(開始)

      result.push({part: charList.slice(lastIndex, i).join(''), type: 'other'});
      isInLineCom = true;
      lastIndex = i;

    } else if(charList[i] == '\n' && isInLineCom) { // 行コメント(終了)

      result.push({part: charList.slice(lastIndex, i).join(''), type: 'comment'});
      isInLineCom = false;
      lastIndex = i;

    } else if((charList[i] == '/' && charList[i + 1] == '*') && !(isInStr || isInLineCom || isInBlockCom)) { // ブロックコメント(開始)

      result.push({part: charList.slice(lastIndex, i).join(''), type: 'other'});
      isInBlockCom = true;
      lastIndex = i;

    } else if((charList[i] == '*' && charList[i + 1] == '/') && isInBlockCom) { // ブロックコメント(終了)

      result.push({part: charList.slice(lastIndex, i + 2).join(''), type: 'comment'});
      isInBlockCom = false;
      lastIndex = i + 2;

    }
  }

  // 残り
  if(lastIndex != charList.length - 1) {
    result.push({part: charList.slice(lastIndex, charList.length).join(''), type: 'other'});
  }

  return result;
}

/** Attributeの区別
 * @param {{part: string, type: string}[]} array
 */
function attrCheck(array) {
  for(let i=0; i<array.length; i++) {

    if(array[i].type == 'str' && array[i + 1].type == 'other' && array[i + 1].part.includes(':')) {
      array[i].type = 'attr';
    }

  }
}

/** 結合
 * @param {{part: string, type: string}[]} decompedObjList
 */
function join(decompedObjList) {
  let result = '';

  decompedObjList.forEach(decompedObj => {

    switch (decompedObj.type) {
      case 'attr':
        result += `<span class="jsonhl:attr">${decompedObj.part}</span>`;
      break;

      case 'str':
        result += `<span class="jsonhl:str">${decompedObj.part}</span>`;
      break;

      case 'comment':
        result += `<span class="jsonhl:comment">${decompedObj.part}</span>`;
      break;

      default:
        result += decompedObj.part
          .replace(/((?<![a-z0-9\(])-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?)/g, '<span class="jsonhl:num">$1</span>')
          .replace(/(true|false)/g, '<span class="jsonhl:bool">$1</span>')
          .replace(/null/g, '<span class="jsonhl:null">null</span>');
    }
  });

  // result = borderTrans(result);
  // result = markerTrans(result);

  return result;
}
// #endregion

// #region Javaハイライト
const JAVA_KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte',
  'case', 'catch', 'char', 'class', 'const', 'continue',
  'default', 'do', 'double', 'else', 'enum', 'extends',
  'final', 'finally', 'float', 'for', 'goto', 'if',
  'implements', 'import', 'instanceof', 'int',
  'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short',
  'static', 'strictfp', 'super', 'switch', 'synchrnized',
  'this', 'throw', 'throws', 'transient', 'try', 'var', 'void',
  'volatile', 'while',
];

/** トークン分割
 * @param {string} inputString
 */
function strDecomp(inputString) {

  /** @type {{splitedString: string, type: string|undefined}[]} */
  let result = [];
  let currentType;
  let lastIndex = 0;

  /** 何度も現れる処理
   * @param {number} index
   * @param {string} setType
   * @param {number} lastIndexOffset
   */
  function process(index, setType, lastIndexOffset=0) {

    // slice長が0でないとき、sliceしてpush
    if(lastIndex != index + lastIndexOffset) {
      const splitedStr = inputString.slice(lastIndex, index + lastIndexOffset);
      let typeWillSet = currentType;

      // キーワードの置き換え
      if(currentType == 'text') {

        switch (splitedStr) {
          case 'boolean':
          case 'char':
          case 'double':
          case 'float':
          case 'int':
          case 'long':
          case 'short':
          case 'void': typeWillSet = 'keyword_type'; break;

          case 'true':
          case 'false': typeWillSet = 'keyword_bool'; break;

          case 'null': typeWillSet = 'keyword_null'; break;

          default: if(JAVA_KEYWORDS.includes(splitedStr)) {
            typeWillSet = 'keyword';
          }
        }
      }

      result.push({splitedString: splitedStr, type: typeWillSet});
    }

    currentType = setType;
    lastIndex = index + lastIndexOffset;
  }
  
  // 1文字ずつ処理
  for(let charIndex = 0; charIndex < inputString.length; charIndex++) {
    const currentChar = inputString[charIndex];

    // #region 終了するまで他の記号を検知しないもの
    if(currentType == 'line_comment') {
      if(currentChar.match(/\n/)) {
        process(charIndex, 'spaces');
      }
      continue;

    } else if(currentType == 'block_comment') {
      if(currentChar.match(/\*/) && inputString[charIndex + 1]?.match(/\//)) {
        process(charIndex, 'spaces', 2);
      }
      continue;

    } else if(currentType == 'single_quote') {
      if(currentChar.match(/'/) && !inputString[charIndex - 1]?.match(/\\/)) {
        process(charIndex, 'spaces', 1);
      }
      continue;

    } else if(currentType == 'double_quote') {
      if(currentChar.match(/"/) && !inputString[charIndex - 1]?.match(/\\/)) {
        process(charIndex, 'spaces', 1);
      }
      continue;

    }
    // #endregion

    // #region 記号の種類ごとの処理
    if(currentChar.match(/[a-zA-Z_]/) && currentType != 'text') {
      process(charIndex, 'text');

    } else if(currentChar.match(/[0-9]/) && currentType != 'number' && currentType != 'text') {
      process(charIndex, 'number');

    } else if(currentChar.match(/ |\n/) && currentType != 'spaces') {
      process(charIndex, 'spaces');

    } else if(currentChar.match(/\//) && inputString[charIndex + 1]?.match(/\//) && currentType != 'line_comment') {
      process(charIndex, 'line_comment');

    } else if(currentChar.match(/\//) && inputString[charIndex + 1]?.match(/\*/) && currentType != 'block_comment') {
      process(charIndex, 'block_comment');

    } else if(currentChar.match(/'/) && currentType != 'single_quote') {
      process(charIndex, 'single_quote');

    } else if(currentChar.match(/"/) && currentType != 'double_quote') {
      process(charIndex, 'double_quote');

    } else if(currentChar.match(/:/) && currentType != 'colon') {
      process(charIndex, 'colon');

    } else if(currentChar.match(/;/) && currentType != 'semicolon') {
      process(charIndex, 'semicolon');

    } else if(currentChar.match(/=/) && currentType != 'equal') {
      process(charIndex, 'equal');

    } else if(currentChar.match(/\./) && currentType != 'dot') {
      process(charIndex, 'dot');

    } else if(currentChar.match(/,/) && currentType != 'comma') {
      process(charIndex, 'comma');

    } else if(currentChar.match(/\(/) && currentType != 'bracket_L') {
      process(charIndex, 'bracket_L');

    } else if(currentChar.match(/\)/) && currentType != 'bracket_R') {
      process(charIndex, 'bracket_R');

    } else if(currentChar.match(/\{/) && currentType != 'curly_bracket_L') {
      process(charIndex, 'curly_bracket_L');

    } else if(currentChar.match(/\}/) && currentType != 'curly_bracket_R') {
      process(charIndex, 'curly_bracket_R');

    } if(currentChar.match(/</) && currentType != 'angle_bracket_L') {
      process(charIndex, 'angle_bracket_L');

    } else if(currentChar.match(/>/) && currentType != 'angle_bracket_R') {
      process(charIndex, 'angle_bracket_R');

    } else if(currentChar.match(/@/) && currentType != 'annotation') {
      process(charIndex, 'annotation');

    } else if(currentChar.match(/\?/) && currentType != 'question_mark') {
      process(charIndex, 'question_mark');

    } else if(currentChar.match(/\-/) && currentType != 'hyphen') {
      process(charIndex, 'hyphen');

    } else if(currentChar.match(/\+|\*|%|\||\!/) && currentType != 'other_operator') {
      process(charIndex, 'other_operator');

    }
    // #endregion

  }

  // 余り
  if(lastIndex != inputString.length) {
    result.push({splitedString: inputString.slice(lastIndex, inputString.length), type: currentType});
  }

  return result;

}

/** タイプ修正
 * @param {{splitedString: string, type: string|undefined}[]} tokenList
 */
function correctTypes(tokenList) {
  
  /** スペースのトークンを除いたもの; 元のインデックスを参照できる
   * @type {{splitedString: string, type: string|undefined, id: number}[]}
   * */
  let tokenListNoSpace = [];

  for(let tokenObjIndex = 0; tokenObjIndex < tokenList.length; tokenObjIndex++) {
    if(tokenList[tokenObjIndex].type != 'spaces') {
      tokenList[tokenObjIndex].id = tokenObjIndex;
      tokenListNoSpace.push(tokenList[tokenObjIndex]);
    }
  }

  /** インデックスを遡る処理
   * @param {number} tokenObjIndex
   * @param {boolean} forFunction
   */
  function backProcess(tokenObjIndex, forFunction=false) {
    let count = 1;

    // ジェネリクス用
    let angleBracketFloor = 0;

    while(count < 50) {
      count++;
      const targetToken = tokenListNoSpace[tokenObjIndex - count];

      if(['text', 'bold_text'].includes(targetToken.type)) {
        tokenList[tokenListNoSpace[tokenObjIndex - count].id].type = 'type';

      } else if(targetToken.type == 'dot' && !forFunction) {
        tokenList[tokenListNoSpace[tokenObjIndex - count].id].type = 'type';
        continue;

      } else if(targetToken.type == 'angle_bracket_L') {
        angleBracketFloor -= targetToken.splitedString.length;
        continue;

      } else if(targetToken.type == 'angle_bracket_R') {
        angleBracketFloor += targetToken.splitedString.length;
        continue;

      } else if(angleBracketFloor > 0 && targetToken.type == 'keyword' && targetToken.splitedString == 'extends') {
        continue;

      } else if(angleBracketFloor > 0 && targetToken.type == 'question_mark') {
        continue;

      } else if(angleBracketFloor > 0 && targetToken.type == 'comma') {
        continue;

      } else if(targetToken.type == 'bracket_L' || targetToken.type == 'bracket_R') {
        continue;

      } else break;
    }
  }

  // (空白を除いた)隣接するトークンに基づくタイプの修正
  for(let tokenObjIndex = 0; tokenObjIndex < tokenListNoSpace.length; tokenObjIndex++) {
    const tokenObj = tokenListNoSpace[tokenObjIndex];
    const getObj = offset => tokenListNoSpace[tokenObjIndex + offset];

    if(tokenObj.type == 'bracket_L' && getObj(-1)?.type == 'text') {
      tokenList[getObj(-1).id].type = 'function';
      backProcess(tokenObjIndex, true);

    } else if(tokenObj.type == 'number') {

      // 小数点
      if(getObj(-1)?.type == 'dot') {
        tokenList[getObj(-1).id].type = 'number';
      }

      // マイナス
      if(getObj(-1)?.type == 'hyphen' && getObj(-1)?.id == tokenObj.id - 1) {
        tokenList[getObj(-1).id].type = 'number';
      }

      // 小数(短縮表現)とマイナス
      if(getObj(-2)?.type == 'hyphen' && getObj(-1)?.type == 'dot' && getObj(-2)?.id == tokenObj.id - 2) {
        tokenList[getObj(-2).id].type = 'number';
      }

      // floatとlong
      if(['text', 'bold_text'].includes(getObj(1)?.type)) {

        if(!getObj(1)?.splitedString.match(/^[fFlL]$/)) continue;
        tokenList[getObj(1).id].type = 'number';
      }

    } else if(tokenObj.type == 'text' && tokenObj.splitedString.toUpperCase() == tokenObj.splitedString) {
      tokenList[tokenObj.id].type = 'bold_text';

    } else if(['equal', 'colon', 'comma', 'bracket_R', 'semicolon'].includes(tokenObj.type) && ['text', 'bold_text'].includes(getObj(-1)?.type) && getObj(-2)?.id == getObj(-1)?.id - 2) {
      backProcess(tokenObjIndex);

    } else if(tokenObj.type == 'annotation' && getObj(1)?.type == 'text' && getObj(1).id == tokenObj.id + 1) {
      tokenList[getObj(1).id].type = 'annotation';

    } else if(tokenObj.type == 'keyword') {
      if(['import', 'package'].includes(tokenObj.splitedString)) {
        let count = 0;

        while(count < 50) {
          count++;
          const targetToken = getObj(count);

          if(targetToken.type == 'semicolon') break;
          tokenList[targetToken.id].type = 'type';
        }

      } else if(['class', 'enum', 'extends', 'implements', 'instanceof', 'interface', 'new'].includes(tokenObj.splitedString)) {
        let count = 0;

        while(count < 50) {
          count++;
          const targetToken = getObj(count);

          if(targetToken.type == 'text') {
            tokenList[targetToken.id].type = 'type';

          } else if(targetToken.type == 'keyword') {
            continue;
            
          } else if(targetToken.type == 'dot') {
            tokenList[targetToken.id].type = 'type';
            continue;
            
          } else break;
        }

      }

    }
  }

  return tokenList;

}

/**
 * @param {{splitedString: string, type: string|undefined}[]} tokenList
 */
function joinDecompedString(tokenList) {
  let result = '';
  for(let decompedString of tokenList) {
    result += `<span class="javahl:${decompedString.type}">${decompedString.splitedString.replace(/</, '&lt;')}</span>`;
  }

  return result;
}
// #endregion

// #region インデントガイド
/**
 * @param {string} inputCode
 */
function indentGuide(inputCode) {
  const lines = inputCode.split('\n');
  /** 行分けされたinnerHTML
   * @type {string[]}
   */
  const resultList = [''];

  let beforeSpaceNum = 0;
  for(let lineIdx=0; lineIdx<lines.length; lineIdx++) {
    const currentLine = lines[lineIdx];
    let spaceNum = currentLine.match(/^( *)/)[1].length;

    if(currentLine.length == 0) spaceNum = beforeSpaceNum;
    
    if(spaceNum > 3) {
      const floorNum = Math.floor(spaceNum/2) - 1;

      let tempResult = '';
      for(let floorIdx=0; floorIdx<floorNum; floorIdx++) {
        const isOdd = floorIdx % 2 == 1;
        let className = 'l' + (isOdd? ' dashed' : '');

        tempResult += `<span style="width: ${2*floorIdx + 2}ch; top: ${lineIdx + 1}lh;" class="${className}"></span>`;
      }

      resultList.push(tempResult);

    } else {
      resultList.push('');
    }

    beforeSpaceNum = spaceNum;

  }

  return resultList.join('<br>');
}
// #endregion


loadSideContent('side_content', 'side_content.html');

onWindowLoad();

// ウィンドウサイズ変更時に更新
window.onresize = onWindowLoad;


// サイドパネル(目次)の自動生成
(function getSections() {
  let [secNo, subsecNo] = [0, 0];

  for(let secElem of qSA('#main_content .sec, #main_content .subsec')) {
    let id = `sec${('00' + secNo).slice(secNo.toString().length)}`;
    let secType = '';
    
    // セクション数のカウントとID生成
    if(secElem.classList.contains('sec')) {
      secNo += 1;
      subsecNo = 0;
      secType = 'sec';
    } else {
      subsecNo += 1;
      id = `sec${('00' + secNo).slice(secNo.toString().length)}sec${('00' + subsecNo).slice(subsecNo.toString().length)}`;
      secType = 'subsec';
    }

    // 各見出しに自動でIDを付ける
    secElem.id = id;

    // メインのもくじに項目を追加
    const mainIndex = getElem('main_index');
    if(mainIndex) {
      const textContent = (secType == 'sec'? secNo : `${secNo}.${subsecNo}`) + secElem.textContent;
      mainIndex.innerHTML += `<div class="index:${secType}" onclick="jumpTo('${id}', -66.7)">${textContent}</div>`
    }

    // サイドバーの目次に項目を追加
    const contentDiv = document.createElement('div');
    contentDiv.className = secType;
    contentDiv.innerHTML = secElem.innerHTML;
    contentDiv.addEventListener('click', ev => {
      jumpTo(id, -66.7);

      if(window.innerWidth/2 < document.querySelector('div.sidebar').clientWidth) {
        /** @type {HTMLInputElement} */
        const sidebarSwitch = getElem('sidebar_switch');
        sidebarSwitch.checked = !sidebarSwitch.checked;
      }
    });

    getElem('index_content')?.appendChild(contentDiv);

  }

})();

// 目次の初期状態
(function initialIndexState() {
  const sidebarSwitch = getElem('sidebar_switch');

  if(sidebarSwitch == undefined) return;

  if(sessionStorage['sidebar_switch'] == undefined) {
    if(window.innerWidth > 650) sidebarSwitch.checked = true;
  }

  if(sessionStorage['sidebar_switch'] == 'true') sidebarSwitch.checked = true;

  sidebarSwitch.addEventListener('change', ev => {
    sessionStorage['sidebar_switch'] = sidebarSwitch.checked;
  });

})();

// スポイラー効果
qSA('span.spoiler').forEach(spanElem => {

  spanElem.addEventListener('click', ev => {
    const isOpen = spanElem.classList.contains('open');
    spanElem.classList[isOpen? 'remove' : 'add']('open');

  });

});

// JSON
qSA('code.json').forEach(codeElem => {
  const decompedText = strComDecomp(codeElem.textContent);
  attrCheck(decompedText);
  codeElem.innerHTML = join(decompedText);
});

// Javaハイライト
qSA('code.java').forEach(codeElem => {
  codeElem.innerHTML = joinDecompedString(correctTypes(strDecomp(codeElem.textContent)));
});

// Molangハイライト
qSA('code.molang').forEach(codeElem => {
  const originalText = codeElem.textContent;
  const color = {
    'var': '#1b00c9',
    math: '#00b7ad',
    q: '#ff5900',
    str: '#e70000',
    kw: '#aa00e2',
    num: '#0a0'
  };

  // 数値
  let innerHTML = originalText.replace(/(\-?\d+(.\d+)?)/g,
    `<span style="color: ${color.num}">$1</span>`
  );

  // var
  innerHTML = innerHTML.replace(/(v(ariable)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${color.var}">$1</span>`
  );
  // temp
  innerHTML = innerHTML.replace(/(t(emp)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${color.var}">$1</span>`
  );
  // context
  innerHTML = innerHTML.replace(/(c(ontext)?\.[a-zA-Z0-9_\.]+)/g,
    `<span style="color: ${color.var}">$1</span>`
  );

  // math
  innerHTML = innerHTML.replace(/(math\.[a-zA-Z0-9_]+)/g,
    `<span style="color: ${color.math}">$1</span>`
  );

  // query
  innerHTML = innerHTML.replace(/(q(uery)?\.[a-zA-Z0-9_]+)/g,
    `<span style="color: ${color.q}">$1</span>`
  );

  // 文字列
  innerHTML = innerHTML.replace(/('.+?')/g,
    `<span style="color: ${color.str}">$1</span>`
  );

  // keywords
  innerHTML = innerHTML.replace(/(return|for_each|loop|continue|break)/g,
    `<span style="color: ${color.kw}">$1</span>`
  );

  codeElem.innerHTML = innerHTML;

});

// langハイライト
qSA('code.lang').forEach(codeElem => {
  const originalText = codeElem.textContent;

  // 全体
  let innerHTML = originalText.replace(/(.+)=([^ \n\t]+)/g,
    '<span class="langhl:attr">$1</span>=<span class="langhl:val">$2</span>'
  );

  // コメント
  innerHTML = innerHTML.replace(/(?<!~)#(?!~)(.+)/g,
    '<span class="langhl:comment">#$1</span>'
  );

  codeElem.innerHTML = markerTrans(innerHTML);

});

// mcfunctionハイライト
qSA('code.mcfunction').forEach(codeElem => {
  const originalText = codeElem.textContent;

  /** @type {{part: string, type: 'comment'|'selector'|'other'}[]} */
  let splitedTexts = [];
  let isInComment = false;
  let isInSlector = false;
  let lastIndex = 0;

  for(let i=0; i<originalText.length; i++) {
    if(originalText[i] == '#' && !isInComment) { // コメント開始

      splitedTexts.push({part: originalText.slice(lastIndex, i), type: 'other'});
      isInComment = true;
      lastIndex = i;

    } else if(originalText[i] == '\n' && isInComment) { // コメント終了

      splitedTexts.push({part: originalText.slice(lastIndex, i), type: 'comment'});
      isInComment = false;
      lastIndex = i;

    } else if(originalText[i] == '[' && !isInSlector) { // セレクター開始

      splitedTexts.push({part: originalText.slice(lastIndex, i), type: 'other'});
      isInSlector = true;
      lastIndex = i;

    } else if(originalText[i] == ']' && isInSlector) { // セレクター終了

      splitedTexts.push({part: originalText.slice(lastIndex, i + 1), type: 'selector'});
      isInSlector = false;
      lastIndex = i + 1;

    }
  }

  // 残り
  if(lastIndex != originalText.length - 1) {
    splitedTexts.push({part: originalText.slice(lastIndex, originalText.length), type: 'other'});
  }

  codeElem.innerHTML = '';

  splitedTexts.forEach(splitedTextObj => {
    if(splitedTextObj.type == 'comment') { // コメント

      codeElem.innerHTML += `<span class="mcfunction:comment">${splitedTextObj.part}</span>`;

    } else if(splitedTextObj.type == 'selector') { // セレクタ

      codeElem.innerHTML += `${splitedTextObj.part.replace(/([a-z]+)=(\!?)(.+?)(,|\])/g,
        '<span class="mcfunction:selector_attr">$1=</span><span class="mcfunction:selector_not">$2</span><span class="mcfunction:selector_val">$3</span>$4'
      )
      .replace(/( \\\n)/g,
        '<span class="mcfunction:br">$1</span>'
      )}`;

    } else {

      // コマンド
      let result = splitedTextObj.part.replace(
        /(^|\n|run )(\?|ability|advancement|alwaysday|attribute|ban|ban\-ip|banlist|bossbar|camerashake|changesetting|clear|clearspawnpoint|clone|connect|damage|data|datapack|daylock|debug|dedicatedwssever|defaultgamemode|deop|dialogue|difficulty|effect|enchant|event|execute|experience|fill|fillbiome|fog|forceload|function|gamemode|gamerule|gametest|give|help|immutableworld|item|jfr|kick|kill|list|locate|loot|me|mobevent|msg|music|op|ops|pardon|pardon\-ip|particle|perf|permission|place|playanimation|playsound|publish|random|recipe|reload|rmove|replaceitem|return|ride|rotate|save|save\-all|save\-off|save\-on|say|schedule|scoreboard|seed|setblock|setidletimeout|setmaxplayers|setworldspawn|spawnpoint|spectate|spreadplayers|stop|stopsound|structure|summon|tag|team|teammsg|teleport|tell|tellraw|testfor|testforblock|testforblocks|tickingarea|time|title|titleraw|tm|toggledownfall|tp|transfar|trigger|w|wb|weather|whitelist|worldborder|worldbuilder|wsserver|xp)(?![a-z_0-9])/g,
        '$1<span class="mcfunction:cmd">$2</span>'
      );

      // セレクタ
      result = result.replace(/@([a-z])/g,
        '<span class="mcfunction:selector">@$1</span>'
      );

      // 座標
      result = result.replace(/(?<![a-z])(~?-?\d|~)(?![a-z])/g,
        '<span class="mcfunction:num">$1</span>'
      );

      // 改行
      result = result.replace(/( \\\n)/g,
        '<span class="mcfunction:br">$1</span>'
      );

      // セクション
      result = result.replace(/§([0-9a-z])/g,
        '<span class="mcfunction:section">§$1</span>'
      );

      codeElem.innerHTML += result;
    }
  });

});

// #region Rich Code Style
const richCodeElems = qSA('div.rich_code');
for(let mainDivIdx=0; mainDivIdx<richCodeElems.length; mainDivIdx++) {
  const mainDiv = richCodeElems[mainDivIdx];
  const buttons = mainDiv.querySelector('div.rich_code\\:tab div.rich_code\\:buttons');
  const switchTabDiv = mainDiv.querySelector('div.rich_code\\:switch_tab');
  /** @type {HTMLElement} */
  const contentDiv = mainDiv.querySelector('div.rich_code\\:content');
  const markerContainerDiv = mainDiv.querySelector('div.rich_code\\:marker_container');
  /** @type {HTMLElement} */
  const dispAllButton = buttons.querySelector('button.rich_code\\:disp_all');
  const copyButton = buttons.querySelector('button.rich_code\\:copy');

  // 全て表示ボタンのチェックボックス
  let checkBox = document.createElement('input');
  checkBox.setAttribute('type', 'checkbox');
  checkBox.style.display = 'none';
  checkBox.id = `rich_code:cb${mainDivIdx}`;
  dispAllButton.after(checkBox);

  // 全て表示ボタン
  dispAllButton.addEventListener('click', ev => {
    checkBox.checked = !checkBox.checked;
    contentDiv.style.maxHeight = checkBox.checked? 'unset' : '60vh';
    dispAllButton.style.backgroundColor = checkBox.checked? 'hsl(175, 100%, 50%)' : '#fff';
    dispAllButton.style.fontWeight = checkBox.checked? 'bold' : 'unset';
  });

  contentDiv.querySelector('code').classList.add('selected');

  // コードコピーボタン
  copyButton.addEventListener('click', ev => {
    copyText_Old(contentDiv.querySelector('code.selected'));
  });

  const codeContents = contentDiv.querySelectorAll('code');
  for(let codeElemIdx=0; codeElemIdx<codeContents.length; codeElemIdx++) {
    const codeElem = codeContents[codeElemIdx];
    codeElem.id = `richcode:code${mainDivIdx}-${codeElemIdx}`;

    // インデントガイド
    let indentGuideDiv = document.createElement('div');
    indentGuideDiv.className = 'rich_code:indent_guide no-select';
    indentGuideDiv.innerHTML = indentGuide(codeElem.textContent);

    codeElem.appendChild(indentGuideDiv);

    // マーカー
    const markerDiv = markerContainerDiv?.children[0];
    if(markerDiv) {
      markerDiv.innerHTML = borderTrans(markerDiv.innerHTML);
      markerDiv.innerHTML = markerTrans(markerDiv.innerHTML);
      codeElem.appendChild(markerDiv);
    }

    const switchTab = switchTabDiv?.children.item(codeElemIdx);
    if(switchTab) {
      switchTab.addEventListener('click', ev => {
        codeContents.forEach(codeElem => {
          const isMatchedId = codeElem.id == `richcode:code${mainDivIdx}-${codeElemIdx}`;
          codeElem.style.display = isMatchedId? 'block' : 'none';

          codeElem.classList[isMatchedId? 'add' : 'remove']('selected');
        });

        [...switchTabDiv.children].forEach(tabElem => {
          tabElem.classList[switchTab.isEqualNode(tabElem)? 'add' : 'remove']('selected');
          
        });
        
      });
      
    }
  }
}
// #endregion
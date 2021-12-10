window_load(); //読み込み時の表示
window.onresize = window_load; //ウィンドウサイズ変更時に更新
function window_load() {
  if (window.innerWidth > window.innerHeight+100) {  //pc
    document.querySelectorAll("#whole")[0].style.display = "flex";
    document.querySelectorAll("#main")[0].style.width = "60vw";
    document.querySelectorAll("#main")[0].style.marginLeft = "4em";
    document.querySelectorAll("#sidebar")[0].style.margin = "0em 2em 0em 0em";
  } else {  //phone
    document.querySelectorAll("#whole")[0].style.display = "inline";
    document.querySelectorAll("#main")[0].style.width = "90%";
    document.querySelectorAll("#main")[0].style.margin = "0em 0em 0em 1em";
    document.querySelectorAll("#sidebar")[0].style.margin = "0em 1em";
  }
}

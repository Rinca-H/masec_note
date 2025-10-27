function getElem(id) {
  return document.getElementById(id);
}

function jumpTo(elemId, offset = -16) {
  const target = getElem(elemId);

  if(target) getElem('main').scrollBy(0, target.getBoundingClientRect().top + offset);
}

function onResizeWindow() {
  const vw = window.innerWidth;

  if(vw/2 < 450) {
    document.body.classList.add('mobile');

  } else {
    document.body.classList.remove('mobile');
    getElem('sidebar_ctrl').checked = false;

  }
}

window.onresize = onResizeWindow;

onResizeWindow();

document.querySelectorAll('.jump_button').forEach(q => {
  q.addEventListener('click', ev => {
    ev.stopPropagation();

    jumpTo(q.getAttribute('jumpto'));
    getElem('sidebar_ctrl').checked = false;

    if(q.matches('details.sidebar')) {
      ev.preventDefault();
    }
  });
});

document.querySelectorAll('div.fold_button').forEach(q => {
  q.addEventListener('click', ev => {
    ev.stopPropagation();
    ev.preventDefault();

    const detailsElem = q.parentElement.parentElement;
    const isOpen = detailsElem.hasAttribute('open');
    detailsElem.open = !isOpen;
  });
});
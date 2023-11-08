export function dialogReposition(dlg) {
    if (dlg && dlg.$el && dlg.$el.firstChild) {
        if (dlg.$el.firstChild.style.visibility != 'hidden') {
            dlg.$el.firstChild.style.visibility = 'hidden';
            return;
        }

        let top = (window.innerHeight - dlg.$el.firstChild.offsetHeight) / 2;
        if (top < 0) {
            top = 0;
        }
        dlg.$el.firstChild.style.marginTop = top + 'px'
        dlg.$el.firstChild.style.visibility = 'visible';
    }
}

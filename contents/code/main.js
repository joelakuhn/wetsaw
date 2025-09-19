function untile(win) {
    if (win.tile) {
        console.info(win.caption);
        let x = win.tile.absoluteGeometry.x;
        let y = win.tile.absoluteGeometry.y;
        let width = win.width;
        let height = win.height;
        
        win.frameGeometry = { x, y, width, height };
        win.tile.unmanage(win);
        win.frameGeometry = { x, y, width, height };
    }
}

function bind(win) {
    win.tileChanged.connect(function() {
        untile(win);
    });
}

workspace.windowAdded.connect(function(win) {
    bind(win);
});

for (let win of workspace.windowList()) {
    bind(win);
}


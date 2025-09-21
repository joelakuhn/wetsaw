// CONSTANTS

// Defined in kwin/src/scripting/scripting.h but does not appear to be exposed to scripts
const CLIENT_AREA_OPTION_MAXIMIZEAREA = 2;

// UNTILINING

function untile(win) {
    if (win.tile) {
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

// SCREEN AREA SHORTCUTS

function is_bounded_by(rect1, rect2) {
    return ((rect1.x >= rect2.x) && (rect1.x < (rect2.x + rect2.width)))
        && ((rect1.y >= rect2.y) && (rect1.y < (rect2.y + rect2.height)));
}

function active_panel_geometries(screen_geometry) {
    let panels = [];
    for (let fixed of workspace.windowList()) {
        if (fixed.windowType !== 2) continue;
        if (!is_bounded_by(fixed.frameGeometry, screen_geometry)) continue;
        panels.push(fixed.frameGeometry);
    }

    return panels;
}

function active_screen_for_window(win) {
    let active_screen = workspace.screens[0];
    for (let screen of workspace.screens) {
        if (is_bounded_by(win.frameGeometry, screen.geometry)) {
            active_screen = screen;
            break;
        }
    }
    return active_screen;
}

function geometry_equal(g1, g2) {
    return Math.abs(g1.x - g2.x) < 1
        && Math.abs(g1.y - g2.y) < 1
        && Math.abs(g1.width - g2.width) < 1
        && Math.abs(g1.height - g2.height) < 1;
}

function resize_window_geometry(screen_geometry, factors) {
    return {
        x: Math.floor(screen_geometry.x + (factors[0] * screen_geometry.width)),
        y: Math.floor(screen_geometry.y + (factors[1] * screen_geometry.height)),
        width: Math.floor(screen_geometry.width * factors[2]),
        height: Math.floor(screen_geometry.height * factors[3]),
    };
}

function generate_shortcut(name, keys, factors, direction) {
    registerShortcut('Wetsaw - ' + name, 'Wetsaw - ' + name, keys, function() {
        let screen = active_screen_for_window(workspace.activeWindow);
        let screen_geometry = workspace.clientArea(CLIENT_AREA_OPTION_MAXIMIZEAREA, screen, workspace.currentDesktop);
        let window_geometry = resize_window_geometry(screen_geometry, factors[0]);

        if (geometry_equal(window_geometry, workspace.activeWindow.frameGeometry)) {
            let screen_index = workspace.screens.findIndex((s) => {
                return geometry_equal(s.geometry, screen.geometry)
            });
            screen = workspace.screens[(screen_index + direction + workspace.screens.length) % workspace.screens.length];
        let screen_geometry = workspace.clientArea(CLIENT_AREA_OPTION_MAXIMIZEAREA, screen, workspace.currentDesktop);
            window_geometry = resize_window_geometry(screen_geometry, factors[1]);
        }

        workspace.activeWindow.frameGeometry = window_geometry;
    });
}

generate_shortcut('Left Half', '', [ [ 0, 0, .5, 1 ], [ .5, 0, .5, 1 ] ], -1);
generate_shortcut('Right Half', '', [ [ .5, 0, .5, 1 ], [ 0, 0, .5, 1 ] ], 1);
generate_shortcut('Left Two-Thirds', '', [ [ 0, 0, .66666, 1 ], [ .33333, 0, .66666, 1 ] ], -1);
generate_shortcut('Right Two-Thirds', '', [ [ .33333, 0, .66666, 1 ], [ 0, 0, .66666, 1 ] ], 1);

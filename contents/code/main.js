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

function resize_window_geometry(window, screen_geometry, factors) {
    let window_geometry = {
        x: window.frameGeometry.x,
        y: window.frameGeometry.y,
        width: window.frameGeometry.width,
        height: window.frameGeometry.height,
    };
    if ('x' in factors)
        window_geometry.x = Math.floor(screen_geometry.x + (factors.x * screen_geometry.width));
    if ('y' in factors)
        window_geometry.y = Math.floor(screen_geometry.y + (factors.y * screen_geometry.height));
    if ('width' in factors)
        window_geometry.width = Math.floor(screen_geometry.width * factors.width);
    if ('height' in factors)
        window_geometry.height = Math.floor(screen_geometry.height * factors.height);

    return window_geometry;
}

function next_screen(current_screen, direction) {
    let n_screens = workspace.screens.length;
    for (let i = 0; i < n_screens; i++) {
        if (geometry_equal(current_screen.geometry, workspace.screens[i].geometry)) {
            return workspace.screens[(i + direction + n_screens) % n_screens];
        }
    }
    return current_screen;
}

function clientArea(screen) {
    return workspace.clientArea(CLIENT_AREA_OPTION_MAXIMIZEAREA, screen, workspace.currentDesktop);
}

function generate_shortcut(name, keys, direction, factors) {
    registerShortcut('Wetsaw - ' + name, 'Wetsaw - ' + name, keys, function() {
        let window = workspace.activeWindow;
        let screen = active_screen_for_window(window);
        let screen_geometry = clientArea(screen);
        let window_geometry = resize_window_geometry(window, screen_geometry, factors[0]);

        if (direction !== 0 && geometry_equal(window_geometry, window.frameGeometry)) {
            screen = next_screen(screen, direction);
            let screen_geometry = clientArea(screen);
            window_geometry = resize_window_geometry(window, screen_geometry, factors[1]);
        }

        workspace.activeWindow.frameGeometry = window_geometry;
    });
}

generate_shortcut('Left Half', '', -1, [
    { x: 0,      y: 0,      width: .5,     height: 1 },
    { x: .5,     y: 0,      width: .5,     height: 1 },
]);
generate_shortcut('Right Half', '', 1, [
    { x: .5,     y: 0,      width: .5,     height: 1 },
    { x: 0,      y: 0,      width: .5,     height: 1 },
]);
generate_shortcut('Left Two-Thirds', '', -1, [
    { x: 0,      y: 0,      width: .66666, height: 1 },
    { x: .33333, y: 0,      width: .66666, height: 1 },
]);
generate_shortcut('Right Two-Thirds', '', 1, [
    { x: .33333, y: 0,      width: .66666, height: 1 },
    { x: 0,      y: 0,      width: .66666, height: 1 },
]);
generate_shortcut('Fill Vertically', '', 0, [
    {            y: 0,                     height: 1 },
]);

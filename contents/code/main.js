// Defined in kwin/src/scripting/scripting.h but does not appear to be exposed to scripts
const CLIENT_AREA_OPTION_MAXIMIZEAREA = 2;

class Untiler {
    static untile(win) {
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

    static bind(win) {
        win.tileChanged.connect(function() {
            Untiler.untile(win);
        });
    }

    static init() {
        workspace.windowAdded.connect(function(win) {
            Untiler.bind(win);
        });

        for (let win of workspace.windowList()) {
            Untiler.bind(win);
        }
    }
}

class Rect {
    constructor(reference) {
        this.x = reference.x;
        this.y = reference.y;
        this.width = reference.width;
        this.height = reference.height;
    }

    static eq(rect1, rect2) {
        return Math.abs(rect1.x - rect2.x) < 1
            && Math.abs(rect1.y - rect2.y) < 1
            && Math.abs(rect1.width - rect2.width) < 1
            && Math.abs(rect1.height - rect2.height) < 1;
    }

    static is_bounded_by(rect1, rect2) {
        return ((rect1.x >= rect2.x) && (rect1.x < (rect2.x + rect2.width)))
            && ((rect1.y >= rect2.y) && (rect1.y < (rect2.y + rect2.height)));
    }
}

class Snapper {
    static active_screen_for_window(win) {
        let active_screen = workspace.screens[0];
        for (let screen of workspace.screens) {
            if (Rect.is_bounded_by(win.frameGeometry, screen.geometry)) {
                active_screen = screen;
                break;
            }
        }
        return active_screen;
    }

    static resize_window_geometry(window, screen_geometry, factors) {
        let window_geometry = new Rect(window.frameGeometry);

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

    static next_screen(current_screen, direction) {
        let n_screens = workspace.screens.length;
        for (let i = 0; i < n_screens; i++) {
            if (Rect.eq(current_screen.geometry, workspace.screens[i].geometry)) {
                return workspace.screens[(i + direction + n_screens) % n_screens];
            }
        }
        return current_screen;
    }

    static clientArea(screen) {
        return workspace.clientArea(CLIENT_AREA_OPTION_MAXIMIZEAREA, screen, workspace.currentDesktop);
    }

    static snap(window, direction, factors) {
            let screen = Snapper.active_screen_for_window(window);
            let screen_geometry = Snapper.clientArea(screen);
            let window_geometry = Snapper.resize_window_geometry(window, screen_geometry, factors[0]);

            if (direction !== 0 && Rect.eq(window_geometry, window.frameGeometry)) {
                screen = Snapper.next_screen(screen, direction);
                let screen_geometry = Snapper.clientArea(screen);
                window_geometry = Snapper.resize_window_geometry(window, screen_geometry, factors[1]);
            }

            window.setMaximize(false, false);
            window.frameGeometry = window_geometry;
    }

    static generate_shortcut(name, direction, factors) {
        registerShortcut('Wetsaw - ' + name, 'Wetsaw - ' + name, '', function() {
            Snapper.snap(workspace.activeWindow, direction, factors);
        });
    }
}

Untiler.init();

Snapper.generate_shortcut('Left Half', -1, [
    { x: 0,      y: 0,      width: .5,     height: 1 },
    { x: .5,     y: 0,      width: .5,     height: 1 },
]);
Snapper.generate_shortcut('Right Half', 1, [
    { x: .5,     y: 0,      width: .5,     height: 1 },
    { x: 0,      y: 0,      width: .5,     height: 1 },
]);
Snapper.generate_shortcut('Left Two-Thirds', -1, [
    { x: 0,      y: 0,      width: .66666, height: 1 },
    { x: .33333, y: 0,      width: .66666, height: 1 },
]);
Snapper.generate_shortcut('Right Two-Thirds', 1, [
    { x: .33333, y: 0,      width: .66666, height: 1 },
    { x: 0,      y: 0,      width: .66666, height: 1 },
]);
Snapper.generate_shortcut('Fill Vertically', 0, [
    {            y: 0,                     height: 1 },
]);

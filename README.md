# Wetsaw

Wetsaw is a KWin script that untiles windows as soon as they are tiled. In the context of KDE, the tiling system is a session-persistent grid layout that changes as windows are snapped and resized. For instance, if you snap a window to the right-half of the screen, and resize it, future right snaps will match the last resized window area, and left snaps will match the remaining area. I hate this.

Additionally, it provides keyboard shortcuts for positioning windows on the right and left halves and two-thirds of the screen. It supports multiple monitors, and if a window is already positioned at the at the new position on the screen, it will move to the next monitor at that position.

## Why

On smaller screens, desktop applications often don't scale well to less than half of the screen. Additionally, I have poor eyesight, and cannot reduce screen scaling to the extent that tiling makes sense for me.

I often want to have one window at two-thirds over top of another window, so I can peak at information on that window without it being squeezed into an awkward layout. The current behavior of kde, where snapped windows resize each other is frustrating for this use case. If you resize a window, all future windows snapped to the other side, will only take up the remaining space.

It also leaves the user without a consistent experience. The size a window snaps to is entirely dependent on the size of the last window that was resized, which may have been a one-off resize to deal with a layout issue, to see everything on one line, etc. I find it very frustrating, and even more frustrating is the fact that you can't turn it off.
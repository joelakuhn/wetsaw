#!/usr/bin/env bash

# Uninstall previous version if it exists
if kpackagetool6 --type=KWin/Script -s wetsaw | grep -q 'wetsaw'; then
  kpackagetool6 --type=KWin/Script -r wetsaw
fi

# Install the current version
kpackagetool6 --type=KWin/Script -i .

# Enable the script
kwriteconfig6 --file kwinrc --group Plugins --key wetsawEnabled true

# Reload KWin scripts to apply changes
if which qdbus &> /dev/null; then
  qdbus org.kde.KWin /Scripting unloadScript wetsaw > /dev/null
  qdbus org.kde.KWin /Scripting start > /dev/null
else
  echo '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';
  echo '!! qdbus is required for reloading KWin scripts.       !!';
  echo '!! Please disable/re-enable wetsaw in:                 !!';
  echo '!! System Settings > Window Management > KWin Scripts. !!';
  echo '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!';
fi

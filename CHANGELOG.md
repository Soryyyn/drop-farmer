# Changelog

## Version 1.0.0-beta49
### New features
- Streams will now wait and not skip ads.
- New setting to automatically set the lowest possible resolution on all
  streams.

### Changes
- Updated dashboard layout,
- Removed some transparent components to opaque colors to prevent rendering glitches.
- Changed some colors to gradients.

### Bug fixes
- Fixed a bug, where the app would try to launch again even if it already was
  running.
- Fixed a bug, where updating to a new version with new/removed settings would
  crash the app.
- Fixed a bug, where the schedule check would still run even if the farm was
  previously disabled.

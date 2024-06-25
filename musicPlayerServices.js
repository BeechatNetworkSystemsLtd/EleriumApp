// import TrackPlayer, {
//   AppKilledPlaybackBehavior,
//   Capability,
//   Event,
//   RepeatMode,
// } from "react-native-track-player";

export async function setupPlayer() {
  let isSetup = false;

  try {
    await TrackPlayer.getActiveTrackIndex();
    isSetup = true;
  } catch (error) {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [Capability.Play, Capability.Pause],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
    isSetup = true;
  } finally {
    return isSetup;
  }
}
export async function addTrack() {
  // await TrackPlayer.setRepeatMode(RepeatMode.Track);
}
export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log("Event.RemotePlay");
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log("Event.RemotePause");
    TrackPlayer.pause();
  });
}

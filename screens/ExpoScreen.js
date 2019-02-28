/**
 * @flow
 */

import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  Slider,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import Expo, { Asset, Audio, Constants, FileSystem, Font, Permissions } from 'expo';
// import { FontAwesome } from '@expo/vector-icons';

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

const ICON_RECORD_BUTTON = new Icon(require('../assets/images/record_button.png'), 70, 119);
const ICON_RECORDING = new Icon(require('../assets/images/record_icon.png'), 20, 14);

const ICON_PLAY_BUTTON = new Icon(require('../assets/images/play_button.png'), 34, 51);
const ICON_PAUSE_BUTTON = new Icon(require('../assets/images/pause_button.png'), 34, 51);
const ICON_STOP_BUTTON = new Icon(require('../assets/images/stop_button.png'), 22, 22);

const ICON_MUTED_BUTTON = new Icon(require('../assets/images/muted_button.png'), 67, 58);
const ICON_UNMUTED_BUTTON = new Icon(require('../assets/images/unmuted_button.png'), 67, 58);

const ICON_TRACK_1 = new Icon(require('../assets/images/track_1.png'), 166, 5);
const ICON_THUMB_1 = new Icon(require('../assets/images/thumb_1.png'), 18, 19);
const ICON_THUMB_2 = new Icon(require('../assets/images/thumb_2.png'), 15, 19);

const ICON_RECORD_SIZE = 60;
const TITLE_SIZE = 25;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

export default class ExpoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.currentRecording = null;
    this.recordings = [];
    this.currentSound = null;
    this.sounds = [];
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      currentSoundPosition: null,
      currentSoundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
    };
    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    (async () => {
      await Font.loadAsync({
        'space-mono-regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
    console.log(FileSystem.documentDirectory);
    console.log(FileSystem.cacheDirectory);
  }

  componentDidUpdate() {
    //console.log(this.state)
    // console.log('Component Updated!')
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      this.setState({
        currentSoundDuration: status.durationMillis,
        currentSoundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        currentSoundDuration: null,
        currentSoundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = status => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true,
    });
    // if (this.currentSound !== null) {
    //   await this.currentSound.unloadAsync();
    //   this.currentSound.setOnPlaybackStatusUpdate(null);
    //   this.currentSound = null;
    // }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.currentRecording = recording;
    this.recordings.push(this.currentRecording);
    await this.currentRecording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });

    try {
      await this.currentRecording.stopAndUnloadAsync();
    } catch (error) {
      console.log(error);
    }
    console.log(this.currentRecording.getURI());
    const info = await FileSystem.getInfoAsync(this.currentRecording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false

    });
    const { sound, status } = await this.currentRecording.createNewLoadedSoundAsync(
      {
        isLooping: false,
        shouldPlay: false,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
  
    this.currentSound = sound;
    this.sounds.push(sound);

    this.setState({
      isLoading: false,
    });
  }

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _onPlayPausePressed = () => {
    if (this.currentSound != null) {
      if (this.state.isPlaying) {
        this.currentSound.pauseAsync();
      } else {
        this.currentSound.playAsync();
      }
    }
  };

  _onStopPressed = () => {
    if (this.currentSound != null) {
      this.currentSound.stopAsync();
    }
  };

  _onMutePressed = () => {
    if (this.currentSound != null) {
      this.currentSound.setIsMutedAsync(!this.state.muted);
    }
  };

  _onVolumeSliderValueChange = value => {
    if (this.currentSound != null) {
      this.currentSound.setVolumeAsync(value);
    }
  };

  _trySetRate = async (rate, shouldCorrectPitch) => {
    if (this.currentSound != null) {
      try {
        await this.currentSound.setRateAsync(rate, shouldCorrectPitch);
      } catch (error) {
        // Rate changing could not be performed, possibly because the client's Android API is too old.
      }
    }
  };

  _onRateSliderSlidingComplete = async value => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  _onPitchCorrectionPressed = async value => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  _onSeekSliderValueChange = value => {
    if (this.currentSound != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.currentSound.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this.currentSound != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.currentSoundDuration;
      if (this.shouldPlayAtEndOfSeek) {
        this.currentSound.playFromPositionAsync(seekPosition);
      } else {
        this.currentSound.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.currentSound != null &&
      this.state.currentSoundPosition != null &&
      this.state.currentSoundDuration != null
    ) {
      return this.state.currentSoundPosition / this.state.currentSoundDuration;
    }
    return 0;
  }

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return '0' + string;
      }
      return string;  
    }; 
    return padWithZero(minutes) + ':' + padWithZero(seconds);
  }

  _getPlaybackTimestamp() {
    if (
      this.currentSound != null &&
      this.state.currentSoundPosition != null &&
      this.state.currentSoundDuration != null
    ) {
      return `${this._getMMSSFromMillis(this.state.currentSoundPosition)} / ${this._getMMSSFromMillis(
        this.state.currentSoundDuration
      )}`;
    }
    return ''; 
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  async _playAndPauseSound(sound) {
    let status = await sound.getStatusAsync();
    if(sound !== null){
      if(this.state.isPlaying){
        sound.pauseAsync();
      }
      else{
        if(status.positionMillis === status.durationMillis){ //sound is over
          sound.replayAsync();
        }
        else{ //sound is not over
          sound.playAsync();
        }
      }
    }
  }

  _renderSoundBoxes() { 
    return (
      this.sounds.length === 0 ? (
        <View>
          <Text>No elements yet!</Text>
        </View>
      ) : (
     
        this.sounds.map((sound, key) => (
          <View key={key} style={styles.card}>
          <TouchableOpacity style={styles.button} onPress={() => this._playAndPauseSound(sound)}>
          <Text style={styles.buttonText}>
            {key}
          </Text>
        </TouchableOpacity>
        </View>
        ))  
      )
    );
  }

  render() {
    return !this.state.fontLoaded ? (
      <View style={styles.emptyContainer} />
    ) : !this.state.haveRecordingPermissions ? (
      <View style={styles.container}>
        <View />
        <Text style={[styles.noPermissionsText, { fontFamily: 'space-mono-regular' }]}>
          You must enable audio recording permissions in order to use this app.
        </Text>
        <View />
      </View>
    ) : (
          <View style={styles.container}>
            <View style={styles.topHalfContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Recording Screen</Text>
              </View>
              <View style={styles.cardsContainer}>
                {this._renderSoundBoxes()}
              </View>
              
            </View>
            <View style={styles.bottomHalfContainer}>
              <View style={styles.playbackContainer}>
                <Slider
                  style={styles.playbackSlider}
                  trackImage={ICON_TRACK_1.module}
                  thumbImage={ICON_THUMB_1.module}
                  value={this._getSeekSliderPosition()}
                  onValueChange={this._onSeekSliderValueChange}
                  onSlidingComplete={this._onSeekSliderSlidingComplete}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                />
                <Text style={[styles.playbackTimestamp, { fontFamily: 'space-mono-regular' }]}>
                  {this._getPlaybackTimestamp()}
                </Text>
              </View>
              {/* <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
                <View style={styles.playStopContainer}>
                  <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onMutePressed}
                    disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                    <Image
                      style={styles.image}
                      source={this.state.muted ? ICON_MUTED_BUTTON.module : ICON_UNMUTED_BUTTON.module}
                    />
                  </TouchableHighlight>
                  <Slider
                    style={styles.volumeSlider}
                    trackImage={ICON_TRACK_1.module}
                    thumbImage={ICON_THUMB_2.module}
                    value={1}
                    onValueChange={this._onVolumeSliderValueChange}
                    disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                  />
                </View>
                <View style={styles.playStopContainer}>
                  <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                    <Image
                      style={styles.image}
                      source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module}
                    />
                  </TouchableHighlight>
                  <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    
                    disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                    <Image style={styles.image} source={ICON_STOP_BUTTON.module} />
                  </TouchableHighlight>
                </View>
                <View />
              </View> */}
              {/* <View style={[styles.buttonsContainerBase]}> */}
              <View style={styles.recordingContainer}>
                {/* <View/> */}
                <View><TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={this._onRecordPressed}
                  disabled={this.state.isLoading}>
                  <FontAwesome name="microphone" size={ICON_RECORD_SIZE} />
                </TouchableHighlight>
                </View>
                <View>
                  <Text style={[styles.liveText, { fontFamily: 'space-mono-regular' }]}>
                    {this.state.isRecording ? 'LIVE' : ''}
                  </Text>
                  <View>
                    <Image
                      style={[styles.image, { opacity: this.state.isRecording ? 1.0 : 0.0 }]}
                      source={ICON_RECORDING.module}
                    />
                    <Text style={{fontFamily:'space-mono-regular'}}>
                      {this._getRecordingTimestamp()}
                    </Text>
                  </View>
                  <View />
                </View>

              </View>
              <View style={[styles.buttonsContainerBase, styles.tabBarInfoContainer]}>
                <Text style={[styles.timestamp, { fontFamily: 'space-mono-regular' }]}>Rate:</Text>
                <Slider
                  style={styles.rateSlider}
                  trackImage={ICON_TRACK_1.module}
                  thumbImage={ICON_THUMB_1.module}
                  value={this.state.rate / RATE_SCALE}
                  onSlidingComplete={this._onRateSliderSlidingComplete}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                />
                <TouchableHighlight
                  underlayColor={BACKGROUND_COLOR}
                  style={styles.wrapper}
                  onPress={this._onPitchCorrectionPressed}
                  disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
                  <Text style={[{ fontFamily: 'space-mono-regular' }]}>
                    PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
                  </Text>
                </TouchableHighlight>
              </View>
              {/* </View> */}
            </View>
          </View>
        )
  }

  // render() {
  //   return !this.state.fontLoaded ? (
  //     <View style={styles.emptyContainer} />
  //   ) : !this.state.haveRecordingPermissions ? (
  //     <View style={styles.container}>
  //       <View />
  //       <Text style={[styles.noPermissionsText, { fontFamily: 'space-mono-regular' }]}>
  //         You must enable audio recording permissions in order to use this app.
  //       </Text>
  //       <View />
  //     </View>
  //   ) : (
  //       // <View>
  //       //     <FontAwesome name = "microphone" size = {20} />
  //       // </View>
  //     <View style={styles.container}>
  //       <View
  //         style={[
  //           styles.halfScreenContainer,
  //           {
  //             opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
  //           },
  //         ]}>
  //         <View />
  //         <View style={styles.recordingContainer}>
  //           <View />
  //           <TouchableHighlight
  //             underlayColor={BACKGROUND_COLOR}
  //             style={styles.wrapper}
  //             onPress={this._onRecordPressed}
  //             disabled={this.state.isLoading}>
  //             <Image style={styles.image} source={ICON_RECORD_BUTTON.module} />
  //           </TouchableHighlight>
  //           <View style={styles.recordingDataContainer}>
  //             <View />
  //             <Text style={[styles.liveText, { fontFamily: 'space-mono-regular' }]}>
  //               {this.state.isRecording ? 'LIVE' : ''}
  //             </Text>
  //             <View style={styles.recordingDataRowContainer}>
  //               <Image
  //                 style={[styles.image, { opacity: this.state.isRecording ? 1.0 : 0.0 }]}
  //                 source={ICON_RECORDING.module}
  //               />
  //               <Text style={[styles.recordingTimestamp, { fontFamily: 'space-mono-regular' }]}>
  //                 {this._getRecordingTimestamp()}
  //               </Text>
  //             </View>
  //             <View />
  //           </View>
  //           <View />
  //         </View>
  //         <View />
  //       </View>
  //       <View
  //         style={[
  //           styles.halfScreenContainer,
  //           {
  //             opacity:
  //               !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0,
  //           },
  //         ]}>
  //         <View />
  //         <View style={styles.playbackContainer}>
  //           <Slider
  //             style={styles.playbackSlider}
  //             trackImage={ICON_TRACK_1.module}
  //             thumbImage={ICON_THUMB_1.module}
  //             value={this._getSeekSliderPosition()}
  //             onValueChange={this._onSeekSliderValueChange}
  //             onSlidingComplete={this._onSeekSliderSlidingComplete}
  //             disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
  //           />
  //           <Text style={[styles.playbackTimestamp, { fontFamily: 'space-mono-regular' }]}>
  //             {this._getPlaybackTimestamp()}
  //           </Text>
  //         </View>
  //         <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
  //           <View style={styles.volumeContainer}>
  //             <TouchableHighlight
  //               underlayColor={BACKGROUND_COLOR}
  //               style={styles.wrapper}
  //               onPress={this._onMutePressed}
  //               disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
  //               <Image
  //                 style={styles.image}
  //                 source={this.state.muted ? ICON_MUTED_BUTTON.module : ICON_UNMUTED_BUTTON.module}
  //               />
  //             </TouchableHighlight>
  //             <Slider
  //               style={styles.volumeSlider}
  //               trackImage={ICON_TRACK_1.module}
  //               thumbImage={ICON_THUMB_2.module}
  //               value={1}
  //               onValueChange={this._onVolumeSliderValueChange}
  //               disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
  //             />
  //           </View>
  //           <View style={styles.playStopContainer}>
  //             <TouchableHighlight
  //               underlayColor={BACKGROUND_COLOR}
  //               style={styles.wrapper}
  //               onPress={this._onPlayPausePressed}
  //               disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
  //               <Image
  //                 style={styles.image}
  //                 source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module}
  //               />
  //             </TouchableHighlight>
  //             <TouchableHighlight
  //               underlayColor={BACKGROUND_COLOR}
  //               style={styles.wrapper}
  //               onPress={this._onStopPressed}
  //               disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
  //               <Image style={styles.image} source={ICON_STOP_BUTTON.module} />
  //             </TouchableHighlight>
  //           </View>
  //           <View />
  //         </View>
  //         <View style={[styles.buttonsContainerBase]}>
  //           <TouchableHighlight
  //             underlayColor={BACKGROUND_COLOR}
  //             style={styles.wrapper} >
  //             <FontAwesome name = "microphone" size = {ICON_RECORD_SIZE} />
  //           </TouchableHighlight>  
  //         </View>
  //         <View style={[styles.buttonsContainerBase, styles.buttonsContainerBottomRow]}>
  //           <Text style={[styles.timestamp, { fontFamily: 'space-mono-regular' }]}>Rate:</Text>
  //           <Slider
  //             style={styles.rateSlider}
  //             trackImage={ICON_TRACK_1.module}
  //             thumbImage={ICON_THUMB_1.module}
  //             value={this.state.rate / RATE_SCALE}
  //             onSlidingComplete={this._onRateSliderSlidingComplete}
  //             disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
  //           />
  //           <TouchableHighlight
  //             underlayColor={BACKGROUND_COLOR}
  //             style={styles.wrapper}
  //             onPress={this._onPitchCorrectionPressed}
  //             disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
  //             <Text style={[{ fontFamily: 'space-mono-regular' }]}>
  //               PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
  //             </Text>
  //           </TouchableHighlight>
  //         </View>
  //         <View />
  //       </View>
  //     </View>
  //   );
  // }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'space-between',
    //alignItems: 'center',
    // alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    // minHeight: DEVICE_HEIGHT,
    // maxHeight: DEVICE_HEIGHT,
    // paddingTop: Constants.statusBarHeight,
    // paddingBottom: 500
  },
  topHalfContainer: {
    flex: 1,
    // minHeight: DEVICE_HEIGHT / 2.0,
    // maxHeight: DEVICE_HEIGHT / 2.0,
    // height: DEVICE_HEIGHT / 2.0,
  },
  bottomHalfContainer: {
    flex: .75,
    // minHeight: DEVICE_HEIGHT / 2.0,
    // maxHeight: DEVICE_HEIGHT / 2.0,
    // height: DEVICE_HEIGHT / 2.0,
    // alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    // minHeight: TITLE_SIZE,
    // maxHeight: TITLE_SIZE,
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight
  },
  titleText: {
    fontSize: TITLE_SIZE
  },
  cardsContainer: {
    flex: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 10,
    marginRight: 10
  },
  card:{
    width: "50%",
    height: "40%",
    alignContent: "stretch"
  },
  microphoneContainer: {
    flex: 1,
    minHeight: ICON_RECORD_SIZE,
    maxHeight: ICON_RECORD_SIZE,
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
    paddingVertical: 1,
  },
  noPermissionsText: {
    textAlign: 'center',
  },
  wrapper: {},
  recordingDataContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: ICON_RECORD_BUTTON.height,
    maxHeight: ICON_RECORD_BUTTON.height,
    minWidth: ICON_RECORD_BUTTON.width * 3.0,
    maxWidth: ICON_RECORD_BUTTON.width * 3.0,
  },
  recordingDataRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: ICON_RECORDING.height,
    maxHeight: ICON_RECORDING.height,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'green'
  },
  buttonsContainerTopRow: {
    maxHeight: ICON_MUTED_BUTTON.height,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'red'
  },
  volumeContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: 'green'
  },
  volumeSlider: {
    width: DEVICE_WIDTH / 2.0 - ICON_MUTED_BUTTON.width,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // alignSelf: 'start',
    // backgroundColor: 'grey'
  },
  rateSlider: {
    width: DEVICE_WIDTH / 2.0,
  },
  button: {
    margin: 5,
    borderRadius: 10,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    backgroundColor: '#fff',
        // width: 100,
        // height: 100
  },
  buttonText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

// Expo.registerRootComponent(ExpoScreen);


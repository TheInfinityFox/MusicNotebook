import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Slider,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import * as Permissions from 'expo-permissions';
import { styles } from '../styles/main';
import { FontAwesome } from '@expo/vector-icons';

import ProjectsPage from '../components/ProjectsPage';
import recordingService from '../services/recordingService';

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

const ICON_RECORDING = new Icon(require('../assets/images/icons8-record-40.png'), 20, 14);
const ICON_RECORD_SIZE = 60;

export default class I1Screen extends Component {
  static navigationOptions = {
    title: 'hi',
  };
  constructor(props) {
    super(props);
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      isPlaybackAllowed: false,
      muted: false,
      soundPosition: null, //current position in the current sound. 
      soundDuration: null, //total duration of the sound. 
      //Need a new variable to keep track of the global time, updated constantly by the updatescsreen function for sound
      globalTime: 0,
      isPlaying: false,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      currentSound: null
    };
    this.project = null;
    
    this.recording = null;
    this.playingSounds = [];
    this.lanes = {};
    this.sounds = {};
    this.currentSoundBeginning = null;

    this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
  }
  


  componentDidMount() {

    (async () => {
      await Font.loadAsync({
        'cutive-mono-regular': require('../assets/fonts/CutiveMono-Regular.ttf'),
        'space-mono-regular': require('../assets/fonts/SpaceMono-Regular.ttf')
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
  }

  /********************************              EXPO FUNCTIONS              *************************************************************** */

  /***************************************************************************************************************************** */
  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        globalTime: (this.currentSoundBeginning + status.positionMillis),
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });

      if (status.didJustFinish)
        this.setState({
          currentSound: null
        });

    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };

  _updateScreenForRecordingStatus = status => {
    //What is status?
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis, //maybe delete
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis, //maybe delete
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true, //TODO: what is isloading
    });
    // TODO: stop all sounds that are playing 


    //TODO: Maybe only do this the first sound


    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    //I think its fine to just have 1 recording at a time
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true,
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    }); //whats the difference between doing this here and above? 
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: false,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );

    var { soundObject, id } = recordingService.createSoundObject(sound, info, this.state.lanes);
    this.sounds[id] = soundObject;
    // take the sound object and add it to our schema. 
    //Lane: 1
    //sounds: [1] 

    //Hardcode lane 1 for now, we can worry about multi lanes later. 
    //Need to create an id for this sound, we also need to add it to a queue of sounds. This will then update the state, and likely the object that governs the project. prob do this in the background. shouldnt have 
    // to hit save if you want to retain the work. Also, need to determine a start time for the sound object in relation to the global time. 

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


  //We need to find out where in the global time we are at. we then determine which sound to play, and at what time within. 
  _onPlayPausePressed = (sound) => {

    console.log("sound!", sound);
    if (sound === null && this.state.currentSound === null) {
      console.log('play the first sound if we have it')
    }

    else if (sound === null && this.state.currentSound !== null) {
      sound = this.state.currentSound;
    }

    if (sound != null) {

      this.setState({
        currentSound: sound
      });

      if (this.state.isPlaying) {
        sound.pauseAsync();
      } else {
        sound.getStatusAsync().then((status) => {
          if (status.positionMillis === status.durationMillis)
            sound.replayAsync();
        })
        sound.playAsync();
      }
    }
  };

  async _deleteSound(id) {
    this.setState({
      isLoading: true,
    });
    var sound = this.sounds[id].EXPO_Sound;
    if (sound != null) {
      if (this.state.isPlaying) {
        sound.stopAsync();
      }

      await sound.unloadAsync();
      this.setState({
        currentSound: null
      });

      recordingService.deleteSoundObject(this.sounds[id]).then((result) => {
        if (result)
          delete this.sounds[id];
      }).catch(async () => {
        console.log("could not delete object.");
        await sound.loadAsync();
      }).finally(() => {
        this.setState({
          isLoading: false,
        });
      });


    }
  }

  //maybe we want to have a list of current sounds playing so that we can instantly stop. 
  _onStopPressed = () => {
    //if current playing sounds list is not empty, pause them all. 
  };

  _onMutePressed = () => {
    //if there are sounds: 
    this.sound.setIsMutedAsync(!this.state.muted);
    //fi

  };

  _onVolumeSliderValueChange = value => {
    //if there are sounds: 
    this.sound.setVolumeAsync(value);

  };

  _trySetRate = async (rate, shouldCorrectPitch) => {
    //if there are sounds: 
    try {
      await this.sound.setRateAsync(rate, shouldCorrectPitch); //need to tailor it to a specific sound.
    } catch (error) {
      // Rate changing could not be performed, possibly because the client's Android API is too old.
    }

  };

  _onRateSliderSlidingComplete = async value => {
    this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
  };

  _onPitchCorrectionPressed = async value => {
    this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
  };

  _renderSoundBoxes() {
    return (
      this.sounds.length === 0 ? (
        <View>
          <Text>No elements yet!</Text>
          <Text>No elements yet!</Text>
          <Text>No elements yet!</Text>
          <Text>No elements yet!</Text>
          <Text>No elements yet!</Text>
          <Text>No elements yet!</Text>
        </View>
      ) : (
          Object.keys(this.sounds).map((key) => (

            <View key={key} style={styles.row}>
              <TouchableOpacity style={styles.button} onPress={() => this._onPlayPausePressed(this.sounds[key].EXPO_Sound)}>
                <Text style={styles.buttonText}>
                  {key}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this._deleteSound(key)}>
                <FontAwesome name="trash" size={ICON_RECORD_SIZE} />
              </TouchableOpacity>
            </View>
          ))
        )
    );
  }

  // _onSeekSliderValueChange = value => {
  //   if (this.sound != null && !this.isSeeking) {
  //     this.isSeeking = true;
  //     this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
  //     this.sound.pauseAsync();
  //   }
  // };

  // _onSeekSliderSlidingComplete = async value => {
  //   if (this.sound != null) {
  //     this.isSeeking = false;
  //     const seekPosition = value * this.state.soundDuration;
  //     if (this.shouldPlayAtEndOfSeek) {
  //       this.sound.playFromPositionAsync(seekPosition);
  //     } else {
  //       this.sound.setPositionAsync(seekPosition);
  //     }
  //   }
  // };

  // _getSeekSliderPosition() {
  //   if (
  //     this.sound != null &&
  //     this.state.soundPosition != null &&
  //     this.state.soundDuration != null
  //   ) {
  //     return this.state.soundPosition / this.state.soundDuration;
  //   }
  //   return 0;
  // }

  // _getMMSSFromMillis(millis) {
  //   const totalSeconds = millis / 1000;
  //   const seconds = Math.floor(totalSeconds % 60);
  //   const minutes = Math.floor(totalSeconds / 60);

  //   const padWithZero = number => {
  //     const string = number.toString();
  //     if (number < 10) {
  //       return '0' + string;
  //     }
  //     return string;
  //   };
  //   return padWithZero(minutes) + ':' + padWithZero(seconds);
  // }

  // _getPlaybackTimestamp() {
  //   if (
  //     this.sound != null &&
  //     this.state.soundPosition != null &&
  //     this.state.soundDuration != null
  //   ) {
  //     return `${this._getMMSSFromMillis(this.state.soundPosition)} / ${this._getMMSSFromMillis(
  //       this.state.soundDuration
  //     )}`;
  //   }
  //   return '';
  // }

  // _getRecordingTimestamp() {
  //   if (this.state.recordingDuration != null) {
  //     return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
  //   }
  //   return `${this._getMMSSFromMillis(0)}`;
  // }


  /*********************************************************************************************** */

  render() {
    return this.project === null ? (
      <View style = {styles.container}>
        <ProjectsPage/>
      </View>
    ) : !this.state.fontLoaded ? (
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
          <View style={styles.parentContainer}>
            <View style={styles.container}>
              {this._renderSoundBoxes()}
            </View>
            <View style={styles.recordingContainer}>
              <View style={styles.recordingContainerIcons}>
                <View style={styles.recordingContainerIconsHalf}><TouchableHighlight
                  underlayColor={'white'}
                  style={styles.wrapper}
                  onPress={() => this._onPlayPausePressed(null)}
                  disabled={this.state.isLoading}>
                  {
                    this.state.isPlaying ?
                      <FontAwesome name="pause" size={ICON_RECORD_SIZE} /> :
                      <FontAwesome name="play" size={ICON_RECORD_SIZE} />
                  }
                </TouchableHighlight>
                </View>


                <View style={styles.recordingContainerIconsHalf}>
                  <View style={styles.recordingContainerIconsHalf}>
                    <TouchableHighlight
                      underlayColor={'white'}
                      style={styles.wrapper}
                      onPress={this._onRecordPressed}
                      disabled={this.state.isLoading}>
                      <FontAwesome name="microphone" size={ICON_RECORD_SIZE} />
                    </TouchableHighlight>

                  </View>
                  <View style={styles.recordingContainerIconsHalf}>
                    <Text style={[styles.liveText, { fontFamily: 'space-mono-regular' }]}>
                      {this.state.isRecording ? 'LIVE' : 'NOT LIVE'}
                    </Text>
                    <Image
                      style={[styles.image, { opacity: this.state.isRecording ? 1.0 : 0.0 }]}
                      source={ICON_RECORDING.module}
                    />
                  </View>
                </View>
                <View>

                </View>
              </View>
              <View style={styles.recordingContainerMisc}>
                <Text>INFO</Text>
                <Text>INFO</Text>
                <Text>INFO</Text>
                <Text>INFO</Text>

              </View>


              {/* <Text style={[styles.liveText, { fontFamily: 'space-mono-regular' }]}>
                  {this.state.isRecording ? 'LIVE' : 'NOT LIVE'}
                </Text> */}



            </View>
          </View>

        )
  }
}


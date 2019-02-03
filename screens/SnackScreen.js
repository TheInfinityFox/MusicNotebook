import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Constants, Audio } from 'expo';

// https://github.com/expo/expo/issues/1141

const rain = {
  uri: 'https://freesound.org/data/previews/413/413854_4337854-hq.mp3'
};

const violin = {
    uri: 'http://ccrma.stanford.edu/~jos/mp3/viola.mp3'
};

export default class SnackScreen extends Component {
  state = {
    playingStatus: "nosound",
  };

  static navigationOptions = {
    title: 'Snack',
  };

  async _generateSoundObject(uri, shouldPlay){
      const { sound } = await Audio.Sound.createAsync(
          uri,
          {
              shouldPlay: shouldPlay,
              isLooping: false,
              progressUpdateIntervalMillis: 100
          },
          this._onPlaybackStatusUpdate
        //   this._updateScreenForSoundStatus
      );

      return sound;
  }

  _onPlaybackStatusUpdate = (playbackStatus) => {

    console.log(Date.now());
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      if (playbackStatus.error) {
        console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state
  
      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
      } else {
        // Update your UI for the paused state
      }
  
      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }
  
      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // console.log("Starting the violin sound!", Date.now());
       this.violinSound.playAsync();
      }

    }
  };
  
  async _playRecording() {
    // const { sound } = await Audio.Sound.createAsync(
    //   rain,
    //   {
    //     shouldPlay: true,
    //     isLooping: true,
    //   },
    //   this._updateScreenForSoundStatus,
    // );
    
    this.rainSound = await this._generateSoundObject(rain, true);
    console.log("Starting the rain sound!", Date.now());
    this.status = await this.rainSound.getStatusAsync();
    console.log(this.status);
    this.violinSound = await this._generateSoundObject(violin, false);

    this.setState({
      playingStatus: 'playing'
    });
  }
  
  _updateScreenForSoundStatus = (status) => {
    if (status.isPlaying && this.state.playingStatus !== "playing") {
      this.setState({ playingStatus: "playing" });
    } else if (!status.isPlaying && this.state.playingStatus === "playing") {
      this.setState({ playingStatus: "donepause" });
    }
  };
  
  async _pauseAndPlayRecording() {
    if (this.sound != null) {
      if (this.state.playingStatus == 'playing') {
        console.log('pausing...');
        await this.sound.pauseAsync();
        console.log('paused!');
        this.setState({
          playingStatus: 'donepause',
        });
      } else {
        console.log('playing...');
        await this.sound.playAsync();
        console.log('playing!');
        this.setState({
          playingStatus: 'playing',
        });
      }
    }
  }
  
  _syncPauseAndPlayRecording() {
    // console.log("Rain sound", this.sound)
    if (this.sound != null) {
      if (this.state.playingStatus == 'playing') {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  }
  
  _playAndPause = () => {
    switch (this.state.playingStatus) {
      case 'nosound':
        this._playRecording();
        break;
      case 'donepause':
      case 'playing':
        this._syncPauseAndPlayRecording();
        break;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={this._playAndPause}>
            <Text style={styles.buttonText}>
              {this.state.playingStatus}
            </Text>
          </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingTop: Constants.statusBarHeight,
  },
  button: {
    width: 256,
    height: 256/1.618,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

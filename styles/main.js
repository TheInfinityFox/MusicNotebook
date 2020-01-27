import {
    Dimensions,
    Image,
    Platform,
    Slider,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
  } from 'react-native';
  import Constants from 'expo-constants';


  const BACKGROUND_COLOR = '#FFF8ED';
  const LIVE_COLOR = '#FF0000';


export const styles = StyleSheet.create({
        emptyContainer: {
          alignSelf: 'stretch',
          backgroundColor: 'red',
        },
        parentContainer:{
          flex:1,
          // paddingTop: Constants.statusBarHeight,
        },
        container: {
          flex: 3,
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
        
        recordingContainer: {
            //position: 'absolute',
            // bottom: 0,
            // left: 0,
            // right: 0,
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
            backgroundColor: 'white',
            flexDirection: 'column',
            flex: 1
          },
          recordingContainerIcons: {
            flex: 3,
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row',
          },
          recordingContainerIconsHalf: {
            flex: 1,
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: "row"
          },
          recordingContainerMisc: {
            flex: 1,
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: 'white'
          },
          wrapper: {},
          image: {
            // backgroundColor: BACKGROUND_COLOR,
            backgroundColor: BACKGROUND_COLOR,

          },
          liveText: {
            color: LIVE_COLOR,
          },
          button: {
            margin: 5,
            borderRadius: 10,
            // backgroundColor: '#fff',
            justifyContent: 'center',
            backgroundColor: '#fff',
            width: 100,
            height: 100
          },
          buttonText: {
            textAlign: 'center',
            backgroundColor: 'transparent',
          },
          row: {
            flexDirection: 'row',
            justifyContent: 'space-around'
          }
      });

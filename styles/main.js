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

  const BACKGROUND_COLOR = '#FFF8ED';
  const LIVE_COLOR = '#FF0000';


export const styles = StyleSheet.create({
        emptyContainer: {
          alignSelf: 'stretch',
          backgroundColor: 'red',
        },
        container: {
          flex: 1,
          flexDirection: 'column-reverse',
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
            // ...Platform.select({
            //     ios: {
            //         shadowColor: 'black',
            //         shadowOffset: { height: -3 },
            //         shadowOpacity: 0.1,
            //         shadowRadius: 3,
            //     },
            //     android: {
            //         elevation: 20,
            //     },
            // }),
            // alignItems: 'center',
            backgroundColor: 'white',
            //paddingVertical: 1,
            flexDirection: 'row',
            // justifyContent: 'space-around',
            flex: .5
          },
          wrapper: {},
          image: {
            // backgroundColor: BACKGROUND_COLOR,
            backgroundColor: BACKGROUND_COLOR,

          },
          liveText: {
            color: LIVE_COLOR,
          },
      });

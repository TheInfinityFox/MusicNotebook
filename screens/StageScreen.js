import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Constants, Audio } from 'expo';
import { Icon } from 'react-native-elements'


export default class StageScreen extends Component {
    state = {

    };

    static navigationOptions = {
        title: 'Project',
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    <ScrollView>
                        <Text>Hi</Text>
                    </ScrollView>
                </View>
                <View style={styles.utilityContainer}>
                    <Icon
                        reverse
                        name='ios-american-football'
                        type='ionicon'
                        color='#517fa4'
                    />a
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
        flexDirection: 'column'
    },
    contentContainer: {
        flex: 5,
        alignItems: 'center'
    },
    utilityContainer: {
        //position: 'absolute',
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
        backgroundColor: 'white',
        paddingVertical: 1,
        flex: 1
    }
});

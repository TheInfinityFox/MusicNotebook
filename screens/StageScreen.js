import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, ScrollView, TouchableHighlight, TextInput} from 'react-native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { Icon } from 'react-native-elements'
import Modal from 'react-native-modal'


export default class StageScreen extends Component {
    state = {
        textModalVisible: false,
        text: 'hi'
    };

    static navigationOptions = {
        title: 'Project',
    };

    _toggleModal = (visible) => {
        this.setState({textModalVisible: visible});
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    isVisible={this.state.textModalVisible}>
                    <View style={styles.modalContainer}>
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                    />
                        <TouchableHighlight style={styles.wrapper} underlayColor='white' onPress = {() => {
                            this._toggleModal(!this.state.textModalVisible)}}>
                            <Text>Close Modal</Text>
                        </TouchableHighlight>
                    </View>
                    
                </Modal>
                <View style={styles.contentContainer}>
                    <ScrollView>
                        <Text>{this.state.text}</Text>
                    </ScrollView>
                </View>
                <View style={styles.utilityContainer}>
                    <TouchableHighlight onPress={() => this.setState({textModalVisible: !this.state.textModalVisible})}>
                        <Icon
                            reverse
                            underlayColor='white'
                            name='note-add'
                            type='material'
                            color='#517fa4'
                        />
                    </TouchableHighlight>
                    <TouchableHighlight>
                        <Icon
                            reverse
                            name='mic'
                            type='material'
                            color='#517fa4'
                        />
                    </TouchableHighlight>
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        flex: 1
    },
    modalContainer:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrapper: {}
});

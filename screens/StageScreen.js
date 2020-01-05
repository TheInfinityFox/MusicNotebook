import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, ScrollView, TouchableHighlight, TextInput} from 'react-native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { Icon } from 'react-native-elements'
import Modal from 'react-native-modal'


export default class StageScreen extends Component {
    state = {
        textModalVisible: false,
        modalText: 'Enter text input here...',
        projectContent: []
    };

    static navigationOptions = {
        title: 'Project',
    };

    _toggleModal = (visible) => {
        this.setState({textModalVisible: visible});
    }

    _appendTextEntry = (text) => {
        var textObject = {
            "text": text,
            "type": "text"
        }
        this.setState(previousState => ({
            projectContent: [...previousState.projectContent, textObject]
        }));
    }

    _renderContent = () => {
        console.log(this.state);
        return(
            this.state.projectContent.length === 0 ? (
                <View style={styles.contentItemText}>
                    <Text>No content yet! Click the buttons below to add new text or new audio recording.</Text>
                </View>
            ) : (
                this.state.projectContent.map((item, key) => {
                    if(item.type === 'text'){
                        return(
                            <View key={key} style={styles.contentItemText}>
                                <Text>{item.text}</Text>
                            </View>
                        )
                    }
                    else if(item.type === 'audio'){
                        return (
                            <View key={key}>
                               <Icon
                                    name='play-circle-filled'
                                    type='material'
                                    color='#517fa4'
                                />
                            </View>
                        )
                    }
                }
                )
            )
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    isVisible={this.state.textModalVisible}>
                    <View style={styles.modalContainer}>
                    <TextInput
                        placeholder="Enter your text here!"
                        onChangeText={(text) => this.setState({modalText: text})}
                    />
                    <View>
                        <TouchableHighlight style={styles.wrapper} underlayColor='white' onPress = {() => {
                            this._toggleModal(!this.state.textModalVisible)}}>
                            <Text>Close Modal</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.wrapper} underlayColor='white' onPress = {() => {
                            this._appendTextEntry(this.state.modalText);
                            this._toggleModal(!this.state.textModalVisible)}}>
                            <Text>Submit</Text>
                        </TouchableHighlight>
                    </View>
                    </View>
                    
                </Modal>
                <View style={styles.contentContainer}>
                    <ScrollView>
                       {this._renderContent()}
                    </ScrollView>
                </View>
                <View style={styles.utilityContainer}>
                    <TouchableHighlight style={styles.wrapper} underlayColor='white' onPress={() => this.setState({textModalVisible: !this.state.textModalVisible})}>
                        <Icon
                            reverse
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
    contentItemText:{
        padding: 15,
        fontSize: 20
    },
    contentItemAudio:{
        padding: 15,
        fontSize: 20
    },
    wrapper: {}
});

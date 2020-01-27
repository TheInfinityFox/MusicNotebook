import React from 'react';
import {
    Dimensions,
    Image,
    Slider,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    List, ListItem, FlatList
} from 'react-native';
import { styles } from '../styles/main';
import { FontAwesome } from '@expo/vector-icons';
import { setAutoFocusEnabled } from 'expo/build/AR';
const ICON_RECORD_SIZE = 60;

export default class ProjectsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            isLoading: false
        };
    }
    _createNewProject = () => {
        this.setState({
            projects: this.state.projects.concat(1)
        })
    };

    render() {
        console.log(this.state);
        return (
            <View style={styles.parentContainer}>
                <View style={styles.container}>
                    {this.state.projects.length === 0 ?
                        <Text>No projects yet!</Text>
                        : 
                            
                           
                                
                                   
                                        <FlatList
                                            data={this.state.projects}
                                        />
                                    
                               
                          
                           
                        }
                </View>
                <View style={styles.recordingContainer}>
                    <View style={styles.recordingContainerIcons}>
                        <TouchableHighlight
                            underlayColor={'white'}
                            style={styles.wrapper}
                            onPress={() => this._createNewProject()}
                            disabled={this.state.isLoading}>
                            <FontAwesome name="plus" size={ICON_RECORD_SIZE} />

                        </TouchableHighlight>
                    </View>
                </View>
            </View>

        );
    }
}
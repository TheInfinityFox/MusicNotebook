import React from 'react';
import { ScrollView, FlatList} from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import { View, StyleSheet, Text } from 'react-native';


import { AsyncStorage } from "react-native"

const examples = [
  {
      "name": "Project 1",
      "id": 1,
      "filepath": "../test/temp"
  },
  {
      "name": "Project 2",
      "id": 2,
      "filepath": "../test/temp"
  }

];



export default class ProjectsScreen extends React.Component {

  constructor(props) {
    super(props);

    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    // this.state = {
    //   dataSource: ds.cloneWithRows(examples),
    // };
    // console.log(this.state.dataSource);
  }
  
  // static navigationOptions = {
  //   title: 'Poops',
  // };

  render() {
    return (
      <FlatList
        style={styles.container}
        //dataSource={this.state.dataSource}
        renderRow={(examples) => <Row {...examples} />}
        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
      />
    );
  }
}

const Row = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>
      {`${props.name}`}
    </Text>
  </View>
);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
  }
});

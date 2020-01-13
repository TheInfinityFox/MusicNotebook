import * as FileSystem from 'expo-file-system';
import uuidv1 from 'uuid';

var recordingService = {
    
    createSoundObject(sound, lane){
        FileSystem.getFreeDiskStorageAsync().then(freeDiskStorage => {
            // Android: 17179869184
            // iOS: 17179869184
            console.log("Available Disk Space: ", freeDiskStorage);
        });

        var newSoundObject = {
            'EXPO_Sound': sound,
            'id': uuidv1(),
            'startTime': "todo" //TODO
        }

        lane.sounds.push(newSoundObject);
        
        //TODO: Add lane to file system

        return lane;
    }

}

export default recordingService;


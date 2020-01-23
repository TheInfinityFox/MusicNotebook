import * as FileSystem from 'expo-file-system';
import uuidv1 from 'uuid';

var recordingService = {
    
    createSoundObject(sound, info, lanes){
        FileSystem.getFreeDiskStorageAsync().then(freeDiskStorage => {
            // Android: 17179869184
            // iOS: 17179869184
            console.log("Available Disk Space: ", freeDiskStorage);
        });

        var newSoundObject = {
            'EXPO_Sound': sound,
            'file_uri': info.uri,
            'startTime': "todo" //TODO
        }

        //lane.sounds.push(newSoundObject);
        
        //TODO: Add lane to file system

        return {
            soundObject: newSoundObject, 
            id: uuidv1()
        };
    },

    async deleteSoundObject(sound){
        await FileSystem.deleteAsync(sound.file_uri).catch(() => {
            console.error("Could not delete sound");
            return false;
        });

        return true;

        //lane.sounds.push(newSoundObject);
        
        //TODO: Add lane to file system
    }

}

export default recordingService;


import * as Permissions from 'expo-permissions';


var recordingService = {

    _askForPermissions: async () => {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        this.setState({
            haveRecordingPermissions: response.status === 'granted',
        });
    }
}

export default recordingService;


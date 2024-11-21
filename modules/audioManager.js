export class AudioManager {
    constructor() {
        this.sounds = {
            beep: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB/f39/'),
            error: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB/f39/'),
            success: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB/f39/'),
            ambient: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAB/f39/')
        };
        
        // Configure sound properties
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
        });

        // Set ambient sound to loop
        this.sounds.ambient.loop = true;
    }

    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play().catch(() => {});
        }
    }

    startAmbient() {
        this.sounds.ambient.play().catch(() => {});
    }

    stopAmbient() {
        this.sounds.ambient.pause();
        this.sounds.ambient.currentTime = 0;
    }

    isAudioSupported() {
        return !!(document.createElement('audio').canPlayType);
    }
}
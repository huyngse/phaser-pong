import Phaser from "phaser";
import { SoundManager } from "../audio/soundManager";
class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene")
    }

    preload() {
        const soundManager = SoundManager.getInstance(this);
        soundManager.preload();
    }

    create() {
        const soundManager = SoundManager.getInstance(this);
        soundManager.create();
        this.scene.start("GameScene");
    }
}

export default PreloadScene;
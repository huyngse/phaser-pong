import Phaser from "phaser";

export class SoundManager {
    private static instance: SoundManager;
    private scene: Phaser.Scene;
    private soundPools: Map<string, Phaser.Sound.BaseSound[]> = new Map();
    private maxInstances: number = 5;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public static getInstance(scene: Phaser.Scene) {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager(scene);
        } else {
            SoundManager.instance.scene = scene;
        }
        return SoundManager.instance;
    }

    preload() {
        this.scene.load.audio("hit", "/assets/audio/hit.wav");
        this.scene.load.audio("score", "/assets/audio/score.wav");
    }

    create() {
        this.createSoundPool("hit");
        this.createSoundPool("score");
    }

    private createSoundPool(key: string) {
        const pool: Phaser.Sound.BaseSound[] = [];
        for (let i = 0; i < this.maxInstances; i++) {
            const sfx = this.scene.sound.add(key, { volume: 0.5 });
            pool.push(sfx);
        }
        this.soundPools.set(key, pool);
    }

    play(key: string) {
        const pool = this.soundPools.get(key);
        if (!pool) return;

        const available = pool.find(s => !s.isPlaying);
        if (available) {
            available.play();
        } else {
            pool[0].stop();
            pool[0].play();
        }
    }

    stop(key: string) {
        const pool = this.soundPools.get(key);
        if (!pool) return;
        pool.forEach(s => s.stop());
    }

    stopAll() {
        this.soundPools.forEach(pool => pool.forEach(s => s.stop()));
    }

    setVolume(volume: number) {
        const clamped = Phaser.Math.Clamp(volume, 0, 1);
        this.scene.sound.volume = clamped;
        this.soundPools.forEach(pool =>
            pool.forEach(s => {
                if ("volume" in s) {
                    s.volume = clamped
                }
            })
        );
    }

    setMaxInstances(max: number) {
        this.maxInstances = Math.max(1, max);
    }
}

import Phaser from "phaser";
import type { KeyboardKey, SpriteWithDynamicBody } from "../types/phaser";
import { Keycodes } from "../consts/phaser";

class GameScene extends Phaser.Scene {
    private ball!: SpriteWithDynamicBody;
    private leftPaddle!: SpriteWithDynamicBody;
    private rightPaddle!: SpriteWithDynamicBody;
    private keys?: { W: KeyboardKey; S: KeyboardKey };

    private paddleSpeed = 300;

    constructor() {
        super("GameScene")
    }

    preload() {
        this.load.image("circle", "/assets/64x64/circle.png");
        this.load.image("square", "/assets/64x64/square.png");
        this.load.image("dashed-line", "/assets/dashed-line.png");
    }

    create() {
        this.createBackground();
        this.createBall();
        this.createPaddles();
        this.setupCollisions();
        this.setupControls();
    }

    update() {
        this.handlePaddleControls();
        this.handleBotPaddle();
    }

    // ─── Initialization Helpers ─────────────────────────────

    createBackground() {
        this.add.image(400, 300, "dashed-line")
            .setDepth(0);
    }

    createBall() {
        this.ball = this.physics.add.sprite(400, 300, "circle")
            .setDisplaySize(20, 20)
            .setTint(0x7dd3fc)
            .setCollideWorldBounds(true, 1, 1)
            .setVelocity(200, 200)
            .setBounce(1, 1);
    }

    createPaddles() {
        this.leftPaddle = this.physics.add.sprite(50, 300, "square")
            .setDisplaySize(20, 100)
            .setImmovable(true)
            .setCollideWorldBounds(true);
        this.rightPaddle = this.physics.add.sprite(750, 300, "square")
            .setDisplaySize(20, 100)
            .setImmovable(true)
            .setCollideWorldBounds(true);
    }

    setupCollisions() {
        this.physics.add.collider(this.ball, this.leftPaddle)
        this.physics.add.collider(this.ball, this.rightPaddle)
    }

    setupControls() {
        if (this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys({
                W: Keycodes.W,
                S: Keycodes.S
            }) as any
        }
    }

    handlePaddleControls() {
        if (!this.keys) return;
        if (this.keys.W.isDown) {
            this.leftPaddle.setVelocityY(-this.paddleSpeed);
        } else if (this.keys.S.isDown) {
            this.leftPaddle.setVelocityY(this.paddleSpeed);
        } else {
            this.leftPaddle.setVelocityY(0);
        }
    }

    handleBotPaddle() {
        const diff = this.ball.y - this.rightPaddle.y;

        if (Math.abs(diff) > 10) {
            this.rightPaddle.setVelocityY(
                Phaser.Math.Clamp(diff, -this.paddleSpeed, this.paddleSpeed)
            );
        } else {
            this.rightPaddle.setVelocityY(0);
        }
    }
}

export default GameScene;
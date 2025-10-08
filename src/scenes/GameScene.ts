import Phaser from "phaser";
import type { KeyboardKey, SpriteWithDynamicBody } from "../types/phaser";
import { Keycodes } from "../consts/phaser";
import { handleBotPaddle } from "../logic/botAI";

class GameScene extends Phaser.Scene {
    private ball!: SpriteWithDynamicBody;
    private leftPaddle!: SpriteWithDynamicBody;
    private rightPaddle!: SpriteWithDynamicBody;
    private keys?: { W: KeyboardKey; S: KeyboardKey };

    private paddleSpeed = 300;

    private leftScore = 0;
    private rightScore = 0;
    private scoreText!: Phaser.GameObjects.Text;

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
        this.createGUI();
    }

    update() {
        this.handlePaddleControls();
        handleBotPaddle(this.ball, this.rightPaddle, {
            paddleSpeed: this.paddleSpeed,
            height: this.scale.height
        });
        this.checkScore();
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
        this.physics.add.collider(this.ball, this.leftPaddle, () => this.handlePaddleHit())
        this.physics.add.collider(this.ball, this.rightPaddle, () => this.handlePaddleHit())
    }

    setupControls() {
        if (this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys({
                W: Keycodes.W,
                S: Keycodes.S
            }) as any
        }
    }

    createGUI() {
        this.scoreText = this.add.text(400, 50, "0   0", {
            fontSize: "64px",
            color: "#FFF",
            fontFamily: "Arial",
        }).setOrigin(0.5, 0.5)
            .setAlpha(0.5);
    }

    // ─── Game Logic ─────────────────────────────

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

    checkScore() {
        const ballSize = this.ball.displayHeight + 1;

        if (this.ball.x - ballSize / 2 < 0) {
            this.rightScore++;
            this.updateScoreText();
            this.resetBall(true);
        }
        else if (this.ball.x + ballSize / 2 > this.scale.width) {
            this.leftScore++;
            this.updateScoreText();
            this.resetBall(false);
        }
    }

    updateScoreText() {
        this.scoreText.setText(`${this.leftScore}   ${this.rightScore}`);
    }

    resetBall(toLeft: boolean) {
        this.ball.setPosition(400, 300);
        const direction = toLeft ? -1 : 1;

        let vy = Phaser.Math.Between(-200, 200);

        if (Math.abs(vy) < 80) {
            vy = 80 * Phaser.Math.RND.sign();
        }
        this.ball.setVelocity(200 * direction, vy);
        this.ball.setTint(0x7dd3fc)
    }

    handlePaddleHit() {
        const currentVelocity = this.ball.body.velocity;
        const speedMultiplier = 1.1;

        const newVelX = Phaser.Math.Clamp(currentVelocity.x * speedMultiplier, -800, 800);
        const newVelY = Phaser.Math.Clamp(currentVelocity.y * speedMultiplier, -800, 800);
        this.ball.setVelocity(newVelX, newVelY);

        const currentTint = this.ball.tintTopLeft;
        const nextTint = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(currentTint),
            Phaser.Display.Color.HexStringToColor("#ff0000"),
            10,
            1
        );

        const newColor = Phaser.Display.Color.GetColor(nextTint.r, nextTint.g, nextTint.b);
        this.ball.setTint(newColor);
    }
}

export default GameScene;
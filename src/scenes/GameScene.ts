import Phaser from "phaser";
import type { KeyboardKey, SpriteWithDynamicBody } from "../types/phaser";
import { Keycodes } from "../consts/phaser";
import { handleBotPaddle } from "../logic/botAI";
import { SoundManager } from "../audio/soundManager";

const GAME_CONFIG = {
    BALL_SPEED: 200,
    PADDLE_SPEED: 300,
    MAX_BALL_SPEED: 800,
    BALL_SIZE: 20,
    PADDLE_WIDTH: 20,
    PADDLE_HEIGHT: 100,
    SCORE_FONT: {
        fontSize: "64px",
        color: "#FFF",
        fontFamily: "Arial",
    },
    COLORS: {
        BALL_START: 0x7dd3fc,
        BALL_HIT_TARGET: "#ff0000",
    }
};

class GameScene extends Phaser.Scene {
    private ball!: SpriteWithDynamicBody;
    private leftPaddle!: SpriteWithDynamicBody;
    private rightPaddle!: SpriteWithDynamicBody;
    private keys?: { W: KeyboardKey; S: KeyboardKey };
    private scoreText!: Phaser.GameObjects.Text;
    private soundManager!: SoundManager;

    private leftScore = 0;
    private rightScore = 0;

    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image("circle", "/assets/images/64x64/circle.png");
        this.load.image("square", "/assets/images/64x64/square.png");
        this.load.image("dashed-line", "/assets/images/dashed-line.png");
    }

    create() {
        this.createBackground();
        this.createBall();
        this.createPaddles();
        this.setupCollisions();
        this.setupControls();
        this.createScoreDisplay();

        this.soundManager = SoundManager.getInstance(this);
    }

    update() {
        this.updatePlayerPaddle();
        handleBotPaddle(this.ball, this.rightPaddle, {
            paddleSpeed: GAME_CONFIG.PADDLE_SPEED,
            height: this.scale.height
        });
        this.checkForScore();
    }

    // ─── Scene Setup ─────────────────────────────

    private createBackground() {
        this.add.image(400, 300, "dashed-line").setDepth(0);
    }

    private createBall() {
        this.ball = this.physics.add.sprite(400, 300, "circle")
            .setDisplaySize(GAME_CONFIG.BALL_SIZE, GAME_CONFIG.BALL_SIZE)
            .setTint(GAME_CONFIG.COLORS.BALL_START)
            .setCollideWorldBounds(true, 1, 1)
            .setVelocity(GAME_CONFIG.BALL_SPEED, GAME_CONFIG.BALL_SPEED)
            .setBounce(1, 1);
    }

    private createPaddles() {
        this.leftPaddle = this.createPaddle(50);
        this.rightPaddle = this.createPaddle(750);
    }

    private createPaddle(x: number) {
        return this.physics.add.sprite(x, 300, "square")
            .setDisplaySize(GAME_CONFIG.PADDLE_WIDTH, GAME_CONFIG.PADDLE_HEIGHT)
            .setImmovable(true)
            .setCollideWorldBounds(true);
    }

    private setupCollisions() {
        this.physics.add.collider(this.ball, this.leftPaddle, this.onPaddleHit, undefined, this);
        this.physics.add.collider(this.ball, this.rightPaddle, this.onPaddleHit, undefined, this);
    }

    private setupControls() {
        if (!this.input.keyboard) return;
        this.keys = this.input.keyboard.addKeys({
            W: Keycodes.W,
            S: Keycodes.S,
        }) as any;
    }

    private createScoreDisplay() {
        this.scoreText = this.add.text(400, 50, "0   0", GAME_CONFIG.SCORE_FONT)
            .setOrigin(0.5)
            .setAlpha(0.5);
    }

    // ─── Game Logic ─────────────────────────────

    private updatePlayerPaddle() {
        if (!this.keys) return;

        const { W, S } = this.keys;
        let velocityY = 0;

        if (W.isDown) velocityY = -GAME_CONFIG.PADDLE_SPEED;
        else if (S.isDown) velocityY = GAME_CONFIG.PADDLE_SPEED;

        this.leftPaddle.setVelocityY(velocityY);
    }

    private checkForScore() {
        const ballRadius = this.ball.displayHeight / 2 + 1;

        if (this.ball.x - ballRadius < 0) {
            this.incrementScore("right");
        } else if (this.ball.x + ballRadius > this.scale.width) {
            this.incrementScore("left");
        }
    }

    private incrementScore(side: "left" | "right") {
        if (side === "left") this.leftScore++;
        else this.rightScore++;

        this.updateScoreText();
        this.resetBall(side === "left");
        this.soundManager.play("score")
    }

    private updateScoreText() {
        this.scoreText.setText(`${this.leftScore}   ${this.rightScore}`);
    }

    private resetBall(toLeft: boolean) {
        this.ball.setPosition(400, 300);

        const direction = toLeft ? -1 : 1;
        let vy = Phaser.Math.Between(-200, 200);
        if (Math.abs(vy) < 80) vy = 80 * Phaser.Math.RND.sign();

        this.ball
            .setVelocity(GAME_CONFIG.BALL_SPEED * direction, vy)
            .setTint(GAME_CONFIG.COLORS.BALL_START);
    }

    private onPaddleHit() {
        const { velocity } = this.ball.body;
        const speedMultiplier = 1.1;

        const newVelX = Phaser.Math.Clamp(velocity.x * speedMultiplier, -GAME_CONFIG.MAX_BALL_SPEED, GAME_CONFIG.MAX_BALL_SPEED);
        const newVelY = Phaser.Math.Clamp(velocity.y * speedMultiplier, -GAME_CONFIG.MAX_BALL_SPEED, GAME_CONFIG.MAX_BALL_SPEED);
        this.ball.setVelocity(newVelX, newVelY);

        this.updateBallTint();
        this.soundManager.play("hit");
    }

    private updateBallTint() {
        const currentTint = this.ball.tintTopLeft;
        const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.IntegerToColor(currentTint),
            Phaser.Display.Color.HexStringToColor(GAME_CONFIG.COLORS.BALL_HIT_TARGET),
            10,
            1
        );
        const newColor = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
        this.ball.setTint(newColor);
    }
}

export default GameScene;

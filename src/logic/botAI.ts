import type { SpriteWithDynamicBody } from "../types/phaser";

export interface BotAIOptions {
    paddleSpeed: number;
    height: number;
}

export function handleBotPaddle(
    ball: SpriteWithDynamicBody,
    rightPaddle: SpriteWithDynamicBody,
    options: BotAIOptions
) {
    const { paddleSpeed, height } = options;
    const ballMovingRight = ball.body.velocity.x > 0;
    const offset = 20;
    const ballSize = ball.displayHeight;

    let targetY: number;

    if (ballMovingRight) {
        const timeToReachBot = (rightPaddle.x - ball.x) / ball.body.velocity.x;
        let predictedY = ball.y + ball.body.velocity.y * timeToReachBot;

        // Reflect predicted Y when hitting top or bottom walls
        while (predictedY < ballSize / 2 || predictedY > height - ballSize / 2) {
            if (predictedY < ballSize / 2) {
                predictedY = ballSize - predictedY;
            } else {
                predictedY = height * 2 - ballSize - predictedY;
            }
        }

        targetY = predictedY;
    } else {
        // Return to center if ball moves away
        targetY = height / 2;
    }

    const diff = targetY - rightPaddle.y;

    if (Math.abs(diff) <= offset) {
        rightPaddle.setVelocityY(0);
    } else {
        rightPaddle.setVelocityY(Math.sign(diff) * paddleSpeed);
    }
}

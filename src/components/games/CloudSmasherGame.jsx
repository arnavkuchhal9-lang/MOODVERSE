import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy, Sparkles, Smile } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export default function CloudSmasherGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    paddle: { x: 250, width: 90, height: 14, speed: 7 },
    ball: { x: 300, y: 320, dx: 4, dy: -4, radius: 9 },
    clouds: [],
    keys: { left: false, right: false }
  });

  const initClouds = () => {
    const rows = 4;
    const cols = 7;
    const padding = 10;
    const width = 64;
    const height = 24;
    const offsetLeft = 35;
    const offsetTop = 40;

    const clouds = [];
    const cloudLabels = ['Sorrow', 'Stress', 'Fog', 'Gloom', 'Doubt', 'Tired', 'Heavy'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        clouds.push({
          x: offsetLeft + c * (width + padding),
          y: offsetTop + r * (height + padding),
          width,
          height,
          active: true,
          label: cloudLabels[c % cloudLabels.length],
          row: r
        });
      }
    }
    return clouds;
  };

  const startGame = () => {
    gameState.current.clouds = initClouds();
    gameState.current.paddle.x = 255;
    gameState.current.ball = { x: 300, y: 320, dx: (Math.random() > 0.5 ? 3.5 : -3.5), dy: -4, radius: 9 };
    setScore(0);
    setGameWon(false);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    gameState.current.clouds = initClouds();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    gameState.current.paddle.x = Math.max(0, Math.min(canvas.width - gameState.current.paddle.width, mouseX - gameState.current.paddle.width / 2));
  };

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const state = gameState.current;

      // Update Paddle
      if (state.keys.left) state.paddle.x = Math.max(0, state.paddle.x - state.paddle.speed);
      if (state.keys.right) state.paddle.x = Math.min(canvas.width - state.paddle.width, state.paddle.x + state.paddle.speed);

      // Update Ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Bounce off Left / Right Walls
      if (state.ball.x - state.ball.radius <= 0 || state.ball.x + state.ball.radius >= canvas.width) {
        state.ball.dx *= -1;
        soundEngine.playBounceSound();
      }

      // Bounce off Top Wall
      if (state.ball.y - state.ball.radius <= 0) {
        state.ball.dy *= -1;
        soundEngine.playBounceSound();
      }

      // Paddle Collision
      if (
        state.ball.y + state.ball.radius >= canvas.height - 35 &&
        state.ball.y + state.ball.radius <= canvas.height - 18 &&
        state.ball.x >= state.paddle.x &&
        state.ball.x <= state.paddle.x + state.paddle.width
      ) {
        state.ball.dy = -Math.abs(state.ball.dy);
        // angle adjustment
        const hitPos = (state.ball.x - (state.paddle.x + state.paddle.width / 2)) / (state.paddle.width / 2);
        state.ball.dx = hitPos * 5.5;
        soundEngine.playBounceSound();
      }

      // Cloud Collision
      let remaining = 0;
      state.clouds.forEach((cloud) => {
        if (cloud.active) {
          remaining++;
          if (
            state.ball.x + state.ball.radius >= cloud.x &&
            state.ball.x - state.ball.radius <= cloud.x + cloud.width &&
            state.ball.y + state.ball.radius >= cloud.y &&
            state.ball.y - state.ball.radius <= cloud.y + cloud.height
          ) {
            cloud.active = false;
            state.ball.dy *= -1;
            soundEngine.playPopSound();
            setScore((s) => s + 10);
          }
        }
      });

      // Win Condition
      if (remaining === 0) {
        soundEngine.playCheerSound();
        setGameWon(true);
        setIsPlaying(false);
        return;
      }

      // Lose Condition
      if (state.ball.y - state.ball.radius > canvas.height) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // RENDER
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Clouds
      state.clouds.forEach((cloud) => {
        if (cloud.active) {
          const colors = ['#64748b', '#475569', '#334155', '#1e293b'];
          ctx.fillStyle = colors[cloud.row % colors.length];
          ctx.beginPath();
          ctx.roundRect(cloud.x, cloud.y, cloud.width, cloud.height, 8);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.stroke();

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(cloud.label, cloud.x + cloud.width / 2, cloud.y + cloud.height / 2 + 3);
        }
      });

      // Draw Glowing Rainbow Paddle
      const pGrad = ctx.createLinearGradient(state.paddle.x, 0, state.paddle.x + state.paddle.width, 0);
      pGrad.addColorStop(0, '#f43f5e');
      pGrad.addColorStop(0.5, '#8b5cf6');
      pGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(state.paddle.x, canvas.height - 30, state.paddle.width, state.paddle.height, 7);
      ctx.fill();

      // Draw Glowing Smiley Ball
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Smiley face details
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(state.ball.x - 3, state.ball.y - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(state.ball.x + 3, state.ball.y - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y + 1, 4, 0, Math.PI);
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 bg-space-950 p-6 flex flex-col justify-between shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Playfair_Display',serif]">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Smash The Gloom Clouds
          </h3>
          <p className="text-xs text-slate-400">Bounce the smiling sun to break through all the storm clouds!</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Score: {score}</span>
          </div>

          <button
            onClick={startGame}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            {isPlaying ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Restart' : 'Play Game'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-space-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          onMouseMove={handleMouseMove}
          className="w-full max-w-[600px] h-[360px] cursor-none block"
        />

        {/* Start / Game Over / Win Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 text-center p-6">
            {gameWon ? (
              <div className="space-y-2">
                <Smile className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif]">All Gloom Smashed! ☀️</h2>
                <p className="text-sm text-cyan-300">You shattered every cloudy thought and cleared the blue sky!</p>
              </div>
            ) : gameOver ? (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white font-['Playfair_Display',serif]">Nice Effort! 🌈</h2>
                <p className="text-sm text-slate-300">You scored {score} points. Ready to try again?</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Smile className="w-14 h-14 text-cyan-400 mx-auto animate-pulse" />
                <h2 className="text-xl font-bold text-white font-['Playfair_Display',serif]">Smash The Heavy Thoughts</h2>
                <p className="text-xs text-slate-400 max-w-sm">Use your mouse or Arrow Keys to move the rainbow paddle and bounce the smiling sun.</p>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/50 transition-all hover:scale-105 active:scale-95"
            >
              {gameWon || gameOver ? 'Play Again' : 'Start Smashing Gloom'}
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        Move your mouse over the game to glide the paddle!
      </div>
    </div>
  );
}

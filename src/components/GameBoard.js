import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';
import GemTile from './GemTile';

function GameBoard({ size = 5, tileSize = 100, playerId, bombCount = 3 }) {
	const totalTiles = size * size;

	const [gameOver, setGameOver] = useState(false);
	const [win, setWin] = useState(false);
	const [tiles, setTiles] = useState([]);
	const [timeLeft, setTimeLeft] = useState(210); // 3.5 минуты (210 секунд)
	const [loseReason, setLoseReason] = useState(''); // "bomb" | "time"

	// создаём массив клеток
	const initTiles = () => {
		return Array.from({ length: totalTiles }, () => ({
			type: 'empty',
			revealed: false,
		}));
	};

	// ставим N бомб случайно
	const placeBombs = (arr, count) => {
		let newTiles = [...arr];
		let bombsPlaced = 0;
		while (bombsPlaced < count) {
			const pos = Math.floor(Math.random() * totalTiles);
			if (newTiles[pos].type === 'empty') {
				newTiles[pos].type = 'bomb';
				bombsPlaced++;
			}
		}
		return newTiles;
	};

	const startNewGame = () => {
		let newTiles = initTiles();
		newTiles = placeBombs(newTiles, bombCount);
		setTiles(newTiles);
		setGameOver(false);
		setWin(false);
		setLoseReason('');
		localStorage.setItem('tiles', JSON.stringify(newTiles));
	};

	useEffect(() => {
		const savedTiles = localStorage.getItem('tiles');
		if (savedTiles) {
			setTiles(JSON.parse(savedTiles));
		} else {
			startNewGame();
		}

		const savedStartTime = localStorage.getItem('startTime');
		if (savedStartTime) {
			const elapsed = Math.floor(
				(Date.now() - parseInt(savedStartTime, 10)) / 1000
			);
			const remaining = 210 - elapsed;
			if (remaining > 0) {
				setTimeLeft(remaining);
			} else {
				handleTimeout();
			}
		}
		// eslint-disable-next-line
	}, []);

	// Таймер обратного отсчета
	useEffect(() => {
		if (gameOver || win) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleTimeout();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [gameOver, win]);

	const handleClick = (index) => {
		if (gameOver || win || tiles[index].revealed) return;

		let newTiles = [...tiles];
		newTiles[index].revealed = true;

		if (newTiles[index].type === 'bomb') {
			newTiles = newTiles.map((t) => ({ ...t, revealed: true }));
			setTiles(newTiles);
			setGameOver(true);
			setLoseReason('bomb');
			localStorage.clear();
			setTimeout(() => {
				window.location.reload();
			}, 1500);
			return;
		}

		setTiles(newTiles);
		localStorage.setItem('tiles', JSON.stringify(newTiles));

		// Проверка победы
		const safeTiles =
			totalTiles - newTiles.filter((t) => t.type === 'bomb').length;
		const openedSafeTiles = newTiles.filter(
			(t) => t.revealed && t.type !== 'bomb'
		).length;

		if (openedSafeTiles === safeTiles) {
			setWin(true);
		}
	};

	// форматируем таймер (MM:SS)
	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	// обработка конца таймера → возврат на первую страницу
	const handleTimeout = () => {
		setGameOver(true);
		setLoseReason('time');
		localStorage.clear();
		setTimeout(() => {
			window.location.reload();
		}, 2000);
	};

	return (
		<div className="floating-box">
			{/* 🔥 Заголовок */}
			<h1 className="title">Gonzales’s Hack Bot 3.0</h1>

			{/* Таймер */}
			<div className="timer">⏳ {formatTime(timeLeft)}</div>

			{gameOver && (
				<div className="overlay lose">
					<div>
						{loseReason === 'bomb' && (
							<p>💥 Бомба! Игра окончена</p>
						)}
						{loseReason === 'time' && <p>⌛ Время вышло!</p>}
					</div>
				</div>
			)}

			{win && (
				<div className="overlay win">
					<div>
						<p>🎉 Победа!</p>
						<button
							className="restart-btn"
							onClick={() => {
								startNewGame();
								setTimeLeft(210);
								localStorage.setItem(
									'startTime',
									Date.now().toString()
								);
							}}
						>
							🔄 Новая игра
						</button>
					</div>
				</div>
			)}

			{/* Игровое поле */}
			<div
				className="board"
				style={{
					'--grid-size': size,
					'--tile-size': `${tileSize}px`,
				}}
			>
				{tiles.map((tile, i) => (
					<GemTile
						key={i}
						tile={tile}
						// onClick={() => handleClick(i)}
					/>
				))}
			</div>

			{/* ID игрока */}
			<div className="player-id">ID: {playerId}</div>
		</div>
	);
}

export default GameBoard;

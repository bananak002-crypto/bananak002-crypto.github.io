import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';
import GemTile from './GemTile';

function GameBoard({ size = 5, tileSize = 100, playerId, bombCount = 3 }) {
	const totalTiles = size * size;

	const [gameOver, setGameOver] = useState(false);
	const [win, setWin] = useState(false);
	const [tiles, setTiles] = useState([]);
	const [timeLeft, setTimeLeft] = useState(210); // 3.5 minutes
	const [loseReason, setLoseReason] = useState('');
	const [cooldown, setCooldown] = useState(0); // cooldown for button
	const [popupMessage, setPopupMessage] = useState(''); // custom popup

	// init tiles
	const initTiles = () => {
		return Array.from({ length: totalTiles }, () => ({
			type: 'empty',
			revealed: false,
		}));
	};

	// place bombs
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

		const nextAvailable = localStorage.getItem('nextSignalTime');
		if (nextAvailable) {
			const remainingCd = Math.floor(
				(parseInt(nextAvailable, 10) - Date.now()) / 1000
			);
			if (remainingCd > 0) setCooldown(remainingCd);
		}
		// eslint-disable-next-line
	}, []);

	// countdown timer
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

	// cooldown timer
	useEffect(() => {
		if (cooldown > 0) {
			const cdTimer = setInterval(() => {
				setCooldown((prev) => {
					if (prev <= 1) {
						localStorage.removeItem('nextSignalTime');
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(cdTimer);
		}
	}, [cooldown]);

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
			setPopupMessage('💥 Bomb! Game Over');
			return;
		}

		setTiles(newTiles);
		localStorage.setItem('tiles', JSON.stringify(newTiles));

		const safeTiles =
			totalTiles - newTiles.filter((t) => t.type === 'bomb').length;
		const openedSafeTiles = newTiles.filter(
			(t) => t.revealed && t.type !== 'bomb'
		).length;

		if (openedSafeTiles === safeTiles) {
			setWin(true);
		}
	};

	const formatTime = (seconds) => {
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const handleTimeout = () => {
		setGameOver(true);
		setLoseReason('time');
		localStorage.clear();
		setPopupMessage('⌛ Signal expired!');
	};

	const handleGenerateSignal = () => {
		setPopupMessage('🔔 New signal generated!');
		const nextTime = Date.now() + 60000;
		localStorage.setItem('nextSignalTime', nextTime.toString());
		setCooldown(60);

		startNewGame();
		setTimeLeft(210);
		localStorage.setItem('startTime', Date.now().toString());
	};

	return (
		<div className="floating-box">
			{/* Title */}
			<h1 className="title">Gonzales Hack Bot 3.0</h1>

			{/* Timer */}
			<div className="timer">⏳ {formatTime(timeLeft)}</div>

			{win && (
				<div className="overlay win">
					<div>
						<p>🎉 Victory!</p>
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
							🔄 New Game
						</button>
					</div>
				</div>
			)}

			{/* Board */}
			<div
				className="board"
				style={{
					'--grid-size': size,
					'--tile-size': `${tileSize}px`,
				}}
			>
				{tiles.map((tile, i) => (
					<GemTile key={i} tile={tile} />
				))}
			</div>

			{/* Player ID */}
			<div className="player-id">ID: {playerId}</div>

			{/* Generate Signal Button */}
			<button
				className="generate-btn"
				onClick={handleGenerateSignal}
				disabled={cooldown > 0}
			>
				{cooldown > 0 ? `Wait ${cooldown}s` : 'Generate New Signal'}
			</button>

			{/* Custom Popup */}
			{popupMessage && (
				<div className="popup">
					<div className="popup-content">
						<p>{popupMessage}</p>
						<button onClick={() => setPopupMessage('')}>OK</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default GameBoard;

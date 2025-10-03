import React, { useState, useEffect } from 'react';
import './App.css';
import GameBoard from './components/GameBoard.js';
import botLogo from './assets/forBot.png'; // 👈 импорт логотипа

function App() {
	const [started, setStarted] = useState(false);
	const [playerId, setPlayerId] = useState('');
	const [bombCount, setBombCount] = useState(2);
	const [miniField, setMiniField] = useState([]);

	// проверяем localStorage при загрузке
	useEffect(() => {
		const savedStarted = localStorage.getItem('started');
		const savedId = localStorage.getItem('playerId');
		const savedBombs = localStorage.getItem('bombCount');
		if (savedStarted === 'true' && savedId) {
			setPlayerId(savedId);
			if (savedBombs) setBombCount(parseInt(savedBombs, 10));
			setStarted(true);
		}
	}, []);

	// генерация мини-поля 5x5
	const generateMiniField = (count) => {
		let grid = Array(25).fill(null);

		// алмазы
		const diamondPositions = [4, 7];
		diamondPositions.forEach((pos) => {
			grid[pos] = '💎';
		});

		// бомбы (рандомно, максимум count)
		let placed = 0;
		while (placed < count) {
			const rand = Math.floor(Math.random() * 25);
			if (!grid[rand]) {
				grid[rand] = '💥';
				placed++;
			}
		}

		return grid;
	};

	// обновляем поле при изменении количества мин
	useEffect(() => {
		setMiniField(generateMiniField(bombCount));
	}, [bombCount]);

	// валидация ID
	const isValidId = /^\d{10}$/.test(playerId);

	const handleStart = () => {
		if (!isValidId) {
			alert('Введите корректный ID (10 цифр)');
			return;
		}
		setMiniField(generateMiniField(bombCount));
		setStarted(true);
		localStorage.setItem('started', 'true');
		localStorage.setItem('playerId', playerId);
		localStorage.setItem('bombCount', bombCount.toString());
		localStorage.setItem('startTime', Date.now().toString());
	};

	return (
		<div className="App">
			{!started ? (
				<div className="welcome">
					<div className="floating-box">
						{/* 👇 Логотип-бот в шапке */}
						<img
							src={botLogo}
							alt=""
							className="bot-logo"
							draggable="false"
							onContextMenu={(e) => e.preventDefault()}
						/>

						{/* Левая часть */}
						<div className="left-panel">
							<h1 className="title">Hack Bot 3.0</h1>
							<input
								type="text"
								className="input-id"
								placeholder="Enter 10-digit ID"
								value={playerId}
								onChange={(e) =>
									setPlayerId(
										e.target.value.replace(/\D/g, '')
									)
								}
								maxLength={10}
							/>

							{/* Слайдер */}
							<div className="bomb-selector">
								<input
									type="range"
									min="2"
									max="3"
									value={bombCount}
									className="bomb-slider"
									onChange={(e) =>
										setBombCount(
											parseInt(e.target.value, 10)
										)
									}
								/>
								<span className="bomb-count-label">
									{bombCount} 💥
								</span>
							</div>
						</div>

						{/* Правая часть */}
						<div className="right-panel">
							<div className="mini-field">
								{miniField.map((cell, idx) => (
									<div key={idx} className="cell">
										{cell && (
											<span className="icon">{cell}</span>
										)}
									</div>
								))}
							</div>
							<button
								className="play-now-btn"
								onClick={handleStart}
								disabled={!isValidId}
							>
								PLAY NOW
							</button>
						</div>
					</div>
				</div>
			) : (
				<GameBoard
					size={5}
					tileSize={100}
					playerId={playerId}
					bombCount={bombCount}
				/>
			)}
		</div>
	);
}

export default App;

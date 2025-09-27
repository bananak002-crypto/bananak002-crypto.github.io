import React from 'react';
import '../styles/GemTile.css';

function GemTile({ tile, onClick }) {
	let content = '';

	if (tile.revealed) {
		if (tile.type === 'bomb') content = '💣';
		else content = '💎';
	}

	// Если клетка — бомба, подсвечиваем
	const extraClass = tile.type === 'bomb' ? 'bomb-hint' : '';

	return (
		<div className={`tile ${extraClass}`} onClick={onClick}>
			{content}
		</div>
	);
}

export default GemTile;

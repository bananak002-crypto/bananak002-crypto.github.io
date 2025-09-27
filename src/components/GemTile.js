import React from 'react';
import '../styles/GemTile.css';

function GemTile({ tile, onClick }) {
	let content = '';

	if (tile.type === 'bomb') {
		content = '💣'; // always show bombs
	} else if (tile.revealed) {
		content = '💎';
	}

	const extraClass = tile.type === 'bomb' ? 'bomb-hint' : '';

	return (
		<div className={`tile ${extraClass}`} onClick={onClick}>
			{content}
		</div>
	);
}

export default GemTile;

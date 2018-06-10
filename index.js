function getDefaultConfig(index) {
	return {
		index,
		descSelector: '.ext-description',
		get summary() {
			const sumEl = document.createElement('summary');
			sumEl.className = 'ext-summary';
			sumEl.setAttribute('aria-describedby', `desc-${this.index}`);

			const icon = document.createElement('span');
			icon.className = 'fas fa-universal-access';
			icon.setAttribute('aria-hidden', true);

			const text = document.createElement('span');
			text.className = 'sr-only';
			text.textContent = 'More information';

			sumEl.appendChild(icon);
			sumEl.appendChild(text);

			return sumEl;
		},
		onOpen() {
			const icon = this.summary.querySelector('.fas');
			icon.className = 'fas fa-times';
			this.description.classList.add('open');
		},
		onClose() {
			this.description.classList.remove('open');
			const icon = this.summary.querySelector('.fas');
			icon.className = 'fas fa-universal-access';
			this.pos = {
				top: 0,
				left: 0,
			};
		},
	};
}

class ExtendedDescription {
	constructor(figure, index, config) {
		this.figure = figure;
		this.index = index;
		this.config = Object.assign({}, getDefaultConfig(index), config);
		this.summary = this.config.summary;

		this.setShort();
		this.initListeners();
	}

	get img() {
		return this.figure.querySelector('img');
	}

	get details() {
		return this.figure.querySelector('details');
	}

	get summary() {
		return this.details.querySelector('summary');
	}

	set summary(val) {
		let sumEl = val;
		if (val.nodeName !== 'summary') {
			sumEl = this.details.querySelector('summary') ||
				document.createElement('summary');
			if (typeof val === 'string') {
				sumEl.textContent = val;
			}
			if (val.nodeType === Node.ELEMENT_NODE) {
				sumEl.innerHTML = null;
				sumEl.appendChild(val);
			}
		} else if (this.summary) {
			this.summary.remove();
		}
		this.details.insertBefore(sumEl, this.details.firstChild);
	}

	get description() {
		return this.figure.querySelector(this.config.descSelector);
	}

	get pos() {
		const style = getComputedStyle(this.details);
		const top = parseInt(style.top);
		const left = parseInt(style.left);
		return { top, left };
	}

	set pos({ top, left }) {
		this.details.style.top = `${top}px`;
		this.details.style.left = `${left}px`;
	}

	get dragging() {
		return this.details.classList.contains('dragging');
	}

	setShort() {
		const short = this.figure.querySelector('.ext-short');
		short.id = `desc-${this.index}`;
		short.textContent = this.img.getAttribute('alt');
		short.setAttribute('aria-hidden', true);
	}

	initListeners() {
		this.summary.addEventListener('click', this.toggleDetails.bind(this));

		this.description.addEventListener('mousedown', this.startDrag.bind(this));
		document.addEventListener('mouseup', this.endDrag.bind(this));
		document.addEventListener('mousemove', this.drag.bind(this));
	}

	startDrag(e) {
		this.details.classList.add('dragging');
	}

	endDrag() {
		this.details.classList.remove('dragging');
	}

	drag(e) {
		if (this.dragging) {
			this.pos = {
				top: this.pos.top + e.movementY,
				left: this.pos.left + e.movementX,
			};
		}
	}

	toggleDetails() {
		if (this.details.open) {
			this.onClose();
		} else {
			this.onOpen();
		}
	}

	onOpen() {
		this.config.onOpen.call(this);
	}

	onClose() {
		this.config.onClose.call(this);
	}
}

function initFigure(figure, index) {
	const extDesc = new ExtendedDescription(figure, index);
}

window.addEventListener('DOMContentLoaded', () => {
	const figures = document.querySelectorAll('figure');
	figures.forEach(initFigure);
});

import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

// Original application code
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const whyInput = document.getElementById('why');
const pickerInput = document.getElementById('picker');
const cardsContainer = document.getElementById('cards');
const addCardBtn = document.getElementById('addCard');
const printCardsBtn = document.getElementById('printCards');
const exportCardsBtn = document.getElementById('exportCards');

let cardsData = JSON.parse(localStorage.getItem('shelfCards')) || [];

function saveCards() {
  localStorage.setItem('shelfCards', JSON.stringify(cardsData));
}

function renderCards() {
  cardsContainer.innerHTML = '';
  cardsData.forEach(data => {
    cardsContainer.appendChild(createCard(data.id, data.title, data.author, data.why, data.picker));
  });
}

function deleteCard(id) {
  cardsData = cardsData.filter(card => card.id !== id);
  saveCards();
  renderCards();
}

function markInvalid() {
  titleInput.classList.add('invalid');
  titleInput.setAttribute('aria-invalid', 'true');
}

function clearInvalid() {
  titleInput.classList.remove('invalid');
  titleInput.removeAttribute('aria-invalid');
}

function createCard(id, title, author, why, picker) {
  const card = document.createElement('article');
  card.className = 'shelf-card';

  const badge = document.createElement('div');
  badge.className = 'meta';
  badge.textContent = 'Staff Pick';

  const titleEl = document.createElement('h2');
  titleEl.className = 'title';
  titleEl.textContent = title;

  const authorEl = document.createElement('div');
  authorEl.className = 'author';
  authorEl.textContent = author || 'Author unknown';

  const reasonEl = document.createElement('div');
  reasonEl.className = 'reason';
  reasonEl.textContent = why || 'A favorite for thoughtful readers.';

  const pickerEl = document.createElement('div');
  pickerEl.className = 'picker';
  pickerEl.textContent = picker || 'Staff';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.onclick = () => deleteCard(id);
  deleteBtn.setAttribute('aria-label', 'Delete card');
  deleteBtn.title = 'Delete card';

  card.appendChild(badge);
  card.appendChild(titleEl);
  card.appendChild(authorEl);
  card.appendChild(reasonEl);
  card.appendChild(pickerEl);
  card.appendChild(deleteBtn);

  return card;
}

function addCard() {
  const title = titleInput.value.trim();

  if (!title) {
    markInvalid();
    titleInput.focus();
    return;
  }

  clearInvalid();

  const author = authorInput.value.trim();
  const why = whyInput.value.trim();
  const picker = pickerInput.value.trim();

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const newCard = { id, title, author, why, picker };
  cardsData.push(newCard);
  
  saveCards();
  renderCards();

  titleInput.value = '';
  authorInput.value = '';
  whyInput.value = '';
  pickerInput.value = '';
  titleInput.focus();
}

addCardBtn.addEventListener('click', addCard);
printCardsBtn.addEventListener('click', function () {
  window.print();
});

exportCardsBtn.addEventListener('click', function () {
  if (cardsData.length === 0) {
    alert('No cards to export.');
    return;
  }

  const csvHeader = 'Title,Author,Why We Like It,Picker\n';
  const csvRows = cardsData.map(card => {
    const sanitize = str => '"' + (str || '').replace(/"/g, '""') + '"';
    return [card.title, card.author, card.why, card.picker].map(sanitize).join(',');
  }).join('\n');

  const csvContent = csvHeader + csvRows;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'shelf_cards_' + new Date().toISOString().slice(0, 10) + '.csv';
  link.click();
});

titleInput.addEventListener('input', clearInvalid);
titleInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addCard();
  }
});

// Load existing cards on page load
renderCards();

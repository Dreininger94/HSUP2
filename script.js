// Fonctions utilitaires
const elementExists = (selector) => document.querySelector(selector) !== null;

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const getDayName = (date) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()];
};

// Gestion des données
const getSavedData = (date) => {
  const savedData = localStorage.getItem(date);
  return savedData ? JSON.parse(savedData) : {};
};

const saveData = (date, type, value) => {
  const currentData = getSavedData(date);
  currentData[type] = value;
  localStorage.setItem(date, JSON.stringify(currentData));
};

// Génération des options d'année
const generateYearOptions = () => {
  const yearSelect = document.getElementById('year-select');
  if (!yearSelect) return;

  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  yearSelect.value = currentYear;
};

// Génération des dates de l'année
const generateYearDates = (year) => {
  const dates = [];
  const date = new Date(year, 0, 1);

  while (date.getFullYear() === year) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

// Mise à jour du tableau
const updateTable = (year) => {
  const tbody = document.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const dates = generateYearDates(year);

  dates.forEach(date => {
    const row = document.createElement('tr');
    const dateKey = formatDate(date);
    const savedData = getSavedData(dateKey);

    row.innerHTML = `
      <td>${dateKey}</td>
      <td>${getDayName(date)}</td>
      <td><input type="text" class="time-input" maxlength="4" data-date="${dateKey}" data-type="start" value="${savedData.start || ''}"></td>
      <td><input type="text" class="time-input" maxlength="4" data-date="${dateKey}" data-type="end" value="${savedData.end || ''}"></td>
      <td><input type="checkbox" class="j1-checkbox" data-date="${dateKey}" ${savedData.j1 ? 'checked' : ''}></td>
    `;

    tbody.appendChild(row);
  });

  setupInputHandlers();
};

// Gestion des interactions
const setupInputHandlers = () => {
  const timeInputs = document.querySelectorAll('.time-input');
  
  timeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      if (e.target.value.length > 4) {
        e.target.value = e.target.value.slice(0, 4);
      }
    });

    input.addEventListener('change', (e) => {
      const date = e.target.dataset.date;
      const type = e.target.dataset.type;
      const value = e.target.value;
      saveData(date, type, value);
    });

    input.addEventListener('keydown', (e) => {
      const nextIndex = index + 1;
      const prevIndex = index - 1;

      switch (e.key) {
        case 'ArrowRight':
          if (nextIndex < timeInputs.length) timeInputs[nextIndex].focus();
          break;
        case 'ArrowLeft':
          if (prevIndex >= 0) timeInputs[prevIndex].focus();
          break;
        case 'ArrowDown':
          const nextRowIndex = index + 2;
          if (nextRowIndex < timeInputs.length) timeInputs[nextRowIndex].focus();
          break;
        case 'ArrowUp':
          const prevRowIndex = index - 2;
          if (prevRowIndex >= 0) timeInputs[prevRowIndex].focus();
          break;
        case 'Enter':
          e.preventDefault();
          if (nextIndex < timeInputs.length) {
            timeInputs[nextIndex].focus();
          } else {
            e.target.blur();
          }
          break;
      }
    });
  });

  document.querySelectorAll('.j1-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const date = e.target.dataset.date;
      const currentData = getSavedData(date);
      currentData.j1 = e.target.checked;
      localStorage.setItem(date, JSON.stringify(currentData));
    });
  });
};

// Gestion des boutons
const setupButtons = () => {
  // Bouton Horaires types
  const defaultHoursBtn = document.getElementById('default-hours-btn');
  const defaultHoursModal = document.getElementById('default-hours-modal');
  const applyDefaultBtn = document.getElementById('apply-default-hours');
  const defaultStartInput = document.getElementById('default-start');
  const defaultEndInput = document.getElementById('default-end');

  if (defaultHoursBtn && defaultHoursModal && applyDefaultBtn && defaultStartInput && defaultEndInput) {
    defaultHoursBtn.addEventListener('click', () => {
      defaultHoursModal.style.display = 'block';
    });

    applyDefaultBtn.addEventListener('click', () => {
      const start = defaultStartInput.value.replace(/\D/g, '');
      const end = defaultEndInput.value.replace(/\D/g, '');
      
      if (start.length === 4 && end.length === 4) {
        applyDefaultHours(start, end);
        defaultHoursModal.style.display = 'none';
        defaultStartInput.value = '';
        defaultEndInput.value = '';
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === defaultHoursModal) {
        defaultHoursModal.style.display = 'none';
      }
    });

    [defaultStartInput, defaultEndInput].forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        if (e.target.value.length > 4) {
          e.target.value = e.target.value.slice(0, 4);
        }
      });
    });
  }

  // Bouton Remplacer heures
  const replaceHoursBtn = document.getElementById('replace-hours-btn');
  const replaceHoursModal = document.getElementById('replace-hours-modal');
  const applyReplaceBtn = document.getElementById('apply-replace-hours');
  const replaceFromInput = document.getElementById('replace-from');
  const replaceToInput = document.getElementById('replace-to');

  if (replaceHoursBtn && replaceHoursModal && applyReplaceBtn && replaceFromInput && replaceToInput) {
    replaceHoursBtn.addEventListener('click', () => {
      replaceHoursModal.style.display = 'block';
    });

    applyReplaceBtn.addEventListener('click', () => {
      const from = replaceFromInput.value.replace(/\D/g, '');
      const to = replaceToInput.value.replace(/\D/g, '');
      const type = document.querySelector('input[name="replace-option"]:checked').value;
      
      if (from.length === 4 && to.length === 4) {
        replaceHours(type, from, to);
        replaceHoursModal.style.display = 'none';
        replaceFromInput.value = '';
        replaceToInput.value = '';
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === replaceHoursModal) {
        replaceHoursModal.style.display = 'none';
      }
    });

    [replaceFromInput, replaceToInput].forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        if (e.target.value.length > 4) {
          e.target.value = e.target.value.slice(0, 4);
        }
      });
    });
  }

  // Bouton Effacer saisies
  const clearHoursBtn = document.getElementById('clear-hours-btn');
  if (clearHoursBtn) {
    clearHoursBtn.addEventListener('click', () => {
      if (confirm("Êtes-vous sûr de vouloir effacer toutes les saisies pour l'année en cours?")) {
        clearCurrentYearData();
      }
    });
  }

  // Bouton Export CSV
  const exportCsvBtn = document.getElementById('export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const data = getAllSavedData();
      if (data.length === 0) {
        alert("Aucune donnée à exporter");
        return;
      }
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent);
    });
  }
};

// Fonctions supplémentaires pour les boutons
const applyDefaultHours = (start, end) => {
  const rows = document.querySelectorAll('tbody tr'); // Sélectionner toutes les lignes du tableau

  rows.forEach(row => {
    const dayCell = row.querySelector('td:nth-child(2)'); // La colonne "Jour" est la 2ème colonne
    const startInput = row.querySelector('input[data-type="start"]');
    const endInput = row.querySelector('input[data-type="end"]');

    // Vérifier si c'est un samedi ou un dimanche
    if (dayCell && (dayCell.textContent === 'Samedi' || dayCell.textContent === 'Dimanche')) {
      return; // Passer à la ligne suivante
    }

    // Appliquer les valeurs par défaut si les champs sont vides
    if (startInput && startInput.value === '') {
      startInput.value = start;
      saveData(startInput.dataset.date, 'start', start);
    }

    if (endInput && endInput.value === '') {
      endInput.value = end;
      saveData(endInput.dataset.date, 'end', end);
    }
  });
};


const replaceHours = (type, from, to) => {
  const inputs = document.querySelectorAll(`.time-input[data-type="${type}"]`);
  inputs.forEach(input => {
    if (input.value === from) {
      input.value = to;
      saveData(input.dataset.date, type, to);
    }
  });
};

const clearCurrentYearData = () => {
  const yearSelect = document.getElementById('year-select');
  const currentYear = Number(yearSelect.value);
  const dates = generateYearDates(currentYear);

  dates.forEach(date => {
    const dateKey = formatDate(date);
    localStorage.removeItem(dateKey);
  });

  updateTable(currentYear);
};

const getAllSavedData = () => {
  const data = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
      const entry = JSON.parse(localStorage.getItem(key));
      if (entry.start || entry.end || entry.j1) {
        data.push({
          date: key,
          start: entry.start || '',
          end: entry.end || '',
          j1: entry.j1 ? 'OUI' : 'NON'
        });
      }
    }
  }
  return data;
};

const convertToCSV = (data) => {
  data.sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));
  const headers = ["Date", "Debut", "Fin", "J+1"];
  const rows = data.map(item => [item.date, item.start, item.end, item.j1]);
  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
};

const downloadCSV = (csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HORAIRES_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Calcul de la durée de la pause déjeuner
const calculateDuration = (start, end) => {
  const startHours = parseInt(start.substring(0, 2), 10);
  const startMinutes = parseInt(start.substring(2, 4), 10);
  const endHours = parseInt(end.substring(0, 2), 10);
  const endMinutes = parseInt(end.substring(2, 4), 10);

  let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
};

const updateLunchDuration = () => {
  const start = document.getElementById('lunch-start').value;
  const end = document.getElementById('lunch-end').value;
  const durationDisplay = document.getElementById('lunch-duration');

  if (start.length === 4 && end.length === 4) {
    const { hours, minutes } = calculateDuration(start, end);
    durationDisplay.textContent = `${hours} heure(s) et ${minutes} minute(s)`;
  } else {
    durationDisplay.textContent = '0 heure(s) et 0 minute(s)';
  }
};

// Initialisation de la pause déjeuner
const setupLunchBreak = () => {
  const lunchStart = document.getElementById('lunch-start');
  const lunchEnd = document.getElementById('lunch-end');

  if (lunchStart && lunchEnd) {
    [lunchStart, lunchEnd].forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        if (e.target.value.length > 4) {
          e.target.value = e.target.value.slice(0, 4);
        }
        updateLunchDuration();
      });
    });
  }
};

// Initialisation
const init = () => {
  if (!elementExists('#year-select') || !elementExists('tbody')) {
    console.error('Éléments HTML manquants');
    return;
  }

  generateYearOptions();
  setupButtons();
  setupLunchBreak();

  const yearSelect = document.getElementById('year-select');
  yearSelect.addEventListener('change', (e) => {
    updateTable(Number(e.target.value));
  });

  updateTable(new Date().getFullYear());
};

document.addEventListener('DOMContentLoaded', init);

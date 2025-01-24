// Fonction pour vérifier si un élément existe
function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

// Fonction pour générer les options d'années
function generateYearOptions() {
  if (!elementExists('#year-select')) return;

  const yearSelect = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();

  // Vider les options existantes
  yearSelect.innerHTML = '';

  // Ajouter les 5 dernières années en ordre décroissant
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  // Sélectionner l'année courante par défaut
  yearSelect.value = currentYear;
}

// Fonction pour générer toutes les dates d'une année
function generateYearDates(year) {
  const dates = [];
  const date = new Date(year, 0, 1);

  while (date.getFullYear() === year) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
}

// Fonction pour formater la date en français
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

// Fonction pour obtenir le nom du jour en français
function getDayName(date) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[date.getDay()];
}

// Fonction pour mettre à jour le tableau
function updateTable(year) {
  if (!elementExists('tbody')) return;

  const tbody = document.querySelector('tbody');
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
    `;

    tbody.appendChild(row);
  });

  applyInputValidation();
  setupKeyboardNavigation();
  setupDataSaving();
}

// Obtenir les données sauvegardées pour une date
function getSavedData(date) {
  const savedData = localStorage.getItem(date);
  return savedData ? JSON.parse(savedData) : {};
}

// Sauvegarder les données
function saveData(date, type, value) {
  const currentData = getSavedData(date);
  currentData[type] = value;
  localStorage.setItem(date, JSON.stringify(currentData));
}

// Appliquer la validation des champs de saisie
function applyInputValidation() {
  const timeInputs = document.querySelectorAll('.time-input');

  timeInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      if (e.target.value.length > 4) {
        e.target.value = e.target.value.slice(0, 4);
      }
    });
  });
}

// Configuration de la sauvegarde des données
function setupDataSaving() {
  const inputs = document.querySelectorAll('.time-input');

  inputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const date = e.target.dataset.date;
      const type = e.target.dataset.type;
      const value = e.target.value;

      saveData(date, type, value);
    });
  });
}

// Configuration de la navigation au clavier
function setupKeyboardNavigation() {
  const inputs = document.querySelectorAll('.time-input');

  inputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
      const nextIndex = index + 1;
      const prevIndex = index - 1;

      // Navigation avec les flèches
      if (e.key === 'ArrowRight' && nextIndex < inputs.length) {
        inputs[nextIndex].focus();
      }
      if (e.key === 'ArrowLeft' && prevIndex >= 0) {
        inputs[prevIndex].focus();
      }
      if (e.key === 'ArrowDown') {
        const nextRowIndex = index + 2;
        if (nextRowIndex < inputs.length) {
          inputs[nextRowIndex].focus();
        }
      }
      if (e.key === 'ArrowUp') {
        const prevRowIndex = index - 2;
        if (prevRowIndex >= 0) {
          inputs[prevRowIndex].focus();
        }
      }

      // Validation avec Entrée
      if (e.key === 'Enter') {
        e.preventDefault();
        if (nextIndex < inputs.length) {
          inputs[nextIndex].focus();
        } else {
          input.blur();
        }
      }
    });
  });
}

// Gestion de la modal des horaires types
function setupDefaultHours() {
  if (!elementExists('#default-hours-modal')) return;

  const modal = document.getElementById('default-hours-modal');
  const openBtn = document.getElementById('default-hours-btn');
  const applyBtn = document.getElementById('apply-default-hours');
  const defaultStart = document.getElementById('default-start');
  const defaultEnd = document.getElementById('default-end');

  // Vérifier que tous les éléments nécessaires existent
  if (!modal || !openBtn || !applyBtn || !defaultStart || !defaultEnd) return;

  // Ouvrir la modal
  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Appliquer les horaires types
  applyBtn.addEventListener('click', () => {
    const startValue = defaultStart.value.replace(/\D/g, '');
    const endValue = defaultEnd.value.replace(/\D/g, '');

    if (startValue.length === 4 && endValue.length === 4) {
      applyDefaultHours(startValue, endValue);
      modal.style.display = 'none';
      defaultStart.value = '';
      defaultEnd.value = '';
    }
  });

  // Fermer la modal en cliquant à l'extérieur
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Validation des champs de la modal
  [defaultStart, defaultEnd].forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      if (e.target.value.length > 4) {
        e.target.value = e.target.value.slice(0, 4);
      }
    });
  });
}

// Appliquer les horaires types
function applyDefaultHours(start, end) {
  const inputs = document.querySelectorAll('.time-input');

  inputs.forEach(input => {
    const date = input.dataset.date;
    const day = new Date(date.split('/').reverse().join('-')).getDay();

    // Ne pas appliquer aux week-ends (samedi=6, dimanche=0)
    if (day !== 0 && day !== 6 && input.value === '') {
      input.value = input.dataset.type === 'start' ? start : end;
      saveData(date, input.dataset.type, input.value);
    }
  });
}

// Gestion de la modal de remplacement des heures
function setupReplaceHours() {
  if (!elementExists('#replace-hours-modal')) return;

  const modal = document.getElementById('replace-hours-modal');
  const openBtn = document.getElementById('replace-hours-btn');
  const applyBtn = document.getElementById('apply-replace-hours');
  const replaceFrom = document.getElementById('replace-from');
  const replaceTo = document.getElementById('replace-to');

  // Vérifier que tous les éléments nécessaires existent
  if (!modal || !openBtn || !applyBtn || !replaceFrom || !replaceTo) return;

  // Ouvrir la modal
  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Appliquer le remplacement
  applyBtn.addEventListener('click', () => {
    const fromValue = replaceFrom.value.replace(/\D/g, '');
    const toValue = replaceTo.value.replace(/\D/g, '');
    const option = document.querySelector('input[name="replace-option"]:checked').value;

    if (fromValue.length === 4 && toValue.length === 4) {
      replaceHours(option, fromValue, toValue);
      modal.style.display = 'none';
      replaceFrom.value = '';
      replaceTo.value = '';
    }
  });

  // Fermer la modal en cliquant à l'extérieur
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Validation des champs de la modal
  [replaceFrom, replaceTo].forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      if (e.target.value.length > 4) {
        e.target.value = e.target.value.slice(0, 4);
      }
    });
  });
}

// Fonction pour remplacer les heures
function replaceHours(type, fromValue, toValue) {
  const inputs = document.querySelectorAll(`.time-input[data-type="${type}"]`);

  inputs.forEach(input => {
    if (input.value === fromValue) {
      input.value = toValue;
      saveData(input.dataset.date, type, toValue);
    }
  });
}

// Fonction pour effacer les saisies pour l'année en cours
function clearCurrentYearData() {
  const yearSelect = document.getElementById('year-select');
  const currentYear = Number(yearSelect.value);
  const dates = generateYearDates(currentYear);

  dates.forEach(date => {
    const dateKey = formatDate(date);
    localStorage.removeItem(dateKey);
  });

  // Mettre à jour le tableau pour refléter les changements
  updateTable(currentYear);
}

// Configuration du bouton d'effacement des saisies
function setupClearHours() {
  const clearBtn = document.getElementById('clear-hours-btn');

  clearBtn.addEventListener('click', () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes les saisies pour l'année en cours?")) {
      clearCurrentYearData();
    }
  });
}

// Gestion de l'export CSV
function setupExportCSV() {
  if (!elementExists('#export-csv-btn')) return;

  const exportBtn = document.getElementById('export-csv-btn');

  exportBtn.addEventListener('click', () => {
    const data = getAllSavedData();
    if (data.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const csvContent = convertToCSV(data);
    downloadCSV(csvContent);
  });
}

// Obtenir toutes les données sauvegardées
function getAllSavedData() {
  const data = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) { // Vérifier le format de date
      const entry = JSON.parse(localStorage.getItem(key));
      if (entry.start || entry.end) { // Ne prendre que les lignes avec des données
        data.push({
          date: key,
          start: entry.start || '',
          end: entry.end || ''
        });
      }
    }
  }

  return data;
}

// Convertir les données en CSV
function convertToCSV(data) {
  // Trier les données par date
  data.sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));

  const headers = ["Date", "Debut", "Fin"];
  const rows = data.map(item => [
    item.date,
    item.start,
    item.end
  ]);

  const csvRows = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ];

  return csvRows.join("\n");
}

// Télécharger le fichier CSV
function downloadCSV(csvContent) {
  const now = new Date();
  const formattedDate = now.toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Créer un lien de téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = `HORAIRES_${formattedDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialisation
function init() {
  // Vérifier que les éléments nécessaires existent
  if (!elementExists('#year-select')) return;

  // Générer les options d'années
  generateYearOptions();

  // Configurer les fonctionnalités
  setupDefaultHours();
  setupReplaceHours();
  setupExportCSV();
  setupClearHours();

  const yearSelect = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();

  // Écouter les changements de sélection d'année
  yearSelect.addEventListener('change', (e) => {
    updateTable(Number(e.target.value));
  });

  // Générer le tableau initial avec l'année courante
  updateTable(currentYear);

  // Sélectionner l'année courante dans la liste déroulante
  yearSelect.value = currentYear;
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);

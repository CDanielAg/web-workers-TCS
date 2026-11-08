const input = document.querySelector('#csv-input');
const dropZone = document.querySelector('#drop-zone');
const results = document.querySelector('#results');
const errorMessage = document.querySelector('#error');
const fileName = document.querySelector('#file-name');
const rowCount = document.querySelector('#row-count');
const columnCount = document.querySelector('#column-count');
const status = document.querySelector('#status');
const tableHead = document.querySelector('#data-table thead');
const tableBody = document.querySelector('#data-table tbody');
const worker = new Worker('./js/csv-worker.js');

function showError(message) {
  results.hidden = true;
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}
function setProcessingState(name) {
  errorMessage.hidden = true; results.hidden = false; fileName.textContent = name;
  rowCount.textContent = 'Procesando…'; columnCount.textContent = '';
  status.textContent = 'Procesando'; tableHead.replaceChildren(); tableBody.replaceChildren();
}
function createRow(values, cellType) {
  const row = document.createElement('tr');
  values.forEach((value) => {
    const cell = document.createElement(cellType);
    cell.textContent = value;
    row.append(cell);
  });
  return row;
}
function renderTable(headers, rows) {
  tableHead.replaceChildren(createRow(headers, 'th'));
  const fragment = document.createDocumentFragment();
  rows.forEach((row) => fragment.append(createRow(row, 'td')));
  tableBody.replaceChildren(fragment);
}
async function processFile(file) {
  if (!file || !file.name.toLowerCase().endsWith('.csv')) {
    showError('Selecciona un archivo con extensión .csv.');
    return;
  }
  setProcessingState(file.name);
  try {
    const content = await file.text();
    worker.postMessage({ content, fileName: file.name });
  } catch {
    showError('No fue posible leer el archivo seleccionado.');
  }
}
worker.addEventListener('message', ({ data }) => {
  if (data.type === 'error') { showError(data.message); return; }
  const { headers, rows, sourceName } = data;
  renderTable(headers, rows);
  fileName.textContent = sourceName;
  rowCount.textContent = rows.length + (rows.length === 1 ? ' fila' : ' filas');
  columnCount.textContent = headers.length + (headers.length === 1 ? ' columna' : ' columnas');
  status.textContent = 'Procesamiento completado';
});
worker.addEventListener('error', () => showError('Ocurrió un error inesperado en el Web Worker.'));
input.addEventListener('change', () => processFile(input.files[0]));
['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault(); dropZone.classList.add('is-dragging');
  });
});
['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault(); dropZone.classList.remove('is-dragging');
  });
});
dropZone.addEventListener('drop', (event) => processFile(event.dataTransfer.files[0]));
dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
});

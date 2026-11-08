function detectDelimiter(firstLine) {
  const candidates = [',', ';', '\t'];
  return candidates.reduce((best, candidate) => {
    const count = firstLine.split(candidate).length;
    return count > best.count ? { value: candidate, count } : best;
  }, { value: ',', count: 0 }).value;
}
function parseCsv(content) {
  const normalized = content.replace(/^\uFEFF/, '');
  const firstLine = normalized.split(/\r?\n/, 1)[0];
  const delimiter = detectDelimiter(firstLine);
  const records = [];
  let record = [], field = '', insideQuotes = false;
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index], nextCharacter = normalized[index + 1];
    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') { field += '"'; index += 1; }
      else { insideQuotes = !insideQuotes; }
    } else if (character === delimiter && !insideQuotes) {
      record.push(field.trim()); field = '';
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      record.push(field.trim());
      if (record.some((value) => value !== '')) records.push(record);
      record = []; field = '';
    } else field += character;
  }
  record.push(field.trim());
  if (record.some((value) => value !== '')) records.push(record);
  if (insideQuotes) throw new Error('El archivo contiene comillas sin cerrar.');
  return records;
}
self.addEventListener('message', ({ data }) => {
  try {
    const records = parseCsv(data.content);
    if (records.length < 2) throw new Error('El CSV debe incluir encabezados y al menos una fila de datos.');
    const [headers, ...rows] = records;
    const normalizedRows = rows.map((row) => headers.map((_, index) => row[index] ?? ''));
    self.postMessage({ type: 'success', sourceName: data.fileName, headers, rows: normalizedRows });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message || 'No fue posible procesar el archivo CSV.' });
  }
});

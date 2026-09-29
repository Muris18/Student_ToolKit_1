// GPA calculator: weighted average of grade x credits
const rowsEl = document.getElementById('rows');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
let counter = 0;

function field(labelText, id, attrs) {
  const wrap = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = labelText;
  const input = document.createElement('input');
  input.id = id;
  Object.assign(input, attrs);
  wrap.append(label, input);
  return { wrap, input };
}

function addRow() {
  counter += 1;
  const row = document.createElement('div');
  row.className = 'row';

  const name = field('Subject', 'name' + counter, { type: 'text', placeholder: 'e.g. Math' });
  name.wrap.classList.add('subject');
  const grade = field('Grade', 'grade' + counter, { type: 'number', step: 'any', min: '0', inputMode: 'decimal' });
  const credits = field('Credits', 'credits' + counter, { type: 'number', step: 'any', min: '0', value: '1', inputMode: 'decimal' });

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove';
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', 'Remove this subject');
  remove.addEventListener('click', () => {
    row.remove();
    if (!rowsEl.children.length) addRow();
  });

  row.append(name.wrap, grade.wrap, credits.wrap, remove);
  rowsEl.append(row);
}

function calculate() {
  errorEl.textContent = '';
  let totalPoints = 0;
  let totalCredits = 0;
  let count = 0;

  for (const row of rowsEl.children) {
    const inputs = row.querySelectorAll('input');
    const gradeRaw = inputs[1].value.trim();
    const creditsRaw = inputs[2].value.trim();
    if (gradeRaw === '' && inputs[0].value.trim() === '') continue; // empty row
    const grade = Number(gradeRaw);
    const credits = Number(creditsRaw);
    if (gradeRaw === '' || !Number.isFinite(grade) || grade < 0) {
      errorEl.textContent = 'Enter a grade of 0 or more for every subject you added.';
      resultEl.hidden = true;
      return;
    }
    if (creditsRaw === '' || !Number.isFinite(credits) || credits <= 0) {
      errorEl.textContent = 'Credits must be greater than 0.';
      resultEl.hidden = true;
      return;
    }
    totalPoints += grade * credits;
    totalCredits += credits;
    count += 1;
  }

  if (count === 0) {
    errorEl.textContent = 'Add at least one subject with a grade.';
    resultEl.hidden = true;
    return;
  }

  const gpa = totalPoints / totalCredits;
  document.getElementById('gpa').textContent = gpa.toFixed(2);
  document.getElementById('summary').textContent =
    count + (count === 1 ? ' subject, ' : ' subjects, ') + totalCredits + ' credits in total.';
  resultEl.hidden = false;
}

function clearAll() {
  rowsEl.replaceChildren();
  errorEl.textContent = '';
  resultEl.hidden = true;
  addRow();
}

document.getElementById('add').addEventListener('click', addRow);
document.getElementById('calc').addEventListener('click', calculate);
document.getElementById('clear').addEventListener('click', clearAll);
addRow();

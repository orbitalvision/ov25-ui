import {
  E2E_FIXTURE_LEDGER,
  E2E_FIXTURE_LEDGER_VERSION,
  E2E_FIXTURE_RUNNER_COMMAND,
} from './config/e2e-fixture-ledger.js';

const ledgerRoot = document.getElementById('ledger');
const runAllCommand = `${E2E_FIXTURE_RUNNER_COMMAND} all`;
const runAllCode = document.getElementById('run-all-command');
const copyAllButton = document.getElementById('copy-all-command');

document.title = `OV25 UI — E2E Fixture Ledger v${E2E_FIXTURE_LEDGER_VERSION}`;
runAllCode.textContent = runAllCommand;

copyAllButton.addEventListener('click', async () => {
  await copyCommand(runAllCommand, copyAllButton);
});

if (E2E_FIXTURE_LEDGER.length === 0) {
  const empty = document.createElement('div');
  empty.className = 'empty';
  empty.textContent = 'No fixtures are currently marked safe to skip.';
  ledgerRoot.appendChild(empty);
}

for (const fixture of E2E_FIXTURE_LEDGER) {
  ledgerRoot.appendChild(renderFixtureCard(fixture));
}

function renderFixtureCard(fixture) {
  const card = document.createElement('article');
  card.className = 'fixture-card';

  const heading = document.createElement('div');
  heading.className = 'fixture-heading';

  const headingCopy = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = fixture.title;
  const id = document.createElement('div');
  id.className = 'fixture-id';
  id.textContent = fixture.id;
  headingCopy.append(title, id);

  const fixtureLink = document.createElement('a');
  fixtureLink.className = 'fixture-link';
  fixtureLink.href = fixture.fixturePath;
  fixtureLink.textContent = 'Open fixture ↗';
  heading.append(headingCopy, fixtureLink);
  card.appendChild(heading);

  const metaGrid = document.createElement('div');
  metaGrid.className = 'meta-grid';
  metaGrid.append(
    renderFileGroup('Fixture source', fixture.sourceFiles),
    renderFileGroup('Playwright specs', fixture.specFiles),
  );
  card.appendChild(metaGrid);

  const coverageTitle = document.createElement('h3');
  coverageTitle.textContent = 'Covered scenarios';
  card.append(coverageTitle, renderCoverageTable(fixture.tests));

  const artifactsTitle = document.createElement('h3');
  artifactsTitle.textContent = 'Visual artifacts';
  const artifactCopy = document.createElement('p');
  artifactCopy.className = 'artifact-copy';
  const baselines = fixture.visualArtifacts.baselineScreenshots;
  const reportScreenshots = fixture.visualArtifacts.reportScreenshots;
  artifactCopy.textContent = [
    fixture.visualArtifacts.note,
    baselines.length ? `Committed screenshot baselines: ${baselines.join(', ')}.` : '',
    reportScreenshots.length
      ? `Named report screenshots: ${reportScreenshots.join(', ')}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  card.append(artifactsTitle, artifactCopy);

  const commandTitle = document.createElement('h3');
  commandTitle.style.marginTop = '20px';
  commandTitle.textContent = 'Rerun this fixture';
  const command = `${E2E_FIXTURE_RUNNER_COMMAND} ${fixture.id}`;
  const commandShell = document.createElement('div');
  commandShell.className = 'command-shell';
  const code = document.createElement('code');
  code.textContent = command;
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = 'Copy command';
  copyButton.addEventListener('click', async () => {
    await copyCommand(command, copyButton);
  });
  commandShell.append(code, copyButton);
  card.append(commandTitle, commandShell);

  return card;
}

function renderFileGroup(titleText, files) {
  const group = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = titleText;
  const list = document.createElement('div');
  list.className = 'file-list';
  for (const file of files) {
    const code = document.createElement('code');
    code.textContent = file;
    list.appendChild(code);
  }
  group.append(title, list);
  return group;
}

function renderCoverageTable(tests) {
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['Playwright test', 'Viewport', 'Mode', 'Coverage']) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    headRow.appendChild(cell);
  }
  head.appendChild(headRow);

  const body = document.createElement('tbody');
  for (const test of tests) {
    const row = document.createElement('tr');
    for (const value of [test.title, test.viewport, test.mode, test.covers]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }
    body.appendChild(row);
  }
  table.append(head, body);
  return table;
}

async function copyCommand(command, button) {
  const originalLabel = button.textContent;
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy failed';
  }
  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1600);
}

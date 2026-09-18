const chapters = [...document.querySelectorAll('.chapter')];
const questionText = document.querySelector('#questionText');
const stageLabel = document.querySelector('#stageLabel');
const timelineFill = document.querySelector('#timelineFill');
const scrollFill = document.querySelector('#scrollFill');
const character = document.querySelector('#character');
const editToggle = document.querySelector('#editToggle');
const editPanel = document.querySelector('#editPanel');
const saveEdits = document.querySelector('#saveEdits');
const resetEdits = document.querySelector('#resetEdits');
const doneEditing = document.querySelector('#doneEditing');
const motionToggle = document.querySelector('#motionToggle');
const editableNodes = [...document.querySelectorAll('[data-editable]')];
const storageKey = 'kayli-portfolio-edits-v1';

document.querySelector('#year').textContent = new Date().getFullYear();

function updateScroll() {
  const doc = document.documentElement;
  const progress = Math.max(0, Math.min(1, doc.scrollTop / (doc.scrollHeight - doc.clientHeight)));
  scrollFill.style.width = `${progress * 100}%`;

  const wrap = document.querySelector('.timeline-wrap');
  const rect = wrap.getBoundingClientRect();
  const timelineProgress = Math.max(0, Math.min(1, (window.innerHeight * .5 - rect.top) / (rect.height - window.innerHeight * .5)));
  timelineFill.style.height = `${timelineProgress * 100}%`;
  character.style.setProperty('--journey-progress', timelineProgress);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    chapters.forEach(chapter => chapter.classList.remove('active'));
    entry.target.classList.add('active');
    const nextQuestion = entry.target.dataset.question;
    const nextStage = entry.target.dataset.stage;
    if (questionText.textContent !== nextQuestion) {
      questionText.textContent = nextQuestion;
      questionText.classList.remove('switching');
      void questionText.offsetWidth;
      questionText.classList.add('switching');
    }
    stageLabel.textContent = nextStage;
    stageLabel.style.background = nextStage === 'FINANCE' ? '#ff735f' : '#071522';
    stageLabel.style.color = nextStage === 'FINANCE' ? '#071522' : '#64e8d4';
  });
}, { rootMargin: '-32% 0px -45% 0px', threshold: 0.05 });

chapters.forEach(chapter => observer.observe(chapter));
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

function setEditing(enabled) {
  document.body.classList.toggle('editing', enabled);
  editToggle.setAttribute('aria-pressed', String(enabled));
  editPanel.classList.toggle('open', enabled);
  editableNodes.forEach(node => node.contentEditable = enabled ? 'true' : 'false');
  editToggle.querySelector('.edit-label').textContent = enabled ? 'Editing' : 'Edit story';
}

editToggle.addEventListener('click', () => setEditing(!document.body.classList.contains('editing')));
doneEditing.addEventListener('click', () => setEditing(false));

saveEdits.addEventListener('click', () => {
  const edits = editableNodes.map(node => node.innerHTML);
  localStorage.setItem(storageKey, JSON.stringify(edits));
  saveEdits.textContent = 'Saved';
  setTimeout(() => saveEdits.textContent = 'Save on this device', 1400);
});

resetEdits.addEventListener('click', () => {
  localStorage.removeItem(storageKey);
  location.reload();
});

try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(stored)) editableNodes.forEach((node, index) => {
    if (typeof stored[index] === 'string') node.innerHTML = stored[index];
  });
} catch (error) {
  localStorage.removeItem(storageKey);
}

motionToggle.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  motionToggle.textContent = paused ? 'Resume motion' : 'Pause motion';
  motionToggle.setAttribute('aria-pressed', String(paused));
});

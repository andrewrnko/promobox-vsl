/* Multiple-choice variant: every tap advances, the last tap opens the one-tap sheet. */
(function () {
  var steps = Array.prototype.slice.call(document.querySelectorAll('.quiz-step'));
  if (!steps.length || !window.PB) return;
  var bars = document.querySelectorAll('.quiz-bar span');
  var answers = {}, i = 0;

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
  }

  steps.forEach(function (step, k) {
    step.querySelectorAll('.opt-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        step.querySelectorAll('.opt-btn').forEach(function (o) { o.classList.remove('sel'); });
        b.classList.add('sel');
        answers[step.dataset.key] = b.dataset.val;
        setTimeout(function () {
          if (k < steps.length - 1) { go(k + 1); step.parentNode.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          else window.PB.open({ need: answers.need, note: 'When: ' + (answers.when || '-') + ' · For: ' + (answers.who || '-') });
        }, 160);
      });
    });
    var back = step.querySelector('.quiz-back');
    if (back) back.addEventListener('click', function () { go(k - 1); });
  });

  window.PB_ON_END = function () { document.querySelector('.quiz').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
})();

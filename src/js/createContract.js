const codeContentEl = document.getElementById('smart-contract-code');
const sendCodeBtn = document.getElementById('send-code');
const errEl = document.getElementById('code-error');

sendCodeBtn.addEventListener('click', () => {
  const codeContent = codeContentEl.value.trim();
  if (!codeContent.length) {
    return;
  }

  // $.ajax({
  //   method: 'POST',
  //   url: window.apiUrl + '/sk/create',
  //   data: { text: codeContent }
  // })
  //   .done(() => {
  //     location.reload();
  //   })
  //   .fail(() => {
  //     errEl.innerText = 'Ошибка!';
  //     errEl.classList.add('d-block');
  //   });
});

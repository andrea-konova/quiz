// обработчик событий, который отслеживает загрузку страницы
document.addEventListener('DOMContentLoaded', function () {
  const btnOpenModal = document.querySelector('#btnOpenModal');
  const modalBlock = document.querySelector('#modalBlock');
  const closeModal = document.querySelector('#closeModal');
  const questionTitle = document.querySelector('#question');
  const formAnswers = document.querySelector('#formAnswers');
  const burgerBtn = document.getElementById('burger');
  const prevButton = document.querySelector('#prev');
  const nextButton = document.querySelector('#next');
  const sendButton = document.querySelector('#send');
  const modalDialog = document.querySelector('.modal-dialog');
  const modalTitle = document.querySelector('.modal-title');

  // burger-menu
  let clientWidth = document.documentElement.clientWidth;

  if (clientWidth < 768) {
    burgerBtn.style.display = "flex";
  } else {
    burgerBtn.style.display = "none";
  }

  window.addEventListener('resize', function () {
    clientWidth = document.documentElement.clientWidth;

    if (clientWidth < 768) {
      burgerBtn.style.display = "flex";
    } else {
      burgerBtn.style.display = "none";
    }
  });

  burgerBtn.addEventListener('click', function () {
    burgerBtn.classList.add("active");
    modalBlock.classList.add('d-block');
    getData();
  });

  // База данных firebase
  const firebaseConfig = {
    apiKey: "AIzaSyBy_tFQSKX1S8gFaBuiu4EDx-02W9NYkTA",
    authDomain: "burger-quiz-3844a.firebaseapp.com",
    databaseURL: "https://burger-quiz-3844a.firebaseio.com",
    projectId: "burger-quiz-3844a",
    storageBucket: "burger-quiz-3844a.appspot.com",
    messagingSenderId: "530828408879",
    appId: "1:530828408879:web:eecc8573cfa7cd2fd36eda",
    measurementId: "G-02SX374VPM"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  let count = -100;

  const animateModal = () => {
    modalDialog.style.top = count + "%";
    count += 3;

    if (count < 0) {
      requestAnimationFrame(animateModal);
    } else {
      count = -100;
    }
  };

  // функция получения данных
  const getData = () => {
    // formAnswers.textContent = 'LOAD';
    formAnswers.innerHTML = `
    <div class="loader">
      <img src="image/spinner.svg" alt="LOAD">
    </div>
  `;

    prevButton.classList.add('d-none');
    sendButton.classList.add('d-none');

    setTimeout(() => {
      firebase.database().ref().child('questions').once('value')
      .then(snap => playTest(snap.val()))
    }, 500)
  }

  // обработчики события открытия/закрытия модального окна
  btnOpenModal.addEventListener('click', () => {
      requestAnimationFrame(animateModal);
      modalBlock.classList.add('d-block');
      getData();
  })

  closeModal.addEventListener('click', () => {
      modalBlock.classList.remove('d-block');
      burgerBtn.classList.remove("active");
  })

  // функция запуска тестирования
  const playTest = (questions) => {

    const finalAnswers = [];
    const obj = {};

    // переменная с номером вопроса
    let numberQuestion = 0;
    modalTitle.textContent = 'Ответь на вопрос';

    // функция рендеринга ответов
    const renderAnswers = (index) => {
      questions[index].answers.forEach((answer) => {
        const answerItem = document.createElement('div');

        answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');

        answerItem.innerHTML = `
          <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value="${answer.title}">
          <label for="${answer.title}" class="d-flex flex-column justify-content-between">
          <img class="answerImg" src="${answer.url}" alt="burger">
          <span>${answer.title}</span>
          </label>
        `;
        formAnswers.appendChild(answerItem);
      })
  } 
    // функция рендеринга вопросов и ответов
    const renderQuestion = (indexQuestion) => {
      formAnswers.innerHTML = '';

      if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
        questionTitle.textContent = `${questions[indexQuestion].question}`;
        renderAnswers(indexQuestion);
        nextButton.classList.remove('d-none');
        prevButton.classList.remove('d-none');
        sendButton.classList.add('d-none');
      }

      if (numberQuestion === 0) {
        prevButton.classList.add('d-none');
        sendButton.classList.add('d-none');
      }

      if (numberQuestion === questions.length) {
        questionTitle.textContent = '';
        modalTitle.textContent = '';

        nextButton.classList.add('d-none');
        prevButton.classList.add('d-none');
        sendButton.classList.remove('d-none');

        formAnswers.innerHTML = `
          <div class="form-group">
            <label for="numberPhone">Введите свой номер телефона</label>
            <input type="phone" class="form-control" id="numberPhone">
          </div>
        `;

        const numberPhone = document.getElementById('numberPhone');
        numberPhone.addEventListener('input', (event) => {
          event.target.value = event.target.value.replace(/[^0-9+-]/, '');
        });
      }

      if (numberQuestion === questions.length + 1) {
        formAnswers.textContent = 'Спасибо, наш менеджер свяжется с вами в течении 5 минут.';
        sendButton.classList.add('d-none');

        for (let key in obj) {
          let newObj = {};
          newObj[key] = obj[key];
          finalAnswers.push(newObj);
        }
        
        setTimeout(() => {
          modalBlock.classList.remove('d-block');
        }, 2000);
      }
    }

    // запуск функции рендеринга
    renderQuestion(numberQuestion);

    const checkAnswer = () => {
 
      const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === "numberPhone");

      inputs.forEach((input, index) => {
        if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
          obj[`${index}_${questions[numberQuestion].question}`] = input.value;
        }

        if (numberQuestion === questions.length) {
          obj['Номер телефона'] = input.value;
        }

      })
    }

    // обработчики событий кнопок next и prev 
    nextButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestion(numberQuestion);
    }

    prevButton.onclick = () => {
      numberQuestion--;
      renderQuestion(numberQuestion);
    }

    sendButton.onclick = () => {
      checkAnswer();
      numberQuestion++;
      renderQuestion(numberQuestion);
      firebase
      .database()
      .ref()
      .child('contacts')
      .push(finalAnswers)
    }
  }

})

document.addEventListener('DOMContentLoaded', function () {
  const taskList = document.getElementById('task-list');

  let text;
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    const initData = window.Telegram.WebApp.initDataUnsafe;
    text = JSON.stringify(initData);
    console.log('==== 00: ')
    console.log(initData)
  } else {
    text = 'Not running inside Telegram Web App';
  }
  console.log('==== 01 text: ', text)
  console.log('==== 02 location.hash.toString(): ', location.hash.toString())
  console.log('==== 03')

  let tg = window.Telegram.WebApp

  // главная кнопка
  tg.MainButton.show();
  tg.MainButton.setText('Главная кнопка (отправить)');
  tg.MainButton.onClick(() => {
    console.log('==== Главная кнопка Clicked 02')
    tg.sendData('Данные клиента: Главная кнопка Clicked');
  });

  document.getElementById('testButton').addEventListener('click', function () {
    tg.setHeaderColor('#fcb69f')
    console.log(tg)
  });

  document.getElementById('testButton2').addEventListener('click', function () {
    tg.close()
  });


  const tasks = [
    { id: 1, title: 'Задача 1', completed: false },
    { id: 2, title: 'Задача 2', completed: true },
    { id: 3, title: 'Задача 3', completed: false }
  ]
  tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.classList.add('col-md-4', 'task-card');
    if (task.completed) {
      taskCard.classList.add('completed');
    }

    taskCard.innerHTML = `
                  <h5>${task.title}</h5>
                  <p>Статус: ${task.completed ? '✅' : '☑️'}</p>
                  <small>ID задачи: ${task.id}</small>
              `;

    taskList.appendChild(taskCard);
  });

});
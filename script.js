document.addEventListener('DOMContentLoaded', function () {

  let tg = window.Telegram.WebApp
  console.log('==== tg', tg)

  // главная кнопка
  tg.MainButton.show();
  tg.MainButton.setText('Отправить');
  tg.MainButton.onClick(() => {
    console.log('==== Главная кнопка Clicked')
    tg.ready();
    tg.sendData(JSON.stringify({ type: 'mainButtonClicked', value: '1', cost: 'data' }));
  });

  document.getElementById('testButton').addEventListener('click', function () {
    tg.setHeaderColor('#fcb69f')
  });

  document.getElementById('testButton2').addEventListener('click', function () {
    tg.sendData(JSON.stringify({ type: 'secondButtonClicked', value: '2', cost: 'data new' }));
    // tg.close()
  });


  // Список задач
  const tasks = [
    { id: 1, title: 'Задача 1', completed: false },
    { id: 2, title: 'Задача 2', completed: true },
    { id: 3, title: 'Задача 3', completed: false }
  ]

  const taskList = document.getElementById('task-list');

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
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

  fetch('https://jsonplaceholder.typicode.com/todos')
    .then(response => response.json())
    .then(tasks => {
      tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('col-md-4', 'task-card');
        if (task.completed) {
          taskCard.classList.add('completed');
        }

        taskCard.innerHTML = `
                  <h5>${task.title}</h5>
                  <p>Статус: ${task.completed ? 'Выполнено' : 'Не выполнено'}</p>
                  <small>ID задачи: ${task.id}</small>
              `;

        taskList.appendChild(taskCard);
      });
    })
    .catch(error => {
      console.error('Ошибка при получении задач:', error);
    });
});
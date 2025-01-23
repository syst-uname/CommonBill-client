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

  document.getElementById('testButton').addEventListener('click', async () => {
    tg.setHeaderColor('#fcb69f')
    const value = document.getElementById('title').value;
    const data = {
      text: 'Отправленные данные',
      value,
    };

    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbwxXtyCDPISdPIVTnQx5kAhYv233mXYGfI3q1cp1fh1eYRMmjAUNZz7haYV8hqJh3Cu/exec';

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Получаем ответ от сервера
      const result = await response.json();
      console.log('==== result', result)
    } catch (error) {
      // В случае ошибки выводим сообщение
      document.getElementById('response').innerHTML = '<p>Error sending data</p>';
      console.error('Error:', error);
    }


  });

  document.getElementById('testButton2').addEventListener('click', function () {
    tg.sendData(JSON.stringify({ type: 'secondButtonClicked', value: '2', cost: 'data new' }));
    // tg.close()
  });


  // Список задач
  // const tasks = [
  //   { id: 1, title: 'Задача 1', completed: false },
  //   { id: 2, title: 'Задача 2', completed: true },
  //   { id: 3, title: 'Задача 3', completed: false }
  // ]

  // const taskList = document.getElementById('task-list');

  // tasks.forEach(task => {
  //   const taskCard = document.createElement('div');
  //   taskCard.classList.add('col-md-4', 'task-card');
  //   if (task.completed) {
  //     taskCard.classList.add('completed');
  //   }

  //   taskCard.innerHTML = `
  //                 <h5>${task.title}</h5>
  //                 <p>Статус: ${task.completed ? '✅' : '☑️'}</p>
  //                 <small>ID задачи: ${task.id}</small>
  //             `;

  //   taskList.appendChild(taskCard);
  // });

});
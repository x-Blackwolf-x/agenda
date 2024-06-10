document.addEventListener('DOMContentLoaded', function () {
    const newTaskForm = document.getElementById('new-task-form');

    newTaskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const clientName = document.getElementById('client-name').value;
        const clientPhone = document.getElementById('client-phone').value;
        const clientEmail = document.getElementById('client-email').value;
        const clientAddress = document.getElementById('client-address').value;
        const taskType = document.getElementById('task-type').value;
        const taskDate = document.getElementById('task-date').value;
        const taskDuration = document.getElementById('task-duration').value;
        const assignedUsers = Array.from(document.getElementById('assigned-users').selectedOptions).map(option => option.value);

        fetch('/createTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientName,
                clientPhone,
                clientEmail,
                clientAddress,
                taskType,
                date: taskDate,
                duration: taskDuration,
                assignedUsers,
                task: taskType,
                status: 'pendiente'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tarea creada correctamente');
                window.location.href = 'index.html#menu-new-task';
            } else {
                alert('Error al crear la tarea: ' + data.message);
            }
        });
    });

    function loadTaskTypes() {
        fetch('/taskColors')
        .then(response => response.json())
        .then(data => {
            const taskTypeSelect = document.getElementById('task-type');
            taskTypeSelect.innerHTML = '';
            for (const task in data) {
                const option = document.createElement('option');
                option.value = task;
                option.textContent = task;
                taskTypeSelect.appendChild(option);
            }
        });
    }

    function loadUsers() {
        fetch('/users')
        .then(response => response.json())
        .then(data => {
            const assignedUserSelect = document.getElementById('assigned-users');
            assignedUserSelect.innerHTML = '';
            data.forEach(user => {
                if (user.role !== 'superadmin') {
                    const option = document.createElement('option');
                    option.value = user.username;
                    option.textContent = user.username;
                    assignedUserSelect.appendChild(option);
                }
            });
        });
    }

    loadTaskTypes();
    loadUsers();
});

document.addEventListener('DOMContentLoaded', function () {
    const taskDetailsElement = document.getElementById('task-details');
    const taskStatusForm = document.getElementById('update-status-form');
    const taskStatusSelect = document.getElementById('task-status');
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('id');

    fetch(`/taskDetails?id=${taskId}`)
    .then(response => response.json())
    .then(task => {
        taskDetailsElement.innerHTML = `
            <p>Tarea: ${task.task}</p>
            <p>Cliente: ${task.clientName}</p>
            <p>Teléfono: ${task.clientPhone}</p>
            <p>Email: ${task.clientEmail}</p>
            <p>Dirección: ${task.clientAddress}</p>
            <p>Fecha: ${task.date}</p>
            <p>Duración: ${task.duration} horas</p>
            <p>Asignado a: ${task.assignedUsers.join(', ')}</p>
        `;
        taskStatusSelect.value = task.status;
    })
    .catch(error => {
        taskDetailsElement.textContent = 'Error al cargar los detalles de la tarea';
    });

    taskStatusForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newStatus = taskStatusSelect.value;

        fetch('/updateTaskStatus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Estado de la tarea actualizado correctamente');
            } else {
                alert('Error al actualizar el estado de la tarea: ' + data.message);
            }
        });
    });
});

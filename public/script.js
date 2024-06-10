document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const roleForm = document.getElementById('role-form');
    const createRoleForm = document.getElementById('create-role-form');
    const deleteRoleForm = document.getElementById('delete-role-form');
    const createUserForm = document.getElementById('create-user-form');
    const taskTypeForm = document.getElementById('task-type-form');
    const settingsForm = document.getElementById('settings-form');
    const deleteTaskTypeForm = document.getElementById('delete-task-type-form');
    const newTaskForm = document.getElementById('new-task-form');
    const searchForm = document.getElementById('search-form');
    const logoutButton = document.getElementById('menu-logout');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const viewProfileLink = document.getElementById('view-profile');
    const changePasswordLink = document.getElementById('change-password');
    const profileEditForm = document.getElementById('profile-edit-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const sections = document.querySelectorAll('.content-section');
    const sidebarLinks = document.querySelectorAll('#sidebar ul li a');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const currentDateElement = document.getElementById('current-date');
    const recentTasksElement = document.getElementById('recent-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const taskListElement = document.getElementById('task-list');
    const searchResultsElement = document.getElementById('search-results');
    const userNameElement = document.getElementById('user-name');
    const profilePictureElement = document.getElementById('profile-picture');
    let currentUser;
    let taskColors = {};
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function showSection(id) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(id).style.display = 'block';
    }

    function updateMenuVisibility() {
        document.getElementById('menu-login').style.display = currentUser ? 'none' : 'block';
        document.getElementById('menu-welcome').style.display = currentUser ? 'block' : 'none';
        document.getElementById('menu-calendar').style.display = currentUser ? 'block' : 'none';
        document.getElementById('menu-new-task').style.display = currentUser ? 'block' : 'none';
        document.getElementById('menu-search').style.display = currentUser ? 'block' : 'none';
        document.getElementById('menu-admin').style.display = currentUser && currentUser.role === 'superadmin' ? 'block' : 'none';
        document.getElementById('menu-settings').style.display = currentUser && currentUser.role === 'superadmin' ? 'block' : 'none';
        document.getElementById('menu-logout').style.display = currentUser ? 'block' : 'none';
        document.getElementById('profile-container').style.display = currentUser ? 'flex' : 'none';
    }

    function showWelcomePage() {
        const currentDate = new Date();
        currentDateElement.textContent = `Fecha actual: ${currentDate.toLocaleDateString()}`;
        
        fetch('/recentTasks')
        .then(response => response.json())
        .then(tasks => {
            recentTasksElement.innerHTML = '';
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.textContent = `Tarea: ${task.task}, Cliente: ${task.clientName}, Teléfono: ${task.clientPhone}, Email: ${task.clientEmail}, Dirección: ${task.clientAddress}, Fecha: ${task.date}, Duración: ${task.duration}h`;
                taskItem.addEventListener('click', () => {
                    window.location.href = `task.html?id=${task.id}`;
                });
                recentTasksElement.appendChild(taskItem);
            });
        });

        fetch('/completedTasks')
        .then(response => response.json())
        .then(tasks => {
            completedTasksElement.innerHTML = '';
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.textContent = `Tarea: ${task.task}, Cliente: ${task.clientName}, Teléfono: ${task.clientPhone}, Email: ${task.clientEmail}, Dirección: ${task.clientAddress}, Fecha: ${task.date}, Duración: ${task.duration}h`;
                taskItem.addEventListener('click', () => {
                    window.location.href = `task.html?id=${task.id}`;
                });
                completedTasksElement.appendChild(taskItem);
            });
        });
    }

    function showTasks() {
        fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            taskListElement.innerHTML = '';
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                const taskLink = document.createElement('a');
                taskLink.textContent = `Tarea: ${task.task}, Cliente: ${task.clientName}, Fecha: ${task.date}`;
                taskLink.href = `task.html?id=${task.id}`;
                taskItem.appendChild(taskLink);
                taskListElement.appendChild(taskItem);
            });
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const id = link.getAttribute('id').replace('menu-', '') + '-container';
            showSection(id);
            if (id === 'welcome-container') {
                showWelcomePage();
            }
            if (id === 'calendar-container') {
                loadUserCalendar(currentUser.username);
            }
            if (id === 'new-task-container') {
                showTasks();
            }
        });
    });

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = { username, role: data.role };
                userNameElement.textContent = username;
                updateMenuVisibility();
                showSection('welcome-container');
                showWelcomePage();
                loadUserProfile(username); // Load profile picture and other details
                if (data.role === 'superadmin') {
                    loadRoles();
                    loadPermissions();
                    loadTaskColors();
                    loadTaskTypes();
                    loadUsers();
                }
            } else {
                alert('Credenciales incorrectas');
            }
        });
    });

    roleForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const targetUsername = document.getElementById('target-username').value;
        const newRole = document.getElementById('role').value;

        fetch('/assignRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUsername: currentUser.username, username: targetUsername, newRole })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Rol asignado correctamente');
            } else {
                alert('Error al asignar rol: ' + data.message);
            }
        });
    });

    createRoleForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const roleName = document.getElementById('role-name').value;
        const permissions = Array.from(document.querySelectorAll('#permissions input:checked')).map(input => input.value);

        fetch('/createRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUsername: currentUser.username, roleName, permissions })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Rol creado correctamente');
                loadRoles();
            } else {
                alert('Error al crear rol: ' + data.message);
            }
        });
    });

    deleteRoleForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const roleName = document.getElementById('delete-role').value;

        fetch('/deleteRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUsername: currentUser.username, roleName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Rol eliminado correctamente');
                loadRoles();
            } else {
                alert('Error al eliminar rol: ' + data.message);
            }
        });
    });

    createUserForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('create-username').value;
        const password = document.getElementById('create-password').value;
        const role = document.getElementById('create-role').value;

        fetch('/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUsername: currentUser.username, username, password, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuario creado correctamente');
                loadUsers();
            } else {
                alert('Error al crear usuario: ' + data.message);
            }
        });
    });

    taskTypeForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const newTaskType = document.getElementById('new-task-type').value;
        const taskColor = document.getElementById('task-color').value;

        if (taskColors[newTaskType]) {
            alert('El tipo de tarea ya existe');
            return;
        }

        taskColors[newTaskType] = taskColor;
        addTaskColorInput(newTaskType, taskColor);
        document.getElementById('new-task-type').value = '';
        document.getElementById('task-color').value = '#000000';
        loadTaskTypes();
    });

    deleteTaskTypeForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const taskType = document.getElementById('delete-task-type').value;

        fetch('/deleteTaskType', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminUsername: currentUser.username, taskType })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tipo de tarea eliminado correctamente');
                loadTaskColors();
                loadTaskTypes();
                loadUserCalendar(currentUser.username); // Recargar el calendario para reflejar los cambios
            } else {
                alert('Error al eliminar tipo de tarea: ' + data.message);
            }
        });
    });

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
                showSection('new-task-container'); // Mostrar la lista de tareas después de crear la tarea
                showTasks();
            } else {
                alert('Error al crear la tarea: ' + data.message);
            }
        });
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchName = document.getElementById('search-name').value;
        const searchAddress = document.getElementById('search-address').value;
        const searchPhone = document.getElementById('search-phone').value;
        const searchEmail = document.getElementById('search-email').value;
        const searchStartDate = document.getElementById('search-start-date').value;
        const searchEndDate = document.getElementById('search-end-date').value;

        fetch('/searchTasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: searchName,
                address: searchAddress,
                phone: searchPhone,
                email: searchEmail,
                startDate: searchStartDate,
                endDate: searchEndDate
            })
        })
        .then(response => response.json())
        .then(data => {
            searchResultsElement.innerHTML = '';
            data.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.textContent = `Tarea: ${task.task}, Cliente: ${task.clientName}, Teléfono: ${task.clientPhone}, Email: ${task.clientEmail}, Dirección: ${task.clientAddress}, Fecha: ${task.date}, Duración: ${task.duration}h`;
                searchResultsElement.appendChild(taskItem);
            });
        });
    });

    logoutButton.addEventListener('click', function () {
        currentUser = null;
        updateMenuVisibility();
        showSection('login-container');
    });

    profileMenuButton.addEventListener('click', function () {
        const profileMenu = document.getElementById('profile-menu');
        profileMenu.classList.toggle('show');
    });

    viewProfileLink.addEventListener('click', function () {
        showSection('profile-edit-container');
        fetch(`/getUserProfile?username=${currentUser.username}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('profile-name').value = data.name || '';
            document.getElementById('profile-surname').value = data.surname || '';
            document.getElementById('profile-email').value = data.email || '';
            document.getElementById('profile-phone').value = data.phone || '';
            profilePictureElement.src = data.profilePicture || 'default-profile.png';
        });
    });

    changePasswordLink.addEventListener('click', function () {
        showSection('change-password-container');
    });

    profileEditForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('profile-name').value;
        const surname = document.getElementById('profile-surname').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
        const password = document.getElementById('profile-password').value;
        const profilePictureFile = document.getElementById('profile-picture-upload').files[0];

        const formData = new FormData();
        formData.append('username', currentUser.username);
        formData.append('name', name);
        formData.append('surname', surname);
        formData.append('email', email);
        formData.append('phone', phone);
        if (password) {
            formData.append('password', password);
        }
        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile);
        }

        fetch('/updateUserProfile', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Perfil actualizado correctamente');
                userNameElement.textContent = name || currentUser.username;
                showSection('welcome-container');
            } else {
                alert('Error al actualizar el perfil: ' + data.message);
            }
        });
    });

    changePasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;

        fetch('/changePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser.username,
                oldPassword,
                newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Contraseña cambiada correctamente');
                showSection('welcome-container');
            } else {
                alert('Error al cambiar la contraseña: ' + data.message);
            }
        });
    });

    function addTaskColorInput(task, color) {
        const taskColorsContainer = document.getElementById('task-colors');
        const label = document.createElement('label');
        label.textContent = `Color para ${task}: `;
        const input = document.createElement('input');
        input.type = 'color';
        input.name = task;
        input.value = color;
        label.appendChild(input);
        taskColorsContainer.appendChild(label);
        taskColorsContainer.appendChild(document.createElement('br'));
    }

    function loadUserCalendar(username) {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        fetch(`/assignments?username=${username}`)
        .then(response => response.json())
        .then(assignments => {
            const date = new Date(currentYear, currentMonth, 1);
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const startDay = date.getDay();
            calendarMonthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${currentYear}`;

            const weekDays = ['Semana', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            weekDays.forEach(day => {
                const dayCell = document.createElement('div');
                dayCell.textContent = day;
                dayCell.classList.add('header');
                calendar.appendChild(dayCell);
            });

            let weekNumber = getWeekNumber(date);
            let weekCell = document.createElement('div');
            weekCell.textContent = weekNumber;
            weekCell.classList.add('header');
            calendar.appendChild(weekCell);

            // Empty cells for days of the previous month
            for (let i = 0; i < startDay; i++) {
                const emptyCell = document.createElement('div');
                calendar.appendChild(emptyCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.textContent = day;
                dayCell.classList.add('day-cell');
                const dayAssignments = assignments.filter(a => new Date(a.date).getDate() === day);
                dayAssignments.forEach(assignment => {
                    const assignmentElement = document.createElement('div');
                    assignmentElement.textContent = `${assignment.task} (${assignment.duration}h)`;
                    assignmentElement.style.backgroundColor = taskColors[assignment.task] || '#ecf0f1';
                    assignmentElement.classList.add('assignment');
                    assignmentElement.addEventListener('click', () => {
                        window.location.href = `task.html?id=${assignment.id}`;
                    });
                    dayCell.appendChild(assignmentElement);
                });
                calendar.appendChild(dayCell);

                if ((day + startDay) % 7 === 0) {
                    weekNumber++;
                    const weekCell = document.createElement('div');
                    weekCell.textContent = weekNumber;
                    calendar.appendChild(weekCell);
                }
            }
        });
    }

    function loadRoles() {
        fetch('/roles')
        .then(response => response.json())
        .then(data => {
            const roleSelect = document.getElementById('role');
            const createRoleSelect = document.getElementById('create-role');
            const deleteRoleSelect = document.getElementById('delete-role');
            roleSelect.innerHTML = '';
            createRoleSelect.innerHTML = '';
            deleteRoleSelect.innerHTML = '';
            for (const role in data) {
                if (role !== 'superadmin') { // Excluye superadmin
                    const option = document.createElement('option');
                    option.value = role;
                    option.textContent = role;
                    roleSelect.appendChild(option);
                    createRoleSelect.appendChild(option.cloneNode(true));
                    deleteRoleSelect.appendChild(option.cloneNode(true));
                }
            }
        });
    }

    function loadPermissions() {
        fetch('/permissions')
        .then(response => response.json())
        .then(data => {
            const permissionsContainer = document.getElementById('permissions');
            permissionsContainer.innerHTML = '';
            data.forEach(permission => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = permission;
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(permission));
                permissionsContainer.appendChild(label);
                permissionsContainer.appendChild(document.createElement('br'));
            });
        });
    }

    function loadTaskColors() {
        fetch('/taskColors')
        .then(response => response.json())
        .then(data => {
            taskColors = data;
            const taskColorsContainer = document.getElementById('task-colors');
            taskColorsContainer.innerHTML = '';
        });
    }

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

    function loadUserProfile(username) {
        fetch(`/getUserProfile?username=${username}`)
        .then(response => response.json())
        .then(data => {
            profilePictureElement.src = data.profilePicture || 'default-profile.png';
        });
    }

    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    prevMonthButton.addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        loadUserCalendar(currentUser.username);
    });

    nextMonthButton.addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        loadUserCalendar(currentUser.username);
    });

    updateMenuVisibility();
    showSection('login-container');
});

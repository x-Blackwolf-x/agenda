const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos subidos

// Simulación de base de datos en memoria
let users = [
    { username: 'blackwolf', password: 'AmbarRojo8', role: 'superadmin' } // Super Administrador por defecto
];
let roles = { 
    'superadmin': ['gestionarRoles', 'asignarTareas', 'verTareas', 'crearTareas', 'editarTareas', 'eliminarTareas'],
    'user': ['verTareas'] 
};

let taskColors = {};
let tasks = [];

function findUser(username) {
    return users.find(u => u.username === username);
}

// Endpoint de registro de usuario (solo superadmin puede usarlo)
app.post('/createUser', (req, res) => {
    const { adminUsername, username, password, role } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        if (findUser(username)) {
            res.status(400).send({ success: false, message: 'Usuario ya existe' });
        } else {
            const newUser = { username, password, role: role || 'user' };
            users.push(newUser);
            res.status(201).send({ success: true, message: 'Usuario creado' });
        }
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint de autenticación
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = findUser(username);
    if (user && user.password === password) {
        res.status(200).send({ success: true, message: 'Login exitoso', role: user.role });
    } else {
        res.status(401).send({ success: false, message: 'Credenciales incorrectas' });
    }
});

// Endpoint para asignar roles
app.post('/assignRole', (req, res) => {
    const { adminUsername, username, newRole } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        if (newRole === 'superadmin') {
            res.status(403).send({ success: false, message: 'No se puede asignar el rol de superadministrador' });
            return;
        }
        const user = findUser(username);
        if (user) {
            user.role = newRole;
            res.status(200).send({ success: true, message: 'Rol asignado correctamente' });
        } else {
            res.status(404).send({ success: false, message: 'Usuario no encontrado' });
        }
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint para crear roles (solo superadmin puede usarlo)
app.post('/createRole', (req, res) => {
    const { adminUsername, roleName, permissions } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        if (roles[roleName]) {
            res.status(400).send({ success: false, message: 'El rol ya existe' });
        } else {
            roles[roleName] = permissions;
            res.status(201).send({ success: true, message: 'Rol creado' });
        }
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint para eliminar roles
app.post('/deleteRole', (req, res) => {
    const { adminUsername, roleName } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        if (roles[roleName]) {
            delete roles[roleName];
            res.status(200).send({ success: true, message: 'Rol eliminado' });
        } else {
            res.status(400).send({ success: false, message: 'El rol no existe' });
        }
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint para obtener usuarios
app.get('/users', (req, res) => {
    res.status(200).send(users);
});

// Endpoint para obtener roles
app.get('/roles', (req, res) => {
    res.status(200).send(roles);
});

// Endpoint para obtener permisos
app.get('/permissions', (req, res) => {
    const permissions = ['verTareas', 'crearTareas', 'editarTareas', 'eliminarTareas', 'asignarTareas', 'gestionarRoles'];
    res.status(200).send(permissions);
});

// Endpoint para obtener colores de tareas
app.get('/taskColors', (req, res) => {
    res.status(200).send(taskColors);
});

// Endpoint para guardar colores de tareas (solo superadmin puede usarlo)
app.post('/saveTaskColors', (req, res) => {
    const { adminUsername, taskColors: newTaskColors } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        taskColors = newTaskColors;
        res.status(200).send({ success: true, message: 'Colores de tareas guardados' });
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint para crear una nueva tarea
app.post('/createTask', (req, res) => {
    const { task, date, clientName, clientPhone, clientEmail, clientAddress, taskType, duration, assignedUsers, status } = req.body;
    assignedUsers.forEach(username => {
        const newTask = {
            id: tasks.length + 1,
            username,
            task,
            date,
            clientName,
            clientPhone,
            clientEmail,
            clientAddress,
            duration,
            taskType,
            status
        };
        tasks.push(newTask);
    });
    res.status(201).send({ success: true, message: 'Tarea creada' });
});

// Endpoint para eliminar tipos de tarea (solo superadmin puede usarlo)
app.post('/deleteTaskType', (req, res) => {
    const { adminUsername, taskType } = req.body;
    const adminUser = findUser(adminUsername);
    if (adminUser && adminUser.role === 'superadmin') {
        if (taskColors[taskType]) {
            // Eliminar todas las tareas con el tipo de tarea especificado
            tasks = tasks.filter(task => task.task !== taskType);
            delete taskColors[taskType];
            res.status(200).send({ success: true, message: 'Tipo de tarea y tareas asociadas eliminadas' });
        } else {
            res.status(400).send({ success: false, message: 'El tipo de tarea no existe' });
        }
    } else {
        res.status(403).send({ success: false, message: 'No autorizado' });
    }
});

// Endpoint para obtener tareas recientes
app.get('/recentTasks', (req, res) => {
    const recentTasks = tasks.filter(task => task.status !== 'finalizada').slice(-5); // Obtener las últimas 5 tareas no finalizadas
    res.status(200).send(recentTasks);
});

// Endpoint para obtener tareas finalizadas
app.get('/completedTasks', (req, res) => {
    const completedTasks = tasks.filter(task => task.status === 'finalizada');
    res.status(200).send(completedTasks);
});

// Endpoint para obtener tareas asignadas a un usuario
app.get('/assignments', (req, res) => {
    const { username } = req.query;
    const userTasks = tasks.filter(task => task.username === username);
    res.status(200).send(userTasks);
});

// Endpoint para obtener todas las tareas
app.get('/tasks', (req, res) => {
    res.status(200).send(tasks);
});

// Endpoint para obtener detalles de una tarea específica
app.get('/taskDetails', (req, res) => {
    const { id } = req.query;
    const task = tasks.find(t => t.id === parseInt(id));
    if (task) {
        res.status(200).send(task);
    } else {
        res.status(404).send({ success: false, message: 'Tarea no encontrada' });
    }
});

// Endpoint para actualizar el estado de una tarea
app.post('/updateTaskStatus', (req, res) => {
    const { taskId, newStatus } = req.body;
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
        task.status = newStatus;
        res.status(200).send({ success: true, message: 'Estado de la tarea actualizado' });
    } else {
        res.status(404).send({ success: false, message: 'Tarea no encontrada' });
    }
});

// Endpoint para eliminar una tarea
app.post('/deleteTask', (req, res) => {
    const { taskId } = req.body;
    tasks = tasks.filter(task => task.id !== taskId);
    res.status(200).send({ success: true, message: 'Tarea eliminada' });
});

// Endpoint para buscar tareas
app.post('/searchTasks', (req, res) => {
    const { name, address, phone, email, startDate, endDate } = req.body;
    const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return (
            (!name || task.clientName.includes(name)) &&
            (!address || task.clientAddress.includes(address)) &&
            (!phone || task.clientPhone.includes(phone)) &&
            (!email || task.clientEmail.includes(email)) &&
            (!start || taskDate >= start) &&
            (!end || taskDate <= end)
        );
    });
    res.status(200).send(filteredTasks);
});

// Endpoint para obtener el perfil de usuario
app.get('/getUserProfile', (req, res) => {
    const { username } = req.query;
    const user = findUser(username);
    if (user) {
        res.status(200).send({
            name: user.name || '',
            surname: user.surname || '',
            email: user.email || '',
            phone: user.phone || '',
            profilePicture: user.profilePicture || 'default-profile.png'
        });
    } else {
        res.status(404).send({ success: false, message: 'Usuario no encontrado' });
    }
});

// Endpoint para actualizar el perfil de usuario
app.post('/updateUserProfile', upload.single('profilePicture'), (req, res) => {
    const { username, name, surname, email, phone, password } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;
    const user = findUser(username);
    if (user) {
        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        if (password) {
            user.password = password;
        }
        if (profilePicture) {
            user.profilePicture = profilePicture;
        }
        res.status(200).send({ success: true, message: 'Perfil actualizado' });
    } else {
        res.status(404).send({ success: false, message: 'Usuario no encontrado' });
    }
});

// Endpoint para cambiar la contraseña
app.post('/changePassword', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const user = findUser(username);
    if (user && user.password === oldPassword) {
        user.password = newPassword;
        res.status(200).send({ success: true, message: 'Contraseña cambiada' });
    } else {
        res.status(400).send({ success: false, message: 'Contraseña actual incorrecta' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

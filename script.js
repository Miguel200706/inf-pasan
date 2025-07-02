// Objeto para almacenar las referencias a las pestañas
const chapterWindows = {
    cap1: null,
    cap2: null,
    cap3: null,
    cap4: null
};

// Función para abrir/controlar las pestañas de capítulos
function openChapter(url, windowName) {
    // Si la pestaña ya existe y no está cerrada
    if (chapterWindows[windowName] && !chapterWindows[windowName].closed) {
        // Enfoca la pestaña existente
        chapterWindows[windowName].focus();
        // Recarga el contenido para asegurar que esté actualizado
        chapterWindows[windowName].location.href = url;
    } else {
        // Abre una nueva pestaña y guarda la referencia
        chapterWindows[windowName] = window.open(url, windowName);
        
        // Verifica si el navegador bloqueó la apertura
        if (!chapterWindows[windowName] || chapterWindows[windowName].closed || typeof chapterWindows[windowName].closed == 'undefined') {
            // Si fue bloqueada, muestra alerta y abre en la misma pestaña
            if (confirm('Las ventanas emergentes están bloqueadas. ¿Deseas abrir el capítulo en esta pestaña?')) {
                window.location.href = url;
            }
        }
    }
}

// Persistencia del tema entre capítulos
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    
    // Configurar botón de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        
        // Actualizar icono inicial
        updateThemeIcon(icon, savedTheme);
        
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            // Guardar preferencia
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Actualizar icono
            updateThemeIcon(icon, isDark ? 'dark' : 'light');
            
            // Aplicar a todas las páginas abiertas
            broadcastThemeChange(isDark ? 'dark' : 'light');
        });
    }
    
    // Escuchar cambios de tema desde otras pestañas
    window.addEventListener('storage', function(e) {
        if (e.key === 'theme') {
            document.body.classList.toggle('dark-mode', e.newValue === 'dark');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) updateThemeIcon(icon, e.newValue);
        }
    });
});

function updateThemeIcon(icon, theme) {
    if (theme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
        icon.style.color = '#FFD700'; // Dorado para el sol
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        icon.style.color = ''; // Resetear color
    }
}

function broadcastThemeChange(theme) {
    // Enviar mensaje a otras pestañas del mismo dominio
    localStorage.setItem('theme', theme);
    
    // Para comunicación en tiempo real entre pestañas
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('theme_channel');
        channel.postMessage({ theme: theme });
    }
}

// Transición entre páginas
document.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.href && !this.target === '_blank') {
            document.body.classList.add('page-transition');
            setTimeout(() => {
                window.location.href = this.href;
            }, 500);
        }
    });
});
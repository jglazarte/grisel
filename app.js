// Registra Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('ServiceWorker registrado:', reg.scope);
    }).catch(err => {
      console.log('Fallo en ServiceWorker:', err);
    });
  });
}

// Variables Globales
let usuario = localStorage.getItem('NutriAzul_Usuario');
let altura = localStorage.getItem('NutriAzul_Altura');
let historialPesos = JSON.parse(localStorage.getItem('NutriAzul_Pesos')) || [];
let historialAlimentos = JSON.parse(localStorage.getItem('NutriAzul_Comidas')) || [];
let historialActividades = JSON.parse(localStorage.getItem('NutriAzul_Actividades')) || [];

// DOM Elements
const modalOnboarding = document.getElementById('onboarding-modal');
const formOnboarding = document.getElementById('form-onboarding');
const userNameDisplay = document.getElementById('user-name-display');
const userImcDisplay = document.getElementById('user-imc-display');

// Nav Elements
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');

// --- INICIALIZACIÓN ---
function init() {
  if (!usuario || !altura) {
    modalOnboarding.classList.remove('hidden');
  } else {
    userNameDisplay.textContent = usuario;
    renderPesos();
    renderAlimentos();
    renderActividades();
    actualizarIMCDestacado();
  }
}

// --- ONBOARDING ---
formOnboarding.addEventListener('submit', (e) => {
  e.preventDefault();
  usuario = document.getElementById('onboard-nombre').value.trim();
  altura = document.getElementById('onboard-altura').value;
  
  if(usuario && altura) {
    localStorage.setItem('NutriAzul_Usuario', usuario);
    localStorage.setItem('NutriAzul_Altura', altura);
    modalOnboarding.classList.add('hidden');
    userNameDisplay.textContent = usuario;
  }
});

// --- LOGO (Editar Perfil) ---
const logoHeader = document.getElementById('logo-header');
if (logoHeader) {
  logoHeader.addEventListener('click', () => {
    document.getElementById('onboard-nombre').value = usuario || '';
    document.getElementById('onboard-altura').value = altura || '';
    modalOnboarding.classList.remove('hidden');
  });
}

// --- NAVEGACIÓN ---
navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Quitar activo a todos
    navItems.forEach(n => n.classList.remove('active'));
    screens.forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    
    // Activar clickeado
    item.classList.add('active');
    const targetId = item.getAttribute('data-target');
    const targetScreen = document.getElementById(targetId);
    targetScreen.classList.remove('hidden');
    // Pequeño timeout para animación
    setTimeout(() => targetScreen.classList.add('active'), 10);
  });
});

// --- FUNCIONES AUXILIARES ---
function calcularIMC(peso, alturaCm) {
  const alturaM = alturaCm / 100;
  return (peso / (alturaM * alturaM)).toFixed(1);
}

function formatearFecha(fechaStr) {
  const partes = fechaStr.split('-');
  if(partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // DD/MM/YYYY
  }
  return fechaStr;
}

// --- PANTALLA PRINCIPAL (PESO E IMC) ---
const formPeso = document.getElementById('form-peso');
formPeso.addEventListener('submit', (e) => {
  e.preventDefault();
  const fecha = document.getElementById('peso-fecha').value;
  const peso = parseFloat(document.getElementById('peso-kg').value);
  
  if(fecha && peso) {
    const imc = calcularIMC(peso, altura);
    const registro = {
      fecha: formatearFecha(fecha),
      peso: peso,
      imc: imc
    };
    
    historialPesos.push(registro);
    localStorage.setItem('NutriAzul_Pesos', JSON.stringify(historialPesos));
    
    renderPesos();
    actualizarIMCDestacado();
    formPeso.reset();
  }
});

function renderPesos() {
  const lista = document.getElementById('lista-pesos');
  lista.innerHTML = '';
  // Mostrar invertido (más recientes primero)
  const copiaInvertida = [...historialPesos].reverse();
  copiaInvertida.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><span class="li-date">${item.fecha}</span> | Peso: ${item.peso}kg</span>
      <strong>IMC: ${item.imc}</strong>
    `;
    lista.appendChild(li);
  });
}

function actualizarIMCDestacado() {
  if (historialPesos.length > 0) {
    const ultimo = historialPesos[historialPesos.length - 1];
    userImcDisplay.textContent = ultimo.imc;
  } else {
    userImcDisplay.textContent = '--';
  }
}

// --- PANTALLA ALIMENTACIÓN ---
const formAlimento = document.getElementById('form-alimento');
formAlimento.addEventListener('submit', (e) => {
  e.preventDefault();
  const fecha = document.getElementById('alimento-fecha').value;
  const hora = document.getElementById('alimento-hora').value;
  const desc = document.getElementById('alimento-desc').value.trim();
  
  if(fecha && hora && desc) {
    const registro = {
      fecha: formatearFecha(fecha),
      hora: hora,
      desc: desc
    };
    historialAlimentos.push(registro);
    localStorage.setItem('NutriAzul_Comidas', JSON.stringify(historialAlimentos));
    
    renderAlimentos();
    // Limpiar solo descripción, mantener fecha/hora
    document.getElementById('alimento-desc').value = '';
  }
});

function renderAlimentos() {
  const lista = document.getElementById('lista-alimentos');
  lista.innerHTML = '';
  const copiaInvertida = [...historialAlimentos].reverse();
  copiaInvertida.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><span class="li-date">${item.fecha} ${item.hora}</span> | ${item.desc}</span>
    `;
    lista.appendChild(li);
  });
}

// --- PANTALLA ACTIVIDAD ---
const formActividad = document.getElementById('form-actividad');
formActividad.addEventListener('submit', (e) => {
  e.preventDefault();
  const fecha = document.getElementById('actividad-fecha').value;
  const duracion = document.getElementById('actividad-duracion').value.trim();
  const desc = document.getElementById('actividad-desc').value.trim();
  
  if(fecha && duracion && desc) {
    const registro = {
      fecha: formatearFecha(fecha),
      hora: duracion, // Usamos la propiedad hora para almacenar la duración por compatibilidad
      desc: desc
    };
    historialActividades.push(registro);
    localStorage.setItem('NutriAzul_Actividades', JSON.stringify(historialActividades));
    
    renderActividades();
    document.getElementById('actividad-desc').value = '';
    document.getElementById('actividad-duracion').value = '';
  }
});

function renderActividades() {
  const lista = document.getElementById('lista-actividades');
  lista.innerHTML = '';
  const copiaInvertida = [...historialActividades].reverse();
  copiaInvertida.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span><span class="li-date">${item.fecha} (${item.hora})</span> | ${item.desc}</span>
    `;
    lista.appendChild(li);
  });
}

// --- VACIAR REGISTROS ---
const btnVaciarAlimentos = document.getElementById('btn-vaciar-alimentos');
if (btnVaciarAlimentos) {
  btnVaciarAlimentos.addEventListener('click', () => {
    if(confirm('¿Estás seguro de que quieres borrar todo el historial de alimentación?')) {
      historialAlimentos = [];
      localStorage.removeItem('NutriAzul_Comidas');
      renderAlimentos();
    }
  });
}

const btnVaciarActividades = document.getElementById('btn-vaciar-actividades');
if (btnVaciarActividades) {
  btnVaciarActividades.addEventListener('click', () => {
    if(confirm('¿Estás seguro de que quieres borrar todo el historial de actividades?')) {
      historialActividades = [];
      localStorage.removeItem('NutriAzul_Actividades');
      renderActividades();
    }
  });
}

// --- EXPORTAR / COMPARTIR ---
function compartirReporte(tipo) {
  let texto = `Reporte NutriAzul de: ${usuario}\n\n`;
  
  if (tipo === 'completo' || tipo === 'actividad') {
    texto += `💪 ACTIVIDAD FÍSICA:\n`;
    historialActividades.forEach(a => texto += `[${a.fecha} ${a.hora}] ${a.desc}\n`);
    texto += `\n`;
  }
  if (tipo === 'completo' || tipo === 'alimentacion') {
    texto += `🍎 ALIMENTACIÓN:\n`;
    historialAlimentos.forEach(a => texto += `[${a.fecha} ${a.hora}] ${a.desc}\n`);
    texto += `\n`;
  }
  if (tipo === 'completo') {
    texto += `📈 PESOS e IMC:\n`;
    historialPesos.forEach(p => texto += `[${p.fecha}] Peso: ${p.peso}kg | IMC: ${p.imc}\n`);
    texto += `\n-------------------\nGenerado desde la App Nutriazul\n-------------------`;
  }

  if (navigator.share) {
    navigator.share({
      title: 'Reporte NutriAzul',
      text: texto
    }).catch(console.error);
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(texto).then(() => {
      alert('Reporte copiado al portapapeles. ¡Pégalo en WhatsApp o tu app favorita!');
    });
  }
}

document.getElementById('btn-compartir').addEventListener('click', () => compartirReporte('completo'));
document.getElementById('btn-exportar-alimentos').addEventListener('click', () => compartirReporte('alimentacion'));
document.getElementById('btn-exportar-actividades').addEventListener('click', () => compartirReporte('actividad'));

// --- CALENDARIO ---
const btnCalendario = document.getElementById('btn-calendario');
if (btnCalendario) {
  btnCalendario.addEventListener('click', () => {
    // Abrir la aplicación nativa de calendario
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      // Intenta abrir el calendario de iOS
      window.location.href = 'calshow://';
    } else {
      // Fallback a Google Calendar en la web para otros dispositivos
      window.open('https://calendar.google.com/calendar/r/eventedit?text=Turno+NutriAzul&details=Mi+pr%C3%B3ximo+turno+de+nutrici%C3%B3n+con+NutriAzul', '_blank');
    }
  });
}

// Iniciar app
init();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path')
const fs = require('fs');
const uri = 'mongodb+srv://Admin:2LeHtkUUhgmCUx48@cumplemaria.ljsh7k7.mongodb.net/?retryWrites=true&w=majority&appName=CumpleMaria';
const QRCode = require('qrcode'); 


const qrFolder = path.join(__dirname, 'QR');
if (!fs.existsSync(qrFolder)) {
  fs.mkdirSync(qrFolder);
}
// Middleware para permitir recibir datos JSON
app.use(express.json());

// Configuración de MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});


const UsuarioSchema = new mongoose.Schema({
  _id: String,
  copas: { type: Number, default: 3 },
  bebidas: { type: Number, default: 5 }
});



const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;

async function crearUsuarios() {
    const usuarios = [];
  
    for (let i = 1; i <= 70; i++) {
      usuarios.push({
        _id:'Id'+i,
        copas: 3,  // Copas aleatorias entre 0 y 9
        bebidas: 5  // Bebidas aleatorias entre 0 y 4
      });
      try {
        
  
        const qrPath = path.join(qrFolder, `usuario_Id${i}.png`);
        const qrData = `http://localhost:3000/index/Id${i}`;
        await QRCode.toFile(qrPath, qrData);
  
        console.log(`✅ QR generado para usuario_Id${i} en: QR/usuario_Id${i}.png`);
      } catch (err) {
        console.error('❌ Error al crear usuario o QR:', err);
      }
      
    }

    usuarios.push({
        _id:'Id98',
        copas: 10,  // Copas aleatorias entre 0 y 9
        bebidas: 10  // Bebidas aleatorias entre 0 y 4
      });
    usuarios.push({
    _id:'Id99',
    copas: 10,  // Copas aleatorias entre 0 y 9
    bebidas: 10  // Bebidas aleatorias entre 0 y 4
    });
  
    try {
      // Insertar los 70 usuarios en la colección
      const resultado = await Usuario.insertMany(usuarios);
      console.log('✅ 70 usuarios creados exitosamente:', resultado);
    } catch (err) {
      console.error('❌ Error al insertar usuarios:', err);
    }
}

async function deleteUsuarios() {
    try {
      const resultado = await Usuario.deleteMany({});
      console.log('✅ ' + resultado.deletedCount + ' usuarios borrados exitosamente');
    } catch (err) {
      console.error('❌ Error al borrar usuarios:', err);
    }
  }
  

app.post('/iniciarSesion', async (req, res) => {
    const {contraseña}  = req.body;
    console.log("contraseña server -> " + contraseña);
    try{
        if(contraseña === "CumpleMaria182025"){
            res.json({
            mensaje: `ok`,
            ok: true
          });
        }else{
            res.status(401).json({ message: 'Contraseña incorrecta' });
        }
    }catch (err) {
          console.error('No se pudo inicar sesion:', err);
          res.status(500).json({ error: 'Error interno del servidor' });
    }
    

});

app.get('/delete808', (req, res) => {
    deleteUsuarios();
    res.sendFile(path.join(__dirname, 'delete.html'));
});

app.get('/start808', (req, res) => {
    crearUsuarios();
    res.sendFile(path.join(__dirname, 'start.html'));
});

app.get('/reload808', (req, res) => {
    deleteUsuarios();
    crearUsuarios();
    res.sendFile(path.join(__dirname, 'reload.html'));
});

app.get('/index/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
  });

app.get('/api/index/:id', async (req, res) => {
const { id } = req.params;
try {
    const usuario = await Usuario.findById(id);
    console.log(usuario);
    if (usuario) {
    res.json({
        copas: usuario.copas,
        bebidas: usuario.bebidas,
    });
    } else {
    res.status(404).send('Usuario no encontrado');
    }
} catch (error) {
    res.status(500).send('Error al buscar el usuario');
}
});


app.get('/index', async (req, res) => {
    try {
      const usuarios = await Usuario.find({});
      res.json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: 'Error al listar usuarios' });
    }
});
  




// Ruta para quitar copas al jugador
app.post('/quitar-copas', async (req, res) => {
  const { id, cantidad = 1 } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si las copas restantes son suficientes para quitar
    if (usuario.copas < cantidad) {
      return res.status(400).json({ error: 'No hay suficientes copas para quitar' });
    }

    const usuarioActualizado  = await Usuario.findByIdAndUpdate(
      id,
      { $inc: { copas: -cantidad } },
      { new: true }
    );

    res.json({
      mensaje: `Se quitaron ${cantidad} copa al usuario`,
      usuarioActualizado
    });
  } catch (err) {
    console.error('Error al quitar copa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para quitar bebidas al jugador
app.post('/quitar-bebidas', async (req, res) => {
    const { id, cantidad = 1 } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si las copas restantes son suficientes para quitar
    if (usuario.bebidas < cantidad) {
      return res.status(400).json({ error: 'No hay suficientes bebidas para quitar' });
    }

    const usuarioActualizado  = await Usuario.findByIdAndUpdate(
      id,
      { $inc: { bebidas: -cantidad } },
      { new: true }
    );

    res.json({
      mensaje: `Se quitaron ${cantidad} bebida al usuario`,
      usuarioActualizado
    });
  } catch (err) {
    console.error('Error al quitar copa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
  });


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

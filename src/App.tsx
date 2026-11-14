import './App.css';

/**
 * Shell del dashboard de ORBIT-CLEAN X.
 *
 * Scaffold inicial: aquí se integran los módulos del equipo
 * (src/modules/orbital, src/modules/pilot, ...). El estado global
 * compartido entre módulos (selección, puntaje, carga capturada) vive
 * aquí y se pasa hacia abajo por props.
 */
function App() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ORBIT-CLEAN X</h1>
      </header>
      <main className="dashboard-body">
        {/* Los módulos del equipo se integran aquí */}
      </main>
    </div>
  );
}

export default App;

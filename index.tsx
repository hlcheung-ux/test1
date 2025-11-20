(function() {
  console.log("Mounting React App...");

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const App = window.GameApp.App;
  const ReactDOM = window.ReactDOM;
  const React = window.React;

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
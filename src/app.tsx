import * as React from 'react';
import * as ReactDOM from 'react-dom';

const App = (): JSX.Element => {
  return (
    <div id="monaco-container"></div>
  )
}
function render() {
  ReactDOM.render(<App />, document.getElementById('container'));
}

render();

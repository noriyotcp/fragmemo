import * as React from 'react';
import * as ReactDOM from 'react-dom';

const App = (): JSX.Element => {
  return (
    <h2>Hello from React!</h2>
  )
}
function render() {
  ReactDOM.render(<App />, document.getElementById('container'));
}

render();

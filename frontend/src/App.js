import React, { useState, useRef } from 'react';
import './App.css';
import Graph from './components/Graph';

function App() {
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const graphRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputText.trim() && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send text to backend
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: inputText
      }));
      
      // Clear input
      setInputText('');
    }
  };

  const handleClear = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'clear'
      }));
    }
  };

  const handleExampleClick = (exampleText) => {
    setInputText(exampleText);
  };

  const examples = [
    "John bought a new car from the dealership.",
    "Apple released a new iPhone. The company announced record sales.",
    "The scientist discovered a new planet orbiting a distant star.",
    "Sarah works for Microsoft. She manages the Azure team in Seattle.",
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗺️ Text Relation Map Visualizer</h1>
        <p className="subtitle">
          Visualize entities and relationships in real-time
        </p>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div className="main-container">
        <div className="control-panel">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to analyze (e.g., 'John loves Mary. Mary works at Google.')"
              className="text-input"
              rows="4"
            />
            <div className="button-group">
              <button 
                type="submit" 
                className="submit-button"
                disabled={!isConnected || !inputText.trim()}
              >
                Add to Map
              </button>
              <button 
                type="button" 
                onClick={handleClear}
                className="clear-button"
                disabled={!isConnected}
              >
                Clear Map
              </button>
            </div>
          </form>

          <div className="examples-section">
            <h3>Try these examples:</h3>
            <div className="examples-list">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="example-button"
                  disabled={!isConnected}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="instructions">
            <h3>How to use:</h3>
            <ol>
              <li>Enter text containing entities and relationships</li>
              <li>Click "Add to Map" to visualize the connections</li>
              <li>Add more text to expand the relationship map</li>
              <li>Click "Clear Map" to start fresh</li>
            </ol>
          </div>
        </div>

        <div className="visualization-panel">
          <Graph 
            wsRef={wsRef} 
            graphRef={graphRef}
            onConnectionChange={setIsConnected}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

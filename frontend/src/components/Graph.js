import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import './Graph.css';

// Register the layout
cytoscape.use(coseBilkent);

const Graph = ({ wsRef, graphRef, onConnectionChange }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    // Initialize Cytoscape
    if (containerRef.current && !cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#667eea',
              'label': 'data(label)',
              'color': '#333',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'font-weight': 'bold',
              'width': 'label',
              'height': 'label',
              'padding': '12px',
              'shape': 'roundrectangle',
              'border-width': 2,
              'border-color': '#5568d3',
              'text-wrap': 'wrap',
              'text-max-width': '100px',
              'transition-property': 'background-color, border-color',
              'transition-duration': '0.3s'
            }
          },
          {
            selector: 'node[type="PERSON"]',
            style: {
              'background-color': '#4caf50',
              'border-color': '#388e3c'
            }
          },
          {
            selector: 'node[type="ORG"]',
            style: {
              'background-color': '#ff9800',
              'border-color': '#f57c00'
            }
          },
          {
            selector: 'node[type="GPE"]',
            style: {
              'background-color': '#2196f3',
              'border-color': '#1976d2'
            }
          },
          {
            selector: 'node[type="PRODUCT"]',
            style: {
              'background-color': '#e91e63',
              'border-color': '#c2185b'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#ffd700'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#999',
              'target-arrow-color': '#999',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '10px',
              'text-background-color': '#fff',
              'text-background-opacity': 0.8,
              'text-background-padding': '3px',
              'text-rotation': 'autorotate',
              'color': '#555'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#ffd700',
              'target-arrow-color': '#ffd700',
              'width': 5
            }
          }
        ],

        layout: {
          name: 'cose-bilkent',
          animate: true,
          animationDuration: 500,
          nodeDimensionsIncludeLabels: true,
          idealEdgeLength: 150,
          nodeRepulsion: 4500,
          edgeElasticity: 0.45,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          randomize: false
        },

        minZoom: 0.3,
        maxZoom: 3,
        wheelSensitivity: 0.2
      });

      // Add event listeners for interactivity
      cyRef.current.on('tap', 'node', function(evt) {
        const node = evt.target;
        console.log('Node clicked:', node.data());
      });

      cyRef.current.on('tap', 'edge', function(evt) {
        const edge = evt.target;
        console.log('Edge clicked:', edge.data());
      });

      // Store reference
      if (graphRef) {
        graphRef.current = cyRef.current;
      }
    }

    // Setup WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
      onConnectionChange(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      onConnectionChange(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onConnectionChange(false);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'initial' || message.type === 'update') {
        const { nodes, edges } = message.data;
        
        if (cyRef.current) {
          // Add new nodes
          nodes.forEach(node => {
            if (!cyRef.current.getElementById(node.data.id).length) {
              cyRef.current.add(node);
            }
          });

          // Add new edges
          edges.forEach(edge => {
            if (!cyRef.current.getElementById(edge.data.id).length) {
              cyRef.current.add(edge);
            }
          });

          // Run layout for new elements or all elements
          const layout = cyRef.current.layout({
            name: 'cose-bilkent',
            animate: true,
            animationDuration: 500,
            nodeDimensionsIncludeLabels: true,
            idealEdgeLength: 150,
            nodeRepulsion: 4500,
            edgeElasticity: 0.45,
            gravity: 0.25,
            numIter: 2500,
            tile: true,
            randomize: false,
            fit: true,
            padding: 50
          });
          
          layout.run();
        }
      } else if (message.type === 'clear') {
        if (cyRef.current) {
          cyRef.current.elements().remove();
        }
      }
    };

    wsRef.current = ws;

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [wsRef, graphRef, onConnectionChange]);

  return (
    <div className="graph-container">
      <div ref={containerRef} className="cytoscape-container"></div>
      <div className="graph-legend">
        <h4>Entity Types:</h4>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#4caf50'}}></span>
          <span>Person</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#ff9800'}}></span>
          <span>Organization</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#2196f3'}}></span>
          <span>Location</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#e91e63'}}></span>
          <span>Product</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#667eea'}}></span>
          <span>Other</span>
        </div>
      </div>
    </div>
  );
};

export default Graph;

# Text Relation Map Visualizer

A real-time web application that visualizes text as an interactive relation map. The app uses Natural Language Processing (NLP) to identify entities (objects), actions, and relationships between entities, then displays them as an interactive graph that updates in real-time.

![App Screenshot](https://via.placeholder.com/800x400?text=Text+Relation+Map+Visualizer)

## Features

- 🔍 **Real-time NLP Processing**: Extracts entities and relationships from text using spaCy
- 🗺️ **Interactive Graph Visualization**: Beautiful, interactive node-link diagrams using Cytoscape.js
- ⚡ **Real-time Updates**: WebSocket communication for instant graph updates
- 🎨 **Color-coded Entities**: Different colors for different entity types (Person, Organization, Location, etc.)
- 🔄 **Dynamic Layout**: Automatic graph layout that adapts as new data is added
- 📝 **Example Sentences**: Pre-built examples to get started quickly

## Technology Stack

### Backend
- **Python 3.8+**
- **FastAPI**: Modern, fast web framework for building APIs
- **spaCy**: Industrial-strength NLP library for entity and relation extraction
- **WebSockets**: Real-time bidirectional communication

### Frontend
- **React 18**: JavaScript library for building user interfaces
- **Cytoscape.js**: Graph theory library for visualization
- **WebSocket API**: Real-time communication with backend

## Project Structure

```
Visual/
├── backend/
│   ├── main.py              # FastAPI application with WebSocket endpoint
│   ├── requirements.txt     # Python dependencies
│   └── .gitignore          # Git ignore rules for Python
│
└── frontend/
    ├── public/
    │   └── index.html       # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Graph.js     # Cytoscape.js visualization component
    │   │   └── Graph.css    # Graph styling
    │   ├── App.js           # Main React component
    │   ├── App.css          # App styling
    │   ├── index.js         # React entry point
    │   └── index.css        # Global styles
    ├── package.json         # Node dependencies
    └── .gitignore          # Git ignore rules for Node
```

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Download the spaCy language model:
```bash
python -m spacy download en_core_web_sm
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

From the `backend` directory:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### Start the Frontend Development Server

From the `frontend` directory:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Usage

1. **Enter Text**: Type or paste text into the input field. The text should contain entities and relationships (e.g., "John works at Microsoft. Microsoft is located in Seattle.")

2. **Add to Map**: Click the "Add to Map" button to process the text and update the visualization

3. **Try Examples**: Click any of the pre-built example sentences to see how the app works

4. **Interact with the Graph**: 
   - Click and drag nodes to rearrange them
   - Scroll to zoom in/out
   - Click on nodes or edges to highlight them

5. **Clear Map**: Click "Clear Map" to reset the visualization and start fresh

## How It Works

### NLP Processing Pipeline

1. **Text Input**: User enters text via the web interface
2. **WebSocket Transmission**: Text is sent to the backend through a WebSocket connection
3. **Entity Recognition**: spaCy's NER identifies entities (people, organizations, locations, etc.)
4. **Dependency Parsing**: spaCy analyzes grammatical structure to find relationships
5. **Graph Construction**: Entities become nodes, relationships become edges
6. **Real-time Update**: Graph data is sent back to all connected clients
7. **Visualization**: Cytoscape.js renders the updated graph with automatic layout

### Entity Types

The application recognizes and color-codes several entity types:
- 🟢 **PERSON**: People, including fictional characters
- 🟠 **ORG**: Organizations, companies, agencies, institutions
- 🔵 **GPE**: Geopolitical entities (countries, cities, states)
- 🔴 **PRODUCT**: Objects, vehicles, foods, etc.
- 🟣 **Other**: Miscellaneous entities and concepts

## API Endpoints

### REST Endpoints

- `GET /`: Health check and API information
- `GET /health`: Detailed health status with active clients and graph statistics

### WebSocket Endpoint

- `WS /ws`: WebSocket connection for real-time communication

#### WebSocket Message Types

**Client → Server:**
```json
{
  "type": "text",
  "text": "Your input text here"
}
```

```json
{
  "type": "clear"
}
```

**Server → Client:**
```json
{
  "type": "initial",
  "data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

```json
{
  "type": "update",
  "data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

```json
{
  "type": "clear"
}
```

## Customization

### Adding Custom Entity Types

Edit the `extract_entities_and_relations` function in `backend/main.py` to recognize additional entity types.

### Styling the Graph

Modify the Cytoscape.js style configuration in `frontend/src/components/Graph.js` to change node colors, sizes, edge styles, etc.

### Changing the Layout Algorithm

Replace `cose-bilkent` with another Cytoscape.js layout algorithm (e.g., `cola`, `dagre`, `fcose`) in `Graph.js`.

## Troubleshooting

### Backend Issues

**Error: "No module named 'spacy'"**
- Solution: Make sure you've activated your virtual environment and installed dependencies

**Error: "Can't find model 'en_core_web_sm'"**
- Solution: Run `python -m spacy download en_core_web_sm`

**WebSocket connection fails**
- Solution: Ensure the backend server is running on port 8000 and CORS is properly configured

### Frontend Issues

**Blank screen or errors**
- Solution: Check the browser console for errors and ensure all npm dependencies are installed

**WebSocket won't connect**
- Solution: Verify the backend server is running and the WebSocket URL in `Graph.js` matches your backend address

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Custom entity and relationship training
- [ ] Graph export (JSON, PNG, SVG)
- [ ] Collaborative editing with multiple users
- [ ] Historical graph versioning
- [ ] Advanced filtering and search
- [ ] Graph analytics and statistics
- [ ] Dark mode support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [spaCy](https://spacy.io/) for the powerful NLP capabilities
- [FastAPI](https://fastapi.tiangolo.com/) for the modern Python web framework
- [Cytoscape.js](https://js.cytoscape.org/) for the excellent graph visualization library
- [React](https://reactjs.org/) for the component-based UI framework
